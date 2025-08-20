const express = require("express")
const router = express.Router()
const inspectorController = require("../controllers/inspectorController")

// GET all inspectors - matches /api/inspector (now includes supervisors from users table)
router.get("/", inspectorController.getAllInspectors)

// GET available inspectors - matches /api/inspector/available (now includes supervisors)
router.get("/available", inspectorController.getAvailableInspectors)

// GET inspector by ID (now searches both inspectors and users tables)
router.get("/:id", inspectorController.getInspectorById)

// POST create new inspector
router.post("/", inspectorController.createInspector)

// PUT update inspector
router.put("/:id", inspectorController.updateInspector)

// DELETE inspector
router.delete("/:id", inspectorController.deleteInspector)

module.exports = router
