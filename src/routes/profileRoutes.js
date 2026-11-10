const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profileController");

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// GET logged-in user's profile (Protected)
router.get("/me", verifyToken, getMyProfile);

// PUT update logged-in user's profile (Protected)
router.put("/me", verifyToken, updateMyProfile);

module.exports = router;