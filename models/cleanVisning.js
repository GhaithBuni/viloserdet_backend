const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  personalNumber: { type: String, required: true }, // Changed from 'personnumer' & set to String (Swedish personal numbers contain dashes)
  email: { type: String, required: true },
  phone: { type: String, required: true }, // Changed from Number to String (phone numbers can start with '0' and contain '+')
  movingDay: { type: Date, required: true },
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
  rutChecked: { type: Boolean }, // Optional field for RUT check from formData
  tvattmaskin: { type: Boolean },
  torktumlare: { type: Boolean },
  diskmaskin: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("cleanvisning", bookingSchema);
