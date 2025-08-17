const cloudinary = require("cloudinary").v2

/**
 * Uploads a file to Cloudinary with retry logic and support for various file types.
 * @param {Object} file - The file object from the request.
 * @param {string} folder - The folder in Cloudinary where the file will be uploaded.
 * @param {number} maxRetries - The maximum number of retry attempts.
 * @returns {Promise<string>} - The secure URL of the uploaded file.
 */
async function uploadToCloudinaryWithRetry(file, folder, maxRetries = 3) {
  const isPdf = file.mimetype === "application/pdf"
  const isImage = file.mimetype.startsWith("image/")
  const isDocument =
    file.mimetype.includes("document") ||
    file.mimetype.includes("msword") ||
    file.mimetype === "text/plain" ||
    file.mimetype === "application/rtf"

  // Configure upload options based on file type
  let options = {
    folder,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  }

  if (isPdf) {
    // PDF files - use raw resource type (but note: blocked on free plan)
    options = {
      ...options,
      resource_type: "raw",
      public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`,
      format: "pdf",
      flags: "attachment",
    }
  } else if (isImage) {
    // Image files - use image resource type
    options = {
      ...options,
      resource_type: "image",
      // Remove format: "auto" and quality: "auto" as they're causing issues
      // Cloudinary will auto-detect the format for images
    }
  } else if (isDocument) {
    // Document files (DOCX, DOC, TXT, RTF) - use raw resource type
    options = {
      ...options,
      resource_type: "raw",
      public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`,
      flags: "attachment",
    }
  } else {
    // Other files - use auto detection
    options = {
      ...options,
      resource_type: "auto",
    }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Uploading ${file.mimetype} file to Cloudinary...`)
      console.log("Upload options:", options)

      const result = await cloudinary.uploader.upload(file.tempFilePath, options)
      console.log("✅ Upload successful:", {
        secure_url: result.secure_url,
        resource_type: result.resource_type,
        format: result.format,
        public_id: result.public_id,
      })

      return result.secure_url
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message)

      // Special handling for PDF files on free plan
      if (error.message.includes("PDF") && error.message.includes("blocked")) {
        throw new Error(
          "PDF files are blocked on Cloudinary free plan. Please use JPG, PNG, DOCX, DOC, TXT, or RTF files instead.",
        )
      }

      if (attempt === maxRetries) {
        console.error("Max retries reached. Upload failed.")
        throw error
      }
      console.log("Retrying upload...")
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
}

/**
 * Enhanced middleware for handling file uploads with support for multiple file types.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const fileUploader = async (req, res, next) => {
  try {
    console.log("Middleware: Received request with files:", req.files)

    // Check for files under different possible field names
    const files = req.files?.imageFile || req.files?.resumeFile || req.files?.file

    if (!files) {
      console.log("Middleware: No files uploaded.")
      return res.status(400).json({
        success: false,
        message: "No files uploaded. Expected field names: imageFile, resumeFile, or file",
      })
    }

    const filesArray = Array.isArray(files) ? files : [files]
    console.log(`Middleware: Preparing to upload ${filesArray.length} file(s).`)

    // Supported file types (excluding PDF for free plan)
    const supportedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/msword", // DOC
      "text/plain", // TXT
      "application/rtf", // RTF
    ]

    const fileUrls = []

    // Upload files sequentially with retry logic
    for (const [index, file] of filesArray.entries()) {
      console.log(`Middleware: Uploading file ${index + 1}, temp path: ${file.tempFilePath}`)
      console.log(`File type: ${file.mimetype}, Size: ${file.size} bytes`)

      // Check if file type is supported
      if (!supportedTypes.includes(file.mimetype)) {
        console.error(`Unsupported file type: ${file.mimetype}`)
        return res.status(400).json({
          success: false,
          message: `Unsupported file type: ${file.mimetype}. Supported types: JPG, PNG, DOCX, DOC, TXT, RTF`,
          supportedTypes: supportedTypes,
        })
      }

      try {
        // Use different folder based on file type
        const folder = file.mimetype.startsWith("image/") ? "images" : "documents"
        const url = await uploadToCloudinaryWithRetry(file, folder)
        console.log(`Middleware: File ${index + 1} uploaded successfully, URL: ${url}`)
        fileUrls.push(url)
      } catch (error) {
        console.error(`Middleware: Error uploading file ${index + 1} after retries:`, error)
        return res.status(500).json({
          success: false,
          message: `Error uploading file ${index + 1}: ${file.name}`,
          error: error.message,
        })
      }
    }

    console.log("Middleware: All files uploaded successfully:", fileUrls)

    // Attach URLs to request body with multiple naming conventions for compatibility
    req.body.imageFile = fileUrls[0] // For backward compatibility
    req.body.resumeUrl = fileUrls[0] // For resume-specific uploads
    req.body.fileUrl = fileUrls[0] // Generic file URL
    req.body.fileUrls = fileUrls // All URLs if multiple files

    next()
  } catch (error) {
    console.error("Middleware: Error in fileUploader middleware:", error)
    return res.status(500).json({
      success: false,
      message: "Error in file uploader middleware",
      error: error.message,
    })
  }
}

// Export both functions - keeping imageUploader for backward compatibility
const imageUploader = fileUploader

module.exports = {
  fileUploader,
  imageUploader, // For backward compatibility
  uploadToCloudinaryWithRetry,
}
