const { db } = require("../config/db")

// 1. GET all inspections
exports.getAllInspections = (req, res) => {
  const sql = `
    SELECT i.*, 
           p.name as property_name, 
           p.address as property_address,
           u.name as inspector_name,
           COUNT(ii.id) as total_items,
           COUNT(CASE WHEN ii.is_completed = 1 THEN 1 END) as completed_items
    FROM inspections i
    LEFT JOIN properties p ON i.property_id = p.id
    LEFT JOIN users u ON i.inspector_id = u.id
    LEFT JOIN inspection_items ii ON i.id = ii.inspection_id
    GROUP BY i.id
    ORDER BY i.start_date DESC
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get All Inspections Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch inspections",
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

// 2. GET inspection by ID with checklist items
exports.getInspectionById = (req, res) => {
  const inspectionId = req.params.id

  const sql = `
    SELECT i.*, 
           p.name as property_name, 
           p.address as property_address,
           u.name as inspector_name
    FROM inspections i
    LEFT JOIN properties p ON i.property_id = p.id
    LEFT JOIN users u ON i.inspector_id = u.id
    WHERE i.id = ?
  `

  db.query(sql, [inspectionId], (err, results) => {
    if (err) {
      console.error("Get Inspection By ID Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch inspection",
        error: err.message,
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "Inspection not found",
      })
    }

    const inspection = results[0]

    // Get checklist items
    const itemsSql = `
      SELECT * FROM inspection_items 
      WHERE inspection_id = ? 
      ORDER BY category, item_text
    `

    db.query(itemsSql, [inspectionId], (itemsErr, itemsResults) => {
      if (itemsErr) {
        console.error("Get Inspection Items Error:", itemsErr)
        return res.status(500).json({
          success: false,
          msg: "Failed to fetch inspection items",
          error: itemsErr.message,
        })
      }

      inspection.checklist_items = itemsResults

      return res.status(200).json({
        success: true,
        data: inspection,
      })
    })
  })
}

// 3. CREATE new inspection
exports.createInspection = (req, res) => {
  const { property_id, inspector_id, start_date, notes, checklist_items } = req.body

  if (!property_id || !inspector_id || !start_date) {
    return res.status(400).json({
      success: false,
      msg: "Property ID, Inspector ID, and Start Date are required",
    })
  }

  const sql = `
    INSERT INTO inspections (property_id, inspector_id, start_date, notes)
    VALUES (?, ?, ?, ?)
  `

  db.query(sql, [property_id, inspector_id, start_date, notes], (err, result) => {
    if (err) {
      console.error("Create Inspection Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to create inspection",
        error: err.message,
      })
    }

    const inspectionId = result.insertId

    // Add checklist items if provided
    if (checklist_items && checklist_items.length > 0) {
      const itemValues = checklist_items.map((item) => [
        inspectionId,
        item.category,
        item.item_text,
        item.is_required || true,
      ])

      const itemsSql = `
        INSERT INTO inspection_items (inspection_id, category, item_text, is_required) 
        VALUES ?
      `

      db.query(itemsSql, [itemValues], (itemsErr) => {
        if (itemsErr) {
          console.error("Add Inspection Items Error:", itemsErr)
        }
      })
    }

    return res.status(201).json({
      success: true,
      msg: "Inspection created successfully",
      data: { id: inspectionId, ...req.body },
    })
  })
}

// 4. UPDATE inspection status and progress
exports.updateInspection = (req, res) => {
  const inspectionId = req.params.id
  const { status, progress, completed_date, notes } = req.body

  const sql = `
    UPDATE inspections 
    SET status = ?, progress = ?, completed_date = ?, notes = ?
    WHERE id = ?
  `

  db.query(sql, [status, progress, completed_date, notes, inspectionId], (err, result) => {
    if (err) {
      console.error("Update Inspection Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to update inspection",
        error: err.message,
      })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        msg: "Inspection not found",
      })
    }

    return res.status(200).json({
      success: true,
      msg: "Inspection updated successfully",
    })
  })
}

// 5. UPDATE checklist item completion
exports.updateChecklistItem = (req, res) => {
  const itemId = req.params.itemId
  const { is_completed } = req.body

  const sql = "UPDATE inspection_items SET is_completed = ? WHERE id = ?"

  db.query(sql, [is_completed, itemId], (err, result) => {
    if (err) {
      console.error("Update Checklist Item Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to update checklist item",
        error: err.message,
      })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        msg: "Checklist item not found",
      })
    }

    return res.status(200).json({
      success: true,
      msg: "Checklist item updated successfully",
    })
  })
}

// 6. GET inspections by property ID
exports.getInspectionsByProperty = (req, res) => {
  const propertyId = req.params.propertyId

  const sql = `
    SELECT i.*, u.name as inspector_name
    FROM inspections i
    LEFT JOIN users u ON i.inspector_id = u.id
    WHERE i.property_id = ?
    ORDER BY i.start_date DESC
  `

  db.query(sql, [propertyId], (err, results) => {
    if (err) {
      console.error("Get Inspections By Property Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch property inspections",
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
