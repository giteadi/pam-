const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');

// Photo routes
router.post('/upload/:inspectionId', photoController.uploadInspectionPhoto);
router.get('/all', photoController.getAllPhotos); // Route to get all photos
router.get('/property/:propertyId', photoController.getPhotosByProperty); // Route to get photos by property ID
router.get('/:inspectionId', photoController.getInspectionPhotos); // Route to get photos by inspection ID
router.delete('/:photoId', photoController.deletePhoto);

module.exports = router;