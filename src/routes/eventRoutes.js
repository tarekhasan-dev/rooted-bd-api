const express = require("express");
const { ObjectId } = require("mongodb");

const { getCollection } = require("../config/db");

const {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} = require("../controllers/eventController");

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// GET all upcoming events (Public)
router.get("/", async (req, res) => {
  try {
    const eventsCollection = getCollection("events");

    const currentDate = new Date();
    const { limit } = req.query;

    let query = eventsCollection
      .find({
        eventDate: { $gte: currentDate },
      })
      .sort({ eventDate: 1 });

    if (limit !== undefined) {
      const parsedLimit = Number(limit);

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100!",
        });
      }

      query = query.limit(parsedLimit);
    }

    const events = await query.toArray();

    res.status(200).json({
      success: true,
      totalEvents: events.length,
      events,
    });
  } catch (error) {
    console.error("Failed to Fetch Events:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events!",
    });
  }
});

// GET events created by logged-in user (Protected)
// Keep this route before /:id
router.get("/my-events", verifyToken, getMyEvents);

// GET a single event by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID!",
      });
    }

    const eventsCollection = getCollection("events");

    const event = await eventsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found!",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Failed to Fetch Event:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event!",
    });
  }
});

// POST create a new event (Protected)
router.post("/", verifyToken, createEvent);

// PUT update an event (Protected)
router.put("/:id", verifyToken, updateEvent);

// DELETE an event (Protected)
router.delete("/:id", verifyToken, deleteEvent);

module.exports = router;
