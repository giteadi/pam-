const { db } = require("../config/db")

// Get properties for a specific client
exports.getClientProperties = (req, res) => {
  const clientId = req.params.id

  const sql = `
    SELECT p.*,
           GROUP_CONCAT(DISTINCT pa.amenity) as amenities
    FROM properties p
    LEFT JOIN property_amenities pa ON p.id = pa.property_id
    WHERE p.owner = ? OR p.contact IN (
      SELECT email FROM users WHERE id = ?
    )
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `

  db.query(sql, [clientId, clientId], (err, results) => {
    if (err) {
      console.error("Get Client Properties Error:", err)
      return res.status(500).json({
        success: false,
        msg: "Failed to fetch client properties",
        error: err.message,
      })
    }

    // Parse amenities for each property
    const properties = results.map(property => {
      return {
        ...property,
        amenities: property.amenities ? property.amenities.split(",") : []
      }
    })

    return res.status(200).json({
      success: true,
      data: properties,
      count: properties.length,
    })
  })
}