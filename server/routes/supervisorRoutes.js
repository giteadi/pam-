// routes/supervisorRoutes.js
const express = require("express")
const router = express.Router()
const supervisorController = require("../controllers/supervisorController")

// Get all supervisors
router.get("/", supervisorController.getAllSupervisors)

// Get supervisor by ID
router.get("/:id", supervisorController.getSupervisorById)

// Create new supervisor
router.post("/", supervisorController.createSupervisor)

// Update supervisor
router.put("/:id", supervisorController.updateSupervisor)

// Delete supervisor
router.delete("/:id", supervisorController.deleteSupervisor)

// Get available supervisors for a specific date
router.get("/availability/check", supervisorController.getAvailableSupervisors)

// Assign task to supervisor
router.post("/:id/assign-task", supervisorController.assignTaskToSupervisor)

// Get supervisor workload
router.get("/:id/workload", supervisorController.getSupervisorWorkload)

module.exports = router
