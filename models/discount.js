const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema({
  code: { type: String, require: true, unique: true }, // Unique discount code
  percentage: { type: Number, require: true }, // Discount percentage (e.g., 10 for 10%)
  expiryDate: { type: Date, require: true }, // Expiration date
  isActive: { type: Boolean, default: true }, // Enable/disable code
});

module.exports = mongoose.model("discount", DiscountSchema);
