const express = require("express");
const router = express.Router();

const inspectionController = require("../controllers/inspectionController");

router.get("/", inspectionController.getAllInspections);
router.get("/:id", inspectionController.getInspectionById);
router.post("/", inspectionController.createInspection);
router.put("/:id", inspectionController.updateInspection);

// Update a single checklist item's completion status
// Body: { is_completed: 0 | 1 }
router.patch("/items/:itemId", inspectionController.updateChecklistItem);

// Inspections for a given property
router.get("/property/:propertyId", inspectionController.getInspectionsByProperty);

module.exports = router;
