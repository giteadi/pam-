const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

// Optional auth middleware if you already have one that sets req.user
// const { requireAuth } = require("../middlewares/auth");
// router.use(requireAuth);

router.get("/stats", dashboardController.getDashboardStats);
router.get("/activities", dashboardController.getRecentActivities);
router.get("/upcoming", dashboardController.getUpcomingInspections);

module.exports = router;
