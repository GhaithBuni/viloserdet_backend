const express = require("express");
const router = express.Router();
const dbConnect = require("../dbConnect");
const LockedDate = require("../models/LockedDatesVisning");

dbConnect();

// ✅ Fetch Locked Dates
router.get("/", async (req, res) => {
  try {
    const lockedDates = await LockedDate.find({});
    res.json(lockedDates.map((d) => d.date));
  } catch (error) {
    console.error("Error fetching locked dates:", error);
    res.status(500).json({ error: "Failed to fetch locked dates" });
  }
});

// ✅ Lock a New Date
router.post("/", async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const existing = await LockedDate.findOne({ date });
    if (existing) {
      return res.status(400).json({ error: "Date is already locked" });
    }

    const newLockedDate = new LockedDate({ date });
    await newLockedDate.save();

    res.json({ message: "Date locked successfully" });
  } catch (error) {
    console.error("Error locking date:", error);
    res.status(500).json({ error: "Failed to lock date" });
  }
});

// ✅ Unlock a Date
router.delete("/:date", async (req, res) => {
  try {
    await LockedDate.deleteOne({ date: req.params.date });
    res.json({ message: "Date unlocked successfully" });
  } catch (error) {
    console.error("Error unlocking date:", error);
    res.status(500).json({ error: "Failed to unlock date" });
  }
});

module.exports = router;
