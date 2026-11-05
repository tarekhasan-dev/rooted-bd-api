const dns = require("dns");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Use reliable public DNS servers
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

let db;

const connectDB = async () => {
  try {
    await client.connect();

    db = client.db("social_development_events");

    await db.command({ ping: 1 });

    console.log("MongoDB Connected Successfully!");

    return db;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database is not connected!");
  }

  return db;
};

// Get database collections
const getCollection = (collectionName) => {
  return getDB().collection(collectionName);
};

module.exports = {
  connectDB,
  getDB,
  getCollection,
};