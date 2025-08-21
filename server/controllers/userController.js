const { db } = require("../config/db")
const bcrypt = require("bcrypt")
const { sendOtpEmail } = require("../middlewares/mail")

const otpStore = new Map()
const passwordResetOtpStore = new Map()

// Function to get clients for dropdown
exports.getClientsForDropdown = (req, res) => {
  const sql = `
    SELECT id, name, email
    FROM users
    WHERE role = 'client' AND status = 'active'
    ORDER BY name ASC
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get Clients For Dropdown Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch clients",
        error: err.message,
      })
    }
    return res.status(200).json({
      success: true,
      data: results,
    })
  })
}

const generateAndSendOtp = async (email, store) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = Date.now() + 15 * 60 * 1000 // 15 minutes
  store.set(email, { otp, expires, verified: false })

  await sendOtpEmail(email, otp)
  console.log(`OTP sent to ${email}: ${otp}`)
  return { otp, expires }
}

// 1. GET all users
exports.getAllUsers = (req, res) => {
  const sql = `
    SELECT id, name, email, role, status, last_login, created_at
    FROM users
    ORDER BY created_at DESC
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get All Users Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch users",
        error: err.message,
      })
    }
    return res.status(200).json({
      success: true,
      data: results,
      count: results.length,
    })
  })
}

// 2. GET user by ID
exports.getUserById = (req, res) => {
  const userId = req.params.id

  const sql = `
    SELECT id, name, email, role, status, last_login, created_at
    FROM users
    WHERE id = ?
  `

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Get User By ID Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch user",
        error: err.message,
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: results[0],
    })
  })
}

// 3. CREATE new user
exports.createUser = (req, res) => {
  const { firstName, lastName, name, email, password, role, otp } = req.body
  console.log("req.body->", req.body)

  // Combine firstName and lastName if provided, otherwise use name
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : name
  const cleanEmail = email.trim().toLowerCase()

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      msg: "Name (or firstName/lastName), email, and password are required",
    })
  }

  if (otp) {
    const record = otpStore.get(cleanEmail)
    if (!record || record.otp !== otp || Date.now() > record.expires || !record.verified) {
      return res.status(400).json({
        success: false,
        msg: "OTP not verified or invalid/expired. Please verify your email.",
      })
    }
  }

  // Check if email already exists
  const checkEmailSql = "SELECT id FROM users WHERE email = ?"

  db.query(checkEmailSql, [cleanEmail], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Check Email Error:", checkErr)
      return res.status(500).json({
        success: false,
        msg: "Failed to validate email",
        error: checkErr.message,
      })
    }

    if (checkResults.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "Email already exists",
      })
    }

    // Hash password
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("Password Hash Error:", hashErr)
        return res.status(500).json({
          success: false,
          msg: "Failed to process password",
          error: hashErr.message,
        })
      }

      const sql = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `

      db.query(sql, [fullName, cleanEmail, hashedPassword, role || "client"], (err, result) => {
        if (err) {
          console.error("Create User Error:", err)
          return res.status(500).json({
            success: false,
            msg: "Failed to create user",
            error: err.message,
          })
        }

        if (otp) {
          otpStore.delete(cleanEmail)
        }

        return res.status(201).json({
          success: true,
          msg: "User created successfully",
          data: {
            id: result.insertId,
            name: fullName,
            email: cleanEmail,
            role: role || "client",
          },
        })
      })
    })
  })
}

// 4. UPDATE user
exports.updateUser = (req, res) => {
  const userId = req.params.id
  const { name, email, role, status } = req.body

  const sql = `
    UPDATE users 
    SET name = ?, email = ?, role = ?, status = ?
    WHERE id = ?
  `

  db.query(sql, [name, email, role, status, userId], (err, result) => {
    if (err) {
      console.error("Update User Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to update user",
        error: err.message,
      })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      msg: "User updated successfully",
    })
  })
}

// 5. DELETE user
exports.deleteUser = (req, res) => {
  const userId = req.params.id

  const sql = "DELETE FROM users WHERE id = ?"

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Delete User Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to delete user",
        error: err.message,
      })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      msg: "User deleted successfully",
    })
  })
}

// 6. LOGIN user
exports.loginUser = (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      msg: "Email and password are required",
    })
  }

  const sql = "SELECT * FROM users WHERE email = ? AND status = 'active'"

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Login User Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to authenticate user",
        error: err.message,
      })
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      })
    }

    const user = results[0]

    // Compare password
    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error("Password Compare Error:", compareErr)
        return res.status(500).json({
          success: false,
          msg: "Authentication failed",
          error: compareErr.message,
        })
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          msg: "Invalid email or password",
        })
      }

      // Update last login
      const updateLoginSql = "UPDATE users SET last_login = NOW() WHERE id = ?"
      db.query(updateLoginSql, [user.id], (updateErr) => {
        if (updateErr) {
          console.error("Update Last Login Error:", updateErr)
        }
      })

      // Return user data (excluding password)
      const { password: _, ...userData } = user

      return res.status(200).json({
        success: true,
        msg: "Login successful",
        data: userData,
      })
    })
  })
}

exports.sendRegistrationOtp = async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, msg: "Email is required" })

  const cleanEmail = email.trim().toLowerCase()

  // Check if email is already registered
  db.query("SELECT id FROM users WHERE email = ?", [cleanEmail], async (err, results) => {
    if (err) return res.status(500).json({ success: false, msg: "Database error", error: err })
    if (results.length > 0) {
      return res.status(400).json({ success: false, msg: "Email already registered" })
    }

    try {
      await generateAndSendOtp(cleanEmail, otpStore)
      return res.status(200).json({ success: true, msg: "OTP sent successfully for registration" })
    } catch (error) {
      console.error("Error sending OTP for registration:", error)
      return res.status(500).json({ success: false, msg: "Failed to send OTP", error: error.message })
    }
  })
}

exports.verifyRegistrationOtp = (req, res) => {
  const { email, otp } = req.body
  const cleanEmail = email.trim().toLowerCase()
  const record = otpStore.get(cleanEmail)

  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ success: false, msg: "Invalid or expired OTP" })
  }

  otpStore.set(cleanEmail, { ...record, verified: true })
  return res.status(200).json({ success: true, msg: "OTP verified successfully" })
}

exports.sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body
  const cleanEmail = email.trim().toLowerCase()

  db.query("SELECT id FROM users WHERE email = ?", [cleanEmail], async (err, results) => {
    if (err) return res.status(500).json({ success: false, msg: "Database error", error: err })
    if (results.length === 0) {
      return res.status(404).json({ success: false, msg: "No account found with this email address" })
    }

    try {
      await generateAndSendOtp(cleanEmail, passwordResetOtpStore)
      return res.status(200).json({ success: true, msg: "Password reset OTP sent to your email" })
    } catch (error) {
      console.error("Error sending password reset OTP:", error)
      return res.status(500).json({ success: false, msg: "Error sending password reset OTP" })
    }
  })
}

exports.verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body
  const cleanEmail = email.trim().toLowerCase()
  const record = passwordResetOtpStore.get(cleanEmail)

  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ success: false, msg: "Invalid or expired OTP" })
  }

  passwordResetOtpStore.set(cleanEmail, { ...record, verified: true })
  res.status(200).json({ success: true, msg: "OTP verified successfully. You can now reset your password" })
}

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body
  const cleanEmail = email.trim().toLowerCase()

  const storedOtpData = passwordResetOtpStore.get(cleanEmail)
  if (!storedOtpData || !storedOtpData.verified) {
    return res.status(400).json({ success: false, msg: "Please verify your email with OTP first" })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, msg: "Password must be at least 8 characters long" })
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, cleanEmail], (err, result) => {
      if (err) return res.status(500).json({ success: false, msg: "Database error", error: err })
      if (result.affectedRows === 0) return res.status(404).json({ success: false, msg: "User not found" })

      passwordResetOtpStore.delete(cleanEmail)
      res.status(200).json({ success: true, msg: "Password reset successfully" })
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return res.status(500).json({ success: false, msg: "Error resetting password" })
  }
}
