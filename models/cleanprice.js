const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema({
  minSize: { type: Number, required: true },
  maxSize: { type: Number, required: true },
  basePrice: { type: Number, required: true },
});

module.exports = mongoose.model("cleanpricing", PricingSchema);
