const { getCollection } = require("./db");

// Create MongoDB indexes
const createIndexes = async () => {
  try {
    const joinsCollection = getCollection("joins");

    // Prevent duplicate event joining by the same user
    await joinsCollection.createIndex(
      {
        eventId: 1,
        userEmail: 1,
      },
      {
        unique: true,
        name: "unique_event_user_join",
      }
    );

    console.log("MongoDB Indexes Created Successfully!");
  } catch (error) {
    console.error("Failed to Create MongoDB Indexes:", error.message);
    throw error;
  }
};

module.exports = createIndexes;