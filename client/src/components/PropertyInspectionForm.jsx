"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { updateInspection } from "../redux/slices/inspectionSlice"

export default function PropertyInspectionForm({ property, inspections, onClose }) {
  const dispatch = useDispatch()
  
  // Find the inspection for this property
  const propertyInspection = inspections?.find(insp => insp.property_id === property?.id) || null
  
  const [notes, setNotes] = useState(propertyInspection?.notes || "")
  const [amenities, setAmenities] = useState({
    cooler: false,
    ac: false,
    lighting: false,
    plumbing: false,
    electrical: false,
    security: false
  })
  const [customAmenities, setCustomAmenities] = useState([])
  const [newAmenity, setNewAmenity] = useState({ name: "", status: false, message: "" })
  const [progress, setProgress] = useState(propertyInspection?.progress || 0)
  
  // Photo upload and location states
  const [currentLocation, setCurrentLocation] = useState(null)
  const [photos, setPhotos] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  
  // Legacy camera states - kept for backward compatibility
  // These will be removed in future updates
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  
  // Parse existing inspection data if available
  useEffect(() => {
    if (propertyInspection?.notes) {
      setNotes(propertyInspection.notes)
    }
    
    // Try to parse existing amenities data from notes or other fields
    try {
      if (propertyInspection?.inspection_items) {
        const items = propertyInspection.inspection_items
        // Set standard amenities
        const standardAmenities = {}
        const customItems = []
        
        items.forEach(item => {
          if (['cooler', 'ac', 'lighting', 'plumbing', 'electrical', 'security'].includes(item.name.toLowerCase())) {
            standardAmenities[item.name.toLowerCase()] = item.status === 'working'
          } else {
            customItems.push({
              name: item.name,
              status: item.status === 'working',
              message: item.notes || ''
            })
          }
        })
        
        if (Object.keys(standardAmenities).length > 0) {
          setAmenities({ ...amenities, ...standardAmenities })
        }
        
        if (customItems.length > 0) {
          setCustomAmenities(customItems)
        }
      }
    } catch (error) {
      console.error("Error parsing inspection data:", error)
    }
  }, [propertyInspection])
  
  // Calculate progress whenever amenities change
  useEffect(() => {
    const standardAmenitiesCount = Object.keys(amenities).length
    const checkedStandardCount = Object.values(amenities).filter(Boolean).length
    const customAmenitiesCount = customAmenities.length
    const checkedCustomCount = customAmenities.filter(item => item.status).length
    
    const totalItems = standardAmenitiesCount + customAmenitiesCount
    const totalChecked = checkedStandardCount + checkedCustomCount
    
    const calculatedProgress = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0
    setProgress(calculatedProgress)
  }, [amenities, customAmenities])
  
  const handleAmenityChange = (name) => {
    setAmenities(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }
  
  const handleCustomAmenityChange = (index, field, value) => {
    setCustomAmenities(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }
  
  const addCustomAmenity = () => {
    if (newAmenity.name.trim()) {
      setCustomAmenities(prev => [...prev, { ...newAmenity }])
      setNewAmenity({ name: "", status: false, message: "" })
    }
  }
  
  const removeCustomAmenity = (index) => {
    setCustomAmenities(prev => prev.filter((_, i) => i !== index))
  }
  
  // Camera and photo capture functions
  // Add a debug function to check camera capabilities
  // This function is no longer needed since we're using file upload instead of camera
  // Keeping it for backward compatibility but simplified
  const checkCameraCapabilities = async () => {
    console.log("Camera capabilities check skipped - using file upload instead")
    return false // Always return false to prevent camera initialization
  }

  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString(),
            };
            setCurrentLocation(locationData);
            console.log("Location obtained:", position.coords.latitude, position.coords.longitude);
            resolve(locationData);
          },
          (error) => {
            console.error("Error getting location:", error);
            alert("Unable to get your location. Please check permissions.");
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        const error = new Error("Geolocation is not supported by this browser.");
        alert(error.message);
        reject(error);
      }
    });
  };
  
  const handlePhotoUpload = async () => {
    try {
      // First get location
      setIsUploading(true);
      const locationData = await getLocation().catch(error => {
        console.error("Failed to get location:", error);
        // Continue without location if user denies permission
        return null;
      });
      
      // Trigger file input click
      fileInputRef.current.click();
    } catch (error) {
      console.error("Error in photo upload process:", error);
      alert("Error preparing photo upload: " + error.message);
      setIsUploading(false);
    }
  };
  
  const processUploadedFile = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) {
        setIsUploading(false);
        return;
      }
      
      console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
      
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file (JPEG, PNG, etc).");
        setIsUploading(false);
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image is too large. Please select an image smaller than 10MB.");
        setIsUploading(false);
        return;
      }
      
      // Create a new photo object
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoDataUrl = e.target.result;
        
        // Create new photo object with location data
        const newPhoto = {
          id: `photo_${Date.now()}`,
          dataUrl: photoDataUrl,
          timestamp: new Date().toISOString(),
          location: currentLocation,
          fileName: file.name
        };
        
        setPhotos(prev => [...prev, newPhoto]);
        console.log("Photo uploaded successfully");
        
        // Upload to server if we have an inspection ID
        if (propertyInspection?.id) {
          try {
            // Create FormData
            const formData = new FormData();
            formData.append('photo', file);
            
            if (currentLocation) {
              formData.append('latitude', currentLocation.latitude);
              formData.append('longitude', currentLocation.longitude);
              formData.append('timestamp', currentLocation.timestamp || new Date().toISOString());
            }
            
            const BASE_URL = "http://localhost:4000";
            const uploadUrl = `${BASE_URL}/api/photos/upload/${propertyInspection.id}`;
            console.log("Uploading to:", uploadUrl);
            
            // Upload to server
            try {
              const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
              });
              
              if (!uploadResponse.ok) {
                throw new Error(`Failed to upload photo: ${uploadResponse.status} ${uploadResponse.statusText}`);
              }
              
              console.log("Photo uploaded to server successfully");
            } catch (error) {
              console.error("Network error during photo upload:", error);
              throw new Error(`Network error during photo upload: ${error.message}`);
            }
          } catch (uploadError) {
            console.error("Error uploading photo to server:", uploadError);
            alert("Photo saved locally but failed to upload to server: " + uploadError.message);
          }
        }
        
        setIsUploading(false);
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("Failed to process the selected image.");
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      alert("Error processing the selected image: " + error.message);
      setIsUploading(false);
    }
  };

  const stopCamera = () => {
    // This function is kept for backward compatibility
    // and to ensure proper resource cleanup
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = async () => {
    // This function has been replaced by the file upload functionality
    // We're keeping the function signature to avoid breaking any references
    // but the implementation is now handled by processUploadedFile
    console.log("Camera capture functionality has been replaced by file upload")
    alert("Please use the Upload Photo button instead of direct camera capture")
    
    // Stop camera if it's running
    if (stream) {
      stopCamera()
    }
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }
  
  const [uploading, setUploading] = useState(false)

  const handleSave = async () => {
    if (!propertyInspection) return
    setUploading(true)
    
    try {
      // Upload photos to server if there are any
      const uploadedPhotos = []
      
      if (photos.length > 0) {
        for (const photo of photos) {
          try {
            console.log("Processing photo:", photo)
            
            // Skip empty data URLs
            if (photo.dataUrl === 'data:,' || !photo.dataUrl) {
              console.error("Empty data URL, skipping photo")
              continue
            }
            
            // Create a new Image to load the data URL
            const img = new Image()
            
            // Set up proper error handling for image loading with timeout
            const imageLoaded = await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                console.error("Image loading timed out")
                reject(new Error("Image loading timed out after 5 seconds"))
              }, 5000) // 5 second timeout
              
              img.onload = () => {
                clearTimeout(timeoutId)
                console.log("Image loaded successfully with dimensions:", img.width, "x", img.height)
                resolve(true)
              }
              img.onerror = (e) => {
                clearTimeout(timeoutId)
                console.error("Failed to load image from data URL:", e)
                reject(new Error("Failed to load image: " + (e?.message || 'Unknown error')))
              }
              img.src = photo.dataUrl
            })
            
            // Check if image has dimensions
            if (img.width === 0 || img.height === 0) {
              console.error("Image has zero dimensions")
              alert("Invalid image dimensions - width or height is zero")
              continue
            }
            
            console.log("Image dimensions:", img.width, img.height)
            
            // Create a canvas with the same dimensions as the image
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            
            // Draw the image on the canvas with white background first
            const ctx = canvas.getContext('2d', { alpha: false }) // Disable alpha for better performance
            
            // Fill with white background to prevent transparency issues
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Draw the image on top of the white background
            ctx.drawImage(img, 0, 0)
            
            // Get image data to check if it's all black or transparent
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            
            // Check if image is all black or transparent with better analysis
            let blackPixelCount = 0
            let totalPixels = data.length / 4
            let sumBrightness = 0
            
            // Sample pixels (check every 10th pixel for performance)
            for (let i = 0; i < data.length; i += 40) { // Check every 10th pixel (4 values per pixel)
              const r = data[i]
              const g = data[i+1]
              const b = data[i+2]
              
              // Calculate brightness
              const brightness = (r + g + b) / 3
              sumBrightness += brightness
              
              // Check if pixel is black or nearly black
              if (r < 20 && g < 20 && b < 20) {
                blackPixelCount++
              }
            }
            
            const sampledPixels = Math.ceil(data.length / 40 / 4)
            const blackPixelPercentage = (blackPixelCount / sampledPixels) * 100
            const averageBrightness = sumBrightness / sampledPixels
            
            console.log(`Sampled ${sampledPixels} pixels for analysis`)
            console.log(`Black pixel percentage: ${blackPixelPercentage.toFixed(2)}%`)
            console.log(`Average brightness: ${averageBrightness.toFixed(2)}/255`)
            
            if (blackPixelPercentage > 90 || averageBrightness < 30) {
              console.error("Image appears to be too dark or mostly black")
              alert("The captured image appears to be too dark. Please try again with better lighting.")
              continue
            }
            
            // Convert canvas to blob with better error handling
            const blob = await new Promise((resolve, reject) => {
              try {
                canvas.toBlob(
                  (result) => {
                    if (result) resolve(result)
                    else reject(new Error('Failed to create image blob'))
                  }, 
                  'image/jpeg', 
                  0.95 // 95% quality JPEG
                )
              } catch (error) {
                reject(new Error(`Blob creation error: ${error.message}`))
              }
            })
            
            if (!blob || blob.size === 0) {
              console.error("Generated blob is empty")
              alert("Failed to generate image data. Please try again.")
              continue
            }
            
            // Check if blob size is too small (likely a black or empty image)
            if (blob.size < 1000) { // Less than 1KB is suspicious
              console.error("Blob size too small, likely a black image:", blob.size, "bytes")
              alert("The captured image appears to be invalid (too small). Please try again.")
              continue
            }
            
            console.log("Created blob:", blob, "Size:", blob.size)
            
            // Create FormData
            const formData = new FormData()
            formData.append('photo', blob, 'photo.jpg')
            
            if (photo.location) {
              formData.append('latitude', photo.location.latitude)
              formData.append('longitude', photo.location.longitude)
              formData.append('timestamp', photo.timestamp || new Date().toISOString())
            }
            
            const BASE_URL = "http://localhost:4000"
            const uploadUrl = `${BASE_URL}/api/photos/upload/${propertyInspection.id}`
            console.log("Uploading to:", uploadUrl)
            
            // Upload to server
            const uploadResponse = await fetch(uploadUrl, {
              method: 'POST',
              body: formData
            })
            
            if (!uploadResponse.ok) {
              let errorMessage = `Failed to upload photo: ${uploadResponse.status} ${uploadResponse.statusText}`
              try {
                const errorText = await uploadResponse.text()
                errorMessage += ` - ${errorText}`
              } catch (e) {
                // Ignore error reading response text
              }
              throw new Error(errorMessage)
            }
            
            const uploadResult = await uploadResponse.json()
            console.log("Upload successful:", uploadResult)
            uploadedPhotos.push(uploadResult.data)
          } catch (error) {
            console.error("Error uploading photo:", error)
            alert(`Photo upload error: ${error.message}`)
          }
        }
      }
      
      // Prepare inspection items from amenities
      const standardItems = Object.entries(amenities).map(([name, status]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        status: status ? 'working' : 'not_working',
        notes: ''
      }))
      
      const customItems = customAmenities.map(item => ({
        name: item.name,
        status: item.status ? 'working' : 'not_working',
        notes: item.message
      }))
      
      const inspectionItems = [...standardItems, ...customItems]
      
      // Update inspection
      try {
        await dispatch(updateInspection({
          id: propertyInspection.id,
          data: {
            notes,
            progress,
            inspection_items: inspectionItems,
            photos: uploadedPhotos.length > 0 ? uploadedPhotos : photos
          }
        })).unwrap();
        
        // Success - close the form
        onClose();
      } catch (error) {
        console.error("Failed to save inspection:", error);
        alert(`Failed to save inspection: ${error.message}. Please try again with fewer photos or smaller file sizes.`);
      }
    } catch (error) {
      console.error("Failed to save inspection:", error)
      alert("Failed to save inspection. Please try again.")
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Inspect Property</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{property?.name}</h3>
            <p className="text-slate-600">{property?.address}</p>
            <div className="mt-2 flex items-center">
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-slate-700">{progress}%</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Inspection Notes</label>
            <div className="mb-2 text-sm text-slate-600">Add notes line by line for better visibility</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Add general notes about this property inspection"
            ></textarea>
            {notes && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-700 mb-2">Notes Preview</h4>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  {notes.split('\n').map((note, index) => (
                    <p key={index} className="text-slate-900 py-1 border-b border-slate-100 last:border-0">
                      {note || ' '}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Standard Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(amenities).map(([name, checked]) => (
                <div key={name} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                  <input
                    type="checkbox"
                    id={`amenity-${name}`}
                    checked={checked}
                    onChange={() => handleAmenityChange(name)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`amenity-${name}`} className="text-slate-700 capitalize">{name}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Custom Amenities</h3>
            
            {customAmenities.map((item, index) => (
              <div key={index} className="mb-4 p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.status}
                      onChange={() => handleCustomAmenityChange(index, 'status', !item.status)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <button
                    onClick={() => removeCustomAmenity(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <textarea
                  value={item.message}
                  onChange={(e) => handleCustomAmenityChange(index, 'message', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Add notes about this amenity"
                ></textarea>
              </div>
            ))}
            
            <div className="mt-4 p-4 border border-dashed border-slate-300 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={newAmenity.name}
                  onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="New amenity name"
                />
                <button
                  onClick={addCustomAmenity}
                  disabled={!newAmenity.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          
          {/* Photo Upload */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Upload Photos with Location
            </h3>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={processUploadedFile} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button
              type="button"
              onClick={handlePhotoUpload}
              disabled={isUploading}
              className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {isUploading ? 'Getting Location...' : 'Upload Photo with Location'}
            </button>
            
            {/* Camera UI will be implemented in future updates */}

            
            {/* Display captured photos */}
            {photos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-slate-700 mb-2">Captured Photos ({photos.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={photo.dataUrl}
                        alt={`Inspection photo ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      {photo.location && (
                        <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-70 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="truncate">{new Date(photo.timestamp).toLocaleString()}</div>
                          <div className="truncate">GPS: {photo.location.latitude.toFixed(4)}, {photo.location.longitude.toFixed(4)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}