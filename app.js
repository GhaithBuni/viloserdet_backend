const express = require("express");
const cors = require("cors");
const dbConnect = require("./dbConnect");
const pricingRoutes = require("./routes/pricing");
const bookingRoutes = require("./routes/booking");
const discountRoutes = require("./routes/discounts");
const adminRoutes = require("./routes/adminRoute");
const adminDashboard = require("./routes/adminDashboard");
const email = require("./routes/email");
const Dates = require("./routes/lockedDates");
const cleaningPrice = require("./routes/cleanpriceing");
const cleanbookings = require("./routes/cleanBooking");
const cleanVisning = require("./routes/cleanVisning");

const app = express();
const port = 4000;

const allowedOrigins = [
  "hhttps://viloserdet.vercel.app",
  "http://localhost:3001", // Add your production domain here
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
// Middleware
app.use(express.json());

// Connect to Database
dbConnect();

// Routes
app.use("/api/pricing", pricingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminDashboard);
app.use("/api/send-confirmation", email);
app.use("/api/locked-dates", Dates);
app.use("/api/cleaning-price", cleaningPrice);
app.use("/api/clean-bookings", cleanbookings);
app.use("/api/clean-visning", cleanVisning);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
