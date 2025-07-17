const mongoose = require("mongoose");
const Counter = require("./Counter"); // Import the Counter model

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  personalNumber: { type: String, required: true }, // Changed from 'personnumer' & set to String (Swedish personal numbers contain dashes)
  email: { type: String, required: true },
  phone: { type: String, required: true }, // Changed from Number to String (phone numbers can start with '0' and contain '+')
  movingDay: { type: String, required: true },
  adress: { type: String, required: true }, // originAdress renamed for clarity
  message: { type: String }, // Optional field from formData
  houseSpace: { type: String }, // Optional field for house space from formData
  selectedBuilding: { type: String }, // Optional field for selected building from formData
  tid: { type: String }, // Optional field for time from formData

  rabattKod: { type: String }, // Discount code from frontend
  finalTotalPrice: { type: Number }, // Final calculated price
  rabattPercentage: { type: Number }, // Discount percentage applied
  persienner: { type: String }, // Optional field for persienner (blinds) from formData
  extraBadrum: { type: String }, // Optional field for extra bathroom from formData
  extraToalett: { type: String }, // Optional field for extra toilet from formData
  inglasadDuschhörna: { type: String }, // Optional field for inglasad duschhörna (glass shower corner) from formData
  insidanMaskiner: { type: String }, // Optional field for insidan maskiner (inside machines) from formData
  diskmaskin: { type: Boolean },
  tvattmaskin: { type: Boolean },
  torktumlare: { type: Boolean },
  rutChecked: { type: Boolean }, // Optional field for RUT check from formData
  createdAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  orderNumber: { type: Number, unique: true },
});

bookingSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "orderNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.orderNumber = counter.seq;
    next();
  } else {
    next();
  }
});

module.exports = mongoose.model("cleanbookings", bookingSchema);
