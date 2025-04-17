const mongoose = require("mongoose");
require("dotenv").config(); // ✅ Load environment variables

const MONGO_URI = process.env.MONGO_URI;

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ Already connected to MongoDB.");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

module.exports = dbConnect;
