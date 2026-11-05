const express = require("express");

const {
  joinEvent,
  getJoinedEvents,
} = require("../controllers/joinController");

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// POST join an event (Protected)
router.post("/", verifyToken, joinEvent);

// GET logged-in user's joined events (Protected)
router.get("/", verifyToken, getJoinedEvents);

module.exports = router;