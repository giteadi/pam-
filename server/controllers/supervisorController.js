const db = require("../config/database")

// Get all supervisors
const getAllSupervisors = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone,
        COUNT(DISTINCT i.id) as total_inspections,
        COUNT(DISTINCT CASE WHEN i.status = 'pending' THEN i.id END) as pending_inspections,
        COUNT(DISTINCT CASE WHEN i.status = 'in-progress' THEN i.id END) as active_inspections
      FROM supervisors s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN inspections i ON s.id = i.supervisor_id
      WHERE u.role = 'supervisor'
      GROUP BY s.id, u.id
      ORDER BY u.name ASC
    `

    const supervisors = await db.query(query)

    res.json({
      success: true,
      data: supervisors,
      msg: "Supervisors fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching supervisors:", error)
    res.status(500).json({
      success: false,
      msg: "Failed to fetch supervisors",
      error: error.message,
    })
  }
}

// Get supervisor by ID
const getSupervisorById = async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone,
        u.created_at as user_created_at
      FROM supervisors s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND u.role = 'supervisor'
    `

    const supervisor = await db.query(query, [id])

    if (!supervisor || supervisor.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "Supervisor not found",
      })
    }

    res.json({
      success: true,
      data: supervisor[0],
      msg: "Supervisor fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching supervisor:", error)
    res.status(500).json({
      success: false,
      msg: "Failed to fetch supervisor",
      error: error.message,
    })
  }
}

// Create new supervisor
const createSupervisor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      certification,
      experience_years,
      hourly_rate,
      availability_status = "available",
    } = req.body

    // First create user account
    const userQuery = `
      INSERT INTO users (name, email, phone, role, password) 
      VALUES (?, ?, ?, 'supervisor', ?)
    `

    // Generate temporary password (should be changed on first login)
    const tempPassword = "temp123" // In production, use proper password generation

    const userResult = await db.query(userQuery, [name, email, phone, tempPassword])
    const userId = userResult.insertId

    // Then create supervisor record
    const supervisorQuery = `
      INSERT INTO supervisors (
        user_id, specialization, certification, experience_years, 
        hourly_rate, availability_status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `

    const supervisorResult = await db.query(supervisorQuery, [
      userId,
      specialization,
      certification,
      experience_years,
      hourly_rate,
      availability_status,
    ])

    // Fetch the created supervisor with user details
    const createdSupervisor = await db.query(
      `
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone
      FROM supervisors s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `,
      [supervisorResult.insertId],
    )

    res.status(201).json({
      success: true,
      data: createdSupervisor[0],
      msg: "Supervisor created successfully",
    })
  } catch (error) {
    console.error("Error creating supervisor:", error)
    res.status(500).json({
      success: false,
      msg: "Failed to create supervisor",
      error: error.message,
    })
  }
}

// Update supervisor
const updateSupervisor = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Separate user fields from supervisor fields
    const userFields = ["name", "email", "phone"]
    const supervisorFields = [
      "specialization",
      "certification",
      "experience_years",
      "hourly_rate",
      "availability_status",
    ]

    // Update user table if user fields are provided
    const userUpdates = {}
    const supervisorUpdates = {}

    Object.keys(updates).forEach((key) => {
      if (userFields.includes(key)) {
        userUpdates[key] = updates[key]
      } else if (supervisorFields.includes(key)) {
        supervisorUpdates[key] = updates[key]
      }
    })

    // Get supervisor's user_id first
    const supervisorQuery = await db.query("SELECT user_id FROM supervisors WHERE id = ?", [id])

    if (!supervisorQuery || supervisorQuery.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "Supervisor not found",
      })
    }

    const userId = supervisorQuery[0].user_id

    // Update user table if needed
    if (Object.keys(userUpdates).length > 0) {
      const userUpdateQuery = `UPDATE users SET ${Object.keys(userUpdates)
        .map((key) => `${key} = ?`)
        .join(", ")} WHERE id = ?`
      await db.query(userUpdateQuery, [...Object.values(userUpdates), userId])
    }

    // Update supervisor table if needed
    if (Object.keys(supervisorUpdates).length > 0) {
      const supervisorUpdateQuery = `UPDATE supervisors SET ${Object.keys(supervisorUpdates)
        .map((key) => `${key} = ?`)
        .join(", ")} WHERE id = ?`
      await db.query(supervisorUpdateQuery, [...Object.values(supervisorUpdates), id])
    }

    res.json({
      success: true,
      data: { id, ...updates },
      msg: "Supervisor updated successfully",
    })
  } catch (error) {
    console.error("Error updating supervisor:", error)
    res.status(500).json({
      success: false,
      msg: "Failed to update supervisor",
      error: error.message,
    })
  }
}

// Delete supervisor
const deleteSupervisor = async (req, res) => {
  try {
    const { id } = req.params

    // Get supervisor's user_id first
    const supervisorQuery = await db.query("SELECT user_id FROM supervisors WHERE id = ?", [id])

    if (!supervisorQuery || supervisorQuery.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "Supervisor not found",
      })
    }

    const userId = supervisorQuery[0].user_id

    // Delete supervisor record (this will cascade to related records)
    await db.query("DELETE FROM supervisors WHERE id = ?", [id])

    // Delete user account
    await db.query("DELETE FROM users WHERE id = ?", [userId])

    res.json({
      success: true,
      msg: "Supervisor deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting supervisor:", error)
    res.status(500).json({
      success: false,
      msg: "Failed to delete supervisor",
      error: error.message,
    })
  }
}

// Get available supervisors for a specific date
const getAvailableSupervisors = async (req, res) => {
  try {
    const { date } = req.query

    const query = `
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone,
        COUNT(DISTINCT i.id) as scheduled_inspections
      FROM supervisors s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN inspections i ON s.id = i.supervisor_id 
        AND DATE(i.scheduled_date) = ?
        AND i.status IN ('pending', 'in-progress')
      WHERE s.availability_status = 'available'
        AND u.role = 'supervisor'
      GROUP BY s.id, u.id
      HAVING scheduled_inspections < 3
      ORDER BY scheduled_inspections ASC, u.name ASC
    `

    const availableSupervisors = await db.query(query, [date])

    res.json({
      success: true,
      data: availableSupervisors,
      msg: "Available supervisors fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching available supervisors:", error)
    res.status(500).json({
      success: false,
      msg: "Failed to fetch available supervisors",
      error: error.message,
    })
  }
}

// Assign task to supervisor
const assignTaskToSupervisor = async (req, res) => {
  try {
    const { id } = req.params
    const { taskData } = req.body

    // Create inspection record with supervisor assignment
    const inspectionQuery = `
      INSERT INTO inspections (
        property_id, supervisor_id, scheduled_date, inspection_type,
        status, notes, created_by
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `

    const result = await db.query(inspectionQuery, [
      taskData.property_id,
      id,
      taskData.scheduled_date,
      taskData.inspection_type,
      taskData.notes || "",
      taskData.created_by,
    ])

    res.json({
      success: true,
      data: { inspectionId: result.insertId, supervisorId: id },
      msg: "Task assigned to supervisor successfully",
    })
  } catch (error) {
    console.error("Error assigning task to supervisor:", error)
    res.status(500).json({
      success: false,
      msg: "Failed to assign task to supervisor",
      error: error.message,
    })
  }
}

// Get supervisor workload
const getSupervisorWorkload = async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
        COUNT(DISTINCT CASE WHEN i.status = 'pending' THEN i.id END) as pending_tasks,
        COUNT(DISTINCT CASE WHEN i.status = 'in-progress' THEN i.id END) as active_tasks,
        COUNT(DISTINCT CASE WHEN i.status = 'completed' THEN i.id END) as completed_tasks,
        COUNT(DISTINCT CASE WHEN DATE(i.scheduled_date) = CURDATE() THEN i.id END) as today_tasks,
        COUNT(DISTINCT CASE WHEN DATE(i.scheduled_date) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN i.id END) as week_tasks
      FROM inspections i
      WHERE i.supervisor_id = ?
    `

    const workload = await db.query(query, [id])

    res.json({
      success: true,
      data: workload[0],
      msg: "Supervisor workload fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching supervisor workload:", error)
    res.status(500).json({
      success: false,
      msg: "Failed to fetch supervisor workload",
      error: error.message,
    })
  }
}

module.exports = {
  getAllSupervisors,
  getSupervisorById,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getAvailableSupervisors,
  assignTaskToSupervisor,
  getSupervisorWorkload,
}
