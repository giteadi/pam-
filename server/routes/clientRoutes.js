const express = require("express")
const router = express.Router()
const clientController = require("../controllers/clientController")

// Get properties for a specific client
router.get("/:id/properties", clientController.getClientProperties)

module.exports = router