const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

// Public routes
router.post("/create", adminController.createAdmin);
router.post("/login", adminController.login);

// Protected routes
router.get("/profile", auth, adminController.getProfile);

module.exports = router;
