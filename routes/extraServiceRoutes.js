// routes/extraServiceRoutes.js
const express = require("express");
const router = express.Router();
const ExtraService = require("../models/ExtraService");

// GET: Fetch extra service prices
router.get("/", async (req, res) => {
  try {
    let services = await ExtraService.findOne();
    if (!services) {
      // If no document exists, create one with defaults
      services = await ExtraService.create({});
    }
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT: Update extra service prices
router.put("/", async (req, res) => {
  try {
    const data = req.body;
    console.log("🔧 Incoming update data:", data);

    const updated = await ExtraService.findOneAndUpdate(
      {}, // match the first document (assumes only one)
      { $set: data },
      { upsert: true, new: true }
    );

    if (!updated) {
      console.log("⚠️ No document found or updated.");
      return res.status(500).json({ error: "Update failed" });
    }

    console.log("✅ Successfully updated or inserted:", updated);
    res.json(updated);
  } catch (err) {
    console.error("❌ Error in PUT /api/extra-services:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
