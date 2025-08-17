const { db } = require("../config/db")

// 1. GET dashboard statistics
exports.getDashboardStats = (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role

  // Base stats query
  const statsQueries = []

  // Total properties
  statsQueries.push(
    new Promise((resolve, reject) => {
      const sql = "SELECT COUNT(*) as total_properties FROM properties WHERE status = 'Active'"
      db.query(sql, (err, results) => {
        if (err) reject(err)
        else resolve({ total_properties: results[0].total_properties })
      })
    }),
  )

  // Total inspections
  statsQueries.push(
    new Promise((resolve, reject) => {
      let sql = "SELECT COUNT(*) as total_inspections FROM inspections"
      let params = []

      if (userRole === "supervisor" && userId) {
        sql += " WHERE inspector_id = ?"
        params = [userId]
      }

      db.query(sql, params, (err, results) => {
        if (err) reject(err)
        else resolve({ total_inspections: results[0].total_inspections })
      })
    }),
  )

  // Pending inspections
  statsQueries.push(
    new Promise((resolve, reject) => {
      let sql = "SELECT COUNT(*) as pending_inspections FROM inspections WHERE status = 'pending'"
      let params = []

      if (userRole === "supervisor" && userId) {
        sql += " AND inspector_id = ?"
        params = [userId]
      }

      db.query(sql, params, (err, results) => {
        if (err) reject(err)
        else resolve({ pending_inspections: results[0].pending_inspections })
      })
    }),
  )

  // In-progress inspections
  statsQueries.push(
    new Promise((resolve, reject) => {
      let sql = "SELECT COUNT(*) as inprogress_inspections FROM inspections WHERE status = 'in-progress'"
      let params = []

      if (userRole === "supervisor" && userId) {
        sql += " AND inspector_id = ?"
        params = [userId]
      }

      db.query(sql, params, (err, results) => {
        if (err) reject(err)
        else resolve({ inprogress_inspections: results[0].inprogress_inspections })
      })
    }),
  )

  Promise.all(statsQueries)
    .then((results) => {
      const stats = Object.assign({}, ...results)
      return res.status(200).json({
        success: true,
        data: stats,
      })
    })
    .catch((err) => {
      console.error("Get Dashboard Stats Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch dashboard statistics",
        error: err.message,
      })
    })
}

// 2. GET recent activities
exports.getRecentActivities = (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role

  let sql = `
    SELECT 
      'inspection' as activity_type,
      i.id as activity_id,
      CONCAT('Inspection for ', p.name) as activity_title,
      i.status as activity_status,
      i.start_date as activity_date,
      u.name as inspector_name
    FROM inspections i
    LEFT JOIN properties p ON i.property_id = p.id
    LEFT JOIN users u ON i.inspector_id = u.id
  `

  let params = []

  if (userRole === "supervisor" && userId) {
    sql += " WHERE i.inspector_id = ?"
    params = [userId]
  }

  sql += " ORDER BY i.start_date DESC LIMIT 10"

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Get Recent Activities Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch recent activities",
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

// 3. GET upcoming inspections
exports.getUpcomingInspections = (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role

  let sql = `
    SELECT i.*, 
           p.name as property_name, 
           p.address as property_address,
           u.name as inspector_name
    FROM inspections i
    LEFT JOIN properties p ON i.property_id = p.id
    LEFT JOIN users u ON i.inspector_id = u.id
    WHERE i.start_date >= CURDATE() AND i.status IN ('pending', 'in-progress')
  `

  let params = []

  if (userRole === "supervisor" && userId) {
    sql += " AND i.inspector_id = ?"
    params = [userId]
  }

  sql += " ORDER BY i.start_date ASC LIMIT 5"

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Get Upcoming Inspections Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch upcoming inspections",
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
