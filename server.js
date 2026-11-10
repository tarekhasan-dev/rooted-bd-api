require("dotenv").config();

// Local DNS SRV সমস্যার সমাধান (MongoDB connect করার আগে থাকতেই হবে)
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./src/config/db");

const eventRoutes = require("./src/routes/eventRoutes");
const joinRoutes = require("./src/routes/joinRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

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

// Routes
app.use("/events", eventRoutes);
app.use("/joins", joinRoutes);
app.use("/profile", profileRoutes);
app.use("/upload", uploadRoutes);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await createIndexes();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server Startup Failed:", error.message);
    process.exit(1);
  }
};

startServer();