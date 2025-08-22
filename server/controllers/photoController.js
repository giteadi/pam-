const { cloudinary } = require('../config/cloudinary');
const { db } = require('../config/db');

// Photo controller functions

// Upload photo to Cloudinary and save reference in database
exports.uploadInspectionPhoto = async (req, res) => {
  try {
    if (!req.files || !req.files.photo) {
      return res.status(400).json({
        success: false,
        msg: 'No photo uploaded'
      });
    }

    const inspectionId = req.params.inspectionId;
    const { latitude, longitude } = req.body;
    const photo = req.files.photo;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(photo.tempFilePath, {
      folder: 'inspection-photos',
      resource_type: 'image'
    });

    // Save photo reference to database
    const sql = `
      INSERT INTO inspection_photos 
      (inspection_id, photo_url, public_id, latitude, longitude, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    db.query(
      sql, 
      [inspectionId, result.secure_url, result.public_id, latitude, longitude],
      (err, dbResult) => {
        if (err) {
          console.error('Photo Upload DB Error:', err);
          return res.status(500).json({
            success: false,
            msg: 'Failed to save photo reference',
            error: err.message
          });
        }

        return res.status(201).json({
          success: true,
          data: {
            id: dbResult.insertId,
            url: result.secure_url,
            public_id: result.public_id,
            location: { latitude, longitude },
            timestamp: new Date()
          },
          msg: 'Photo uploaded successfully'
        });
      }
    );
  } catch (error) {
    console.error('Photo Upload Error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Failed to upload photo',
      error: error.message
    });
  }
};

// Get all photos for an inspection
exports.getInspectionPhotos = (req, res) => {
  const inspectionId = req.params.inspectionId;

  const sql = `
    SELECT * FROM inspection_photos
    WHERE inspection_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [inspectionId], (err, results) => {
    if (err) {
      console.error('Get Inspection Photos Error:', err);
      return res.status(500).json({
        success: false,
        msg: 'Failed to fetch inspection photos',
        error: err.message
      });
    }

    const photos = results.map(photo => ({
      id: photo.id,
      url: photo.photo_url,
      public_id: photo.public_id,
      location: {
        latitude: photo.latitude,
        longitude: photo.longitude
      },
      timestamp: photo.created_at
    }));

    return res.status(200).json({
      success: true,
      data: photos,
      count: photos.length
    });
  });
};

// Get all photos with property information
exports.getAllPhotos = (req, res) => {
  // Get query parameters for filtering
  const { propertyId, startDate, endDate } = req.query;
  
  // Base SQL query with joins to get property and inspection information
  let sql = `
    SELECT 
      ip.id,
      ip.photo_url,
      ip.public_id,
      ip.latitude,
      ip.longitude,
      ip.created_at,
      i.id as inspection_id,
      i.start_date as inspection_date,
      p.id as property_id,
      p.name as property_name,
      p.address as property_address,
      u.name as inspector_name
    FROM inspection_photos ip
    JOIN inspections i ON ip.inspection_id = i.id
    JOIN properties p ON i.property_id = p.id
    LEFT JOIN users u ON i.inspector_id = u.id
  `;
  
  // Add WHERE clauses based on filters
  const whereConditions = [];
  const queryParams = [];
  
  if (propertyId) {
    whereConditions.push('p.id = ?');
    queryParams.push(propertyId);
  }
  
  if (startDate) {
    whereConditions.push('ip.created_at >= ?');
    queryParams.push(startDate);
  }
  
  if (endDate) {
    whereConditions.push('ip.created_at <= ?');
    queryParams.push(endDate);
  }
  
  // Add WHERE clause if conditions exist
  if (whereConditions.length > 0) {
    sql += ' WHERE ' + whereConditions.join(' AND ');
  }
  
  // Order by most recent first
  sql += ' ORDER BY ip.created_at DESC';
  
  db.query(sql, queryParams, (err, results) => {
    if (err) {
      console.error('Get All Photos Error:', err);
      return res.status(500).json({
        success: false,
        msg: 'Failed to fetch photos',
        error: err.message
      });
    }
    
    const photos = results.map(photo => ({
      id: photo.id,
      url: photo.photo_url,
      public_id: photo.public_id,
      location: {
        latitude: photo.latitude,
        longitude: photo.longitude
      },
      timestamp: photo.created_at,
      property: {
        id: photo.property_id,
        name: photo.property_name,
        address: photo.property_address
      },
      inspection: {
        id: photo.inspection_id,
        date: photo.inspection_date
      },
      inspector: photo.inspector_name
    }));
    
    return res.status(200).json({
      success: true,
      data: photos,
      count: photos.length
    });
  });
};

// Get photos by property ID
exports.getPhotosByProperty = (req, res) => {
  const propertyId = req.params.propertyId;
  
  if (!propertyId) {
    return res.status(400).json({
      success: false,
      msg: 'Property ID is required'
    });
  }
  
  const sql = `
    SELECT 
      ip.id,
      ip.photo_url,
      ip.public_id,
      ip.latitude,
      ip.longitude,
      ip.created_at,
      i.id as inspection_id,
      i.start_date as inspection_date,
      p.id as property_id,
      p.name as property_name,
      p.address as property_address,
      p.type as property_type,
      u.name as inspector_name
    FROM inspection_photos ip
    JOIN inspections i ON ip.inspection_id = i.id
    JOIN properties p ON i.property_id = p.id
    LEFT JOIN users u ON i.inspector_id = u.id
    WHERE p.id = ?
    ORDER BY ip.created_at DESC
  `;
  
  db.query(sql, [propertyId], (err, results) => {
    if (err) {
      console.error('Get Photos By Property Error:', err);
      return res.status(500).json({
        success: false,
        msg: 'Failed to fetch property photos',
        error: err.message
      });
    }
    
    const photos = results.map(photo => ({
      id: photo.id,
      url: photo.photo_url,
      public_id: photo.public_id,
      location: {
        latitude: photo.latitude,
        longitude: photo.longitude
      },
      timestamp: photo.created_at,
      property: {
        id: photo.property_id,
        name: photo.property_name,
        address: photo.property_address,
        type: photo.property_type
      },
      inspection: {
        id: photo.inspection_id,
        date: photo.inspection_date
      },
      inspector: photo.inspector_name
    }));
    
    return res.status(200).json({
      success: true,
      data: photos,
      count: photos.length,
      propertyId: propertyId
    });
  });
};

// Delete a photo
exports.deletePhoto = async (req, res) => {
  try {
    const photoId = req.params.photoId;
    
    // Get photo details from database
    const selectSql = 'SELECT * FROM inspection_photos WHERE id = ?';
    
    db.query(selectSql, [photoId], async (err, results) => {
      if (err) {
        console.error('Delete Photo DB Error:', err);
        return res.status(500).json({
          success: false,
          msg: 'Failed to fetch photo details',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          msg: 'Photo not found'
        });
      }
      
      const photo = results[0];
      
      // Delete from Cloudinary
      if (photo.public_id) {
        await cloudinary.uploader.destroy(photo.public_id);
      }
      
      // Delete from database
      const deleteSql = 'DELETE FROM inspection_photos WHERE id = ?';
      
      db.query(deleteSql, [photoId], (err, result) => {
        if (err) {
          console.error('Delete Photo DB Error:', err);
          return res.status(500).json({
            success: false,
            msg: 'Failed to delete photo reference',
            error: err.message
          });
        }
        
        return res.status(200).json({
          success: true,
          msg: 'Photo deleted successfully'
        });
      });
    });
  } catch (error) {
    console.error('Delete Photo Error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Failed to delete photo',
      error: error.message
    });
  }
};