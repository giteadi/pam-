const { db } = require("../config/db")
const bcrypt = require("bcrypt")

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
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      msg: "Name, email, and password are required",
    })
  }

  // Check if email already exists
  const checkEmailSql = "SELECT id FROM users WHERE email = ?"

  db.query(checkEmailSql, [email], (checkErr, checkResults) => {
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

      db.query(sql, [name, email, hashedPassword, role || "client"], (err, result) => {
        if (err) {
          console.error("Create User Error:", err)
          return res.status(500).json({
            success: false,
            msg: "Failed to create user",
            error: err.message,
          })
        }

        return res.status(201).json({
          success: true,
          msg: "User created successfully",
          data: {
            id: result.insertId,
            name,
            email,
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
