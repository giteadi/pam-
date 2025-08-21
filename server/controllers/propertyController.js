const { db } = require("../config/db")

// 1. GET all properties
exports.getAllProperties = (req, res) => {
  const sql = `
    SELECT p.*, 
           COUNT(DISTINCT pa.id) as amenity_count,
           COUNT(DISTINCT i.id) as inspection_count
    FROM properties p
    LEFT JOIN property_amenities pa ON p.id = pa.property_id
    LEFT JOIN inspections i ON p.id = i.property_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get All Properties Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch properties",
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

// 2. GET property by ID
exports.getPropertyById = (req, res) => {
  const propertyId = req.params.id

  const sql = `
    SELECT p.*,
           GROUP_CONCAT(DISTINCT pa.amenity) as amenities
    FROM properties p
    LEFT JOIN property_amenities pa ON p.id = pa.property_id
    WHERE p.id = ?
    GROUP BY p.id
  `

  db.query(sql, [propertyId], (err, results) => {
    if (err) {
      console.error("Get Property By ID Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch property",
        error: err.message,
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "Property not found",
      })
    }

    // Parse amenities string into array
    const property = results[0]
    property.amenities = property.amenities ? property.amenities.split(",") : []

    return res.status(200).json({
      success: true,
      data: property,
    })
  })
}

// 3. CREATE new property
exports.createProperty = (req, res) => {
  const { name, address, type, units, owner, owner_id, contact, amenities } = req.body

  if (!name || !type) {
    return res.status(400).json({
      success: false,
      msg: "Name and type are required",
    })
  }

  // If owner_id is provided, use it as the owner value
  // This happens when admin selects a client from dropdown
  const ownerValue = owner_id || owner
  
  // Log the owner information for debugging
  console.log('Creating property with owner:', { owner_id, owner, ownerValue })

  const sql = `
    INSERT INTO properties (name, address, type, units, owner, contact)
    VALUES (?, ?, ?, ?, ?, ?)
  `

  db.query(sql, [name, address, type, units || 0, ownerValue, contact], (err, result) => {
    if (err) {
      console.error("Create Property Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to create property",
        error: err.message,
      })
    }

    const propertyId = result.insertId

    // Add amenities if provided
    if (amenities && amenities.length > 0) {
      const amenityValues = amenities.map((amenity) => [propertyId, amenity])
      const amenitySql = "INSERT INTO property_amenities (property_id, amenity) VALUES ?"

      db.query(amenitySql, [amenityValues], (amenityErr) => {
        if (amenityErr) {
          console.error("Add Amenities Error:", amenityErr)
        }
      })
    }

    return res.status(201).json({
      success: true,
      msg: "Property created successfully",
      data: { id: propertyId, ...req.body },
    })
  })
}

// 4. UPDATE property
exports.updateProperty = (req, res) => {
  const propertyId = req.params.id
  const { name, address, type, units, status, owner, owner_id, contact, amenities } = req.body

  // If owner_id is provided, use it as the owner value
  // This happens when admin selects a client from dropdown
  const ownerValue = owner_id || owner
  
  // Log the owner information for debugging
  console.log('Updating property with owner:', { owner_id, owner, ownerValue })

  const sql = `
    UPDATE properties 
    SET name = ?, address = ?, type = ?, units = ?, status = ?, owner = ?, contact = ?
    WHERE id = ?
  `

  db.query(sql, [name, address, type, units, status, ownerValue, contact, propertyId], (err, result) => {
    if (err) {
      console.error("Update Property Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to update property",
        error: err.message,
      })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        msg: "Property not found",
      })
    }

    // Update amenities if provided
    if (amenities) {
      // Delete existing amenities
      const deleteAmenitiesSql = "DELETE FROM property_amenities WHERE property_id = ?"
      db.query(deleteAmenitiesSql, [propertyId], (deleteErr) => {
        if (deleteErr) {
          console.error("Delete Amenities Error:", deleteErr)
        } else if (amenities.length > 0) {
          // Add new amenities
          const amenityValues = amenities.map((amenity) => [propertyId, amenity])
          const insertAmenitiesSql = "INSERT INTO property_amenities (property_id, amenity) VALUES ?"

          db.query(insertAmenitiesSql, [amenityValues], (insertErr) => {
            if (insertErr) {
              console.error("Insert Amenities Error:", insertErr)
            }
          })
        }
      })
    }

    return res.status(200).json({
      success: true,
      msg: "Property updated successfully",
    })
  })
}

// 5. DELETE property
exports.deleteProperty = (req, res) => {
  const propertyId = req.params.id

  const sql = "DELETE FROM properties WHERE id = ?"

  db.query(sql, [propertyId], (err, result) => {
    if (err) {
      console.error("Delete Property Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to delete property",
        error: err.message,
      })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        msg: "Property not found",
      })
    }

    return res.status(200).json({
      success: true,
      msg: "Property deleted successfully",
    })
  })
}
