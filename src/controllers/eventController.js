const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/db");

// Create a new event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      thumbnail,
      location,
      eventDate,
    } = req.body;

    // Validate required fields
    if (
      !title?.trim() ||
      !description?.trim() ||
      !eventType ||
      !thumbnail?.trim() ||
      !location?.trim() ||
      !eventDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All event fields are required!",
      });
    }

    // Validate event date
    const parsedEventDate = new Date(eventDate);

    if (Number.isNaN(parsedEventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date!",
      });
    }

    if (parsedEventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future!",
      });
    }

    const { email, name } = req.user;

    const newEvent = {
      title: title.trim(),
      description: description.trim(),
      eventType,
      thumbnail: thumbnail.trim(),
      location: location.trim(),
      eventDate: parsedEventDate,
      creatorEmail: email,
      creatorName: name || "Anonymous",
      createdAt: new Date(),
    };

    const eventsCollection = getCollection("events");
    const result = await eventsCollection.insertOne(newEvent);

    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      eventId: result.insertedId,
    });
  } catch (error) {
    console.error("Failed to Create Event:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create event!",
    });
  }
};

// Update an existing event (Owner only)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID!",
      });
    }

    const {
      title,
      description,
      eventType,
      thumbnail,
      location,
      eventDate,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !eventType ||
      !thumbnail?.trim() ||
      !location?.trim() ||
      !eventDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All event fields are required!",
      });
    }

    const parsedEventDate = new Date(eventDate);

    if (Number.isNaN(parsedEventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date!",
      });
    }

    if (parsedEventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future!",
      });
    }

    const eventsCollection = getCollection("events");

    const result = await eventsCollection.updateOne(
      {
        _id: new ObjectId(id),
        creatorEmail: req.user.email,
      },
      {
        $set: {
          title: title.trim(),
          description: description.trim(),
          eventType,
          thumbnail: thumbnail.trim(),
          location: location.trim(),
          eventDate: parsedEventDate,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found or you are not authorized to update it!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully!",
    });
  } catch (error) {
    console.error("Failed to Update Event:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update event!",
    });
  }
};

// Delete an event (Owner only)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID!",
      });
    }

    const eventsCollection = getCollection("events");

    const result = await eventsCollection.deleteOne({
      _id: new ObjectId(id),
      creatorEmail: req.user.email,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found or you are not authorized to delete it!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully!",
    });
  } catch (error) {
    console.error("Failed to Delete Event:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete event!",
    });
  }
};

// Get events created by the logged-in user (Protected)
const getMyEvents = async (req, res) => {
  try {
    const eventsCollection = getCollection("events");

    const myEvents = await eventsCollection
      .find({
        creatorEmail: req.user.email,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      totalEvents: myEvents.length,
      events: myEvents,
    });
  } catch (error) {
    console.error("Failed to Fetch My Events:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your events!",
    });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
};