const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const { uploadImage } = require("../controllers/uploadController");

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Upload profile image
router.post(
  "/image",
  verifyToken,
  upload.single("image"),
  uploadImage
);

module.exports = router;