const { db } = require("../config/db")

// 1. GET all inspectors
exports.getAllInspectors = (req, res) => {
  const sql = `
    SELECT i.*,
           COUNT(ins.id) as total_inspections,
           COUNT(CASE WHEN ins.status = 'completed' THEN 1 END) as completed_inspections
    FROM inspectors i
    LEFT JOIN inspections ins ON i.id = ins.assigned_inspector_id
    WHERE i.status = 'active'
    GROUP BY i.id
    ORDER BY i.name ASC
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get All Inspectors Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch inspectors",
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

// 2. GET available inspectors for scheduling
exports.getAvailableInspectors = (req, res) => {
  const { date } = req.query

  let sql = `
    SELECT i.*,
           COUNT(ins.id) as scheduled_inspections
    FROM inspectors i
    LEFT JOIN inspections ins ON i.id = ins.assigned_inspector_id 
    WHERE i.status = 'active' AND i.availability = 'available'
  `

  const params = []

  if (date) {
    sql += ` AND (ins.start_date != ? OR ins.start_date IS NULL)`
    params.push(date)
  }

  sql += `
    GROUP BY i.id
    HAVING scheduled_inspections < 3
    ORDER BY scheduled_inspections ASC, i.name ASC
  `

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Get Available Inspectors Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch available inspectors",
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

// 3. CREATE new inspector
exports.createInspector = (req, res) => {
  const { name, email, phone, specialization, certification, experience_years, hourly_rate } = req.body

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      msg: "Name and email are required",
    })
  }

  const sql = `
    INSERT INTO inspectors (name, email, phone, specialization, certification, experience_years, hourly_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `

  db.query(
    sql,
    [name, email, phone, specialization, certification, experience_years || 0, hourly_rate || 0],
    (err, result) => {
      if (err) {
        console.error("Create Inspector Error:", err)
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            success: false,
            msg: "Inspector with this email already exists",
          })
        }
        return res.status(500).json({
          success: false,
          msg: "Failed to create inspector",
          error: err.message,
        })
      }

      return res.status(201).json({
        success: true,
        msg: "Inspector created successfully",
        data: { id: result.insertId, ...req.body },
      })
    },
  )
}

// 4. UPDATE inspector
exports.updateInspector = (req, res) => {
  const inspectorId = req.params.id
  const { name, email, phone, specialization, certification, experience_years, hourly_rate, availability, status } =
    req.body

  const sql = `
    UPDATE inspectors 
    SET name = ?, email = ?, phone = ?, specialization = ?, certification = ?, 
        experience_years = ?, hourly_rate = ?, availability = ?, status = ?
    WHERE id = ?
  `

  db.query(
    sql,
    [
      name,
      email,
      phone,
      specialization,
      certification,
      experience_years,
      hourly_rate,
      availability,
      status,
      inspectorId,
    ],
    (err, result) => {
      if (err) {
        console.error("Update Inspector Error:", err)
        return res.status(500).json({
          success: false,
          msg: "Failed to update inspector",
          error: err.message,
        })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          msg: "Inspector not found",
        })
      }

      return res.status(200).json({
        success: true,
        msg: "Inspector updated successfully",
      })
    },
  )
}

// 5. DELETE inspector (soft delete)
exports.deleteInspector = (req, res) => {
  const inspectorId = req.params.id

  const sql = "UPDATE inspectors SET status = 'inactive' WHERE id = ?"

  db.query(sql, [inspectorId], (err, result) => {
    if (err) {
      console.error("Delete Inspector Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to delete inspector",
        error: err.message,
      })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        msg: "Inspector not found",
      })
    }

    return res.status(200).json({
      success: true,
      msg: "Inspector deleted successfully",
    })
  })
}

// 6. GET inspector by ID
exports.getInspectorById = (req, res) => {
  const inspectorId = req.params.id

  const sql = `
    SELECT i.*,
           COUNT(ins.id) as total_inspections,
           COUNT(CASE WHEN ins.status = 'completed' THEN 1 END) as completed_inspections,
           AVG(CASE WHEN ins.status = 'completed' THEN ins.progress END) as avg_completion_rate
    FROM inspectors i
    LEFT JOIN inspections ins ON i.id = ins.assigned_inspector_id
    WHERE i.id = ?
    GROUP BY i.id
  `

  db.query(sql, [inspectorId], (err, results) => {
    if (err) {
      console.error("Get Inspector By ID Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch inspector",
        error: err.message,
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "Inspector not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: results[0],
    })
  })
}
