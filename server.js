require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./src/config/db");

const eventRoutes = require("./src/routes/eventRoutes");
const joinRoutes = require("./src/routes/joinRoutes");

const createIndexes = require("./src/config/indexes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.send("Social Development Events Platform API is Running!");
});

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy!",
  });
});

// Event Routes
app.use("/events", eventRoutes);

// Join Routes
app.use("/joins", joinRoutes);

// Start Server
const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Create MongoDB Indexes
    await createIndexes();

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server Startup Failed:", error.message);
    process.exit(1);
  }
};

startServer();