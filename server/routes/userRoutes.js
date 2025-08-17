const express = require("express")
const router = express.Router()

const userController = require("../controllers/userController")

// Auth
router.post("/login", userController.loginUser)

router.post("/send-otp-registration", userController.sendRegistrationOtp)
router.post("/verify-otp-registration", userController.verifyRegistrationOtp)

router.post("/send-password-reset-otp", userController.sendPasswordResetOtp)
router.post("/verify-password-reset-otp", userController.verifyPasswordResetOtp)
router.post("/reset-password", userController.resetPassword)

// CRUD
router.get("/", userController.getAllUsers)
router.get("/:id", userController.getUserById)
router.post("/", userController.createUser)
router.put("/:id", userController.updateUser)
router.delete("/:id", userController.deleteUser)

module.exports = router
