const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema({
  minSize: { type: Number, required: true },
  maxSize: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  includedServices: { type: String, required: true },
  PackgingService: { type: Number, required: true },
  extraKmCost: {
    from31to200km: { type: Number, required: true },
    above200km: { type: Number, required: true },
  },
  parkingDistance: {
    within25m: { type: Number, required: true },
    between26to50m: { type: Number, required: true },
  },
  furnitureRemoval: { type: Number, required: true },
  assemblyDisassembly: { type: Number, required: true },
  cleaningCost: { type: Number, required: true },
  heavyService: { type: Number, required: true },

  // ✅ New Floor Pricing Without Elevator
  noElevatorCost: {
    floors3to4: { type: Number, required: true }, // Cost for floors 3-4
    floors5to8: { type: Number, required: true }, // Cost for floors 5-8
  },
});

module.exports = mongoose.model("Pricing", PricingSchema);
