const express = require("express")
const router = express.Router()
const inspectorController = require("../controllers/inspectorController")

// GET all inspectors - matches /api/inspector
router.get("/", inspectorController.getAllInspectors)

// GET available inspectors - matches /api/inspector/available
router.get("/available", inspectorController.getAvailableInspectors)

// GET inspector by ID
router.get("/:id", inspectorController.getInspectorById)

// POST create new inspector
router.post("/", inspectorController.createInspector)

// PUT update inspector
router.put("/:id", inspectorController.updateInspector)

// DELETE inspector
router.delete("/:id", inspectorController.deleteInspector)

module.exports = router
