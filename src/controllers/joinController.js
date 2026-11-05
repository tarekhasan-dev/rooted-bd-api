const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/db");

// Join an event (Protected)
const joinEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const { email, name } = req.user;

    // Validate event ID
    if (!eventId || !ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID!",
      });
    }

    const eventsCollection = getCollection("events");
    const joinsCollection = getCollection("joins");

    // Find the event
    const event = await eventsCollection.findOne({
      _id: new ObjectId(eventId),
      eventDate: { $gte: new Date() },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Upcoming event not found!",
      });
    }

    // Check duplicate participation
    const existingJoin = await joinsCollection.findOne({
      eventId: new ObjectId(eventId),
      userEmail: email,
    });

    if (existingJoin) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this event!",
      });
    }

    // Prepare join information
    const joinData = {
      eventId: new ObjectId(eventId),
      userEmail: email,
      userName: name || "Anonymous",

      eventSnapshot: {
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        thumbnail: event.thumbnail,
        location: event.location,
        eventDate: event.eventDate,
        creatorName: event.creatorName,
      },

      joinedAt: new Date(),
    };

    // Save participation
    await joinsCollection.insertOne(joinData);

    res.status(201).json({
      success: true,
      message: "You have successfully joined the event!",
    });
  } catch (error) {
    console.error("Failed to Join Event:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to join event!",
    });
  }
};

// Get logged-in user's joined events (Protected)
const getJoinedEvents = async (req, res) => {
  try {
    const joinsCollection = getCollection("joins");

    const joinedEvents = await joinsCollection
      .find({
        userEmail: req.user.email,
      })
      .sort({ "eventSnapshot.eventDate": 1 })
      .toArray();

    res.status(200).json({
      success: true,
      totalJoinedEvents: joinedEvents.length,
      joinedEvents,
    });
  } catch (error) {
    console.error("Failed to Fetch Joined Events:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch joined events!",
    });
  }
};

module.exports = {
  joinEvent,
  getJoinedEvents,
};