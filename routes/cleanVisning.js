const express = require("express");
const router = express.Router();
const Booking = require("../models/cleanVisning");
const dbConnect = require("../dbConnect");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Add email sending function
async function sendEmail(to, subject, htmlContent) {
  let transporter = nodemailer.createTransport({
    host: "send.one.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: `"Vilöserdet" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });

  console.log("✅ Email sent:", info.response);
}

// ✅ POST: Create a New Booking
router.post("/", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();

    // Send confirmation email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
        <h2 style="color: #2c3e50;">📌 Ny Visningsstädning Bokning – #${
          newBooking.orderNumber
        }</h2>
        <p>En ny visningsstädning bokning har gjorts med följande detaljer:</p>
        <hr>
        <p><strong>Kund:</strong> ${newBooking.name}</p>
        <p><strong>Email:</strong> ${newBooking.email}</p>
        <p><strong>Datum:</strong> ${new Date(
          newBooking.movingDay
        ).toLocaleDateString()}</p>
        <p><strong>Adress:</strong> ${newBooking.adress}</p>
        <hr>
      </div>
    `;

    await sendEmail(
      process.env.EMAIL_USER,
      `Ny Visningsstädning Bokning - ${newBooking.name}`,
      emailContent
    );

    return res
      .status(201)
      .json({ message: "Booking saved successfully!", booking: newBooking });
  } catch (error) {
    console.error("Error saving booking:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

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

// ✅ GET: Fetch a Single Booking by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract id from URL params

    // Check if ID is a valid MongoDB ObjectId before querying
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid booking ID format" });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ PUT: Update a Booking by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract id from URL params

    // Check if ID is a valid MongoDB ObjectId before querying
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid booking ID format" });
    }

    // Find the booking by ID and update it with the request body
    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validators on update
    });

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.status(200).json({
      message: "Booking updated successfully!",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ DELETE: Remove a Booking
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
