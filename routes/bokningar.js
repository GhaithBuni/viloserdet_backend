const express = require("express");
const router = express.Router();
const Booking = require("../models/book");
const dbConnect = require("../dbConnect");

dbConnect();

// ✅ GET: Fetch All Bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }); // Latest bookings first
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
