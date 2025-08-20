const express = require("express")
const router = express.Router()
const inspectionController = require("../controllers/inspectionController")

// Existing routes
router.get("/", inspectionController.getAllInspections)
router.get("/:id", inspectionController.getInspectionById)
router.post("/", inspectionController.createInspection)
router.put("/:id", inspectionController.updateInspection)
router.patch("/:itemId", inspectionController.updateChecklistItem)
router.get("/property/:propertyId", inspectionController.getInspectionsByProperty)

router.post("/schedule", inspectionController.scheduleInspection)

module.exports = router
