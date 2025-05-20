const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  personalNumber: { type: String, required: true }, // Changed from 'personnumer' & set to String (Swedish personal numbers contain dashes)
  email: { type: String, required: true },
  phone: { type: String, required: true }, // Changed from Number to String (phone numbers can start with '0' and contain '+')
  movingDay: { type: Date },
  address: { type: String, required: true }, // originAdress renamed for clarity
  newAddress: { type: String, required: true }, // desAdress renamed for clarity
  message: { type: String }, // Optional field from formData
  rabattKod: { type: String }, // Discount code from frontend
  totalPrice: { type: Number }, // Final calculated price
  tid: { type: String }, // Optional field for time from formData
  createdAt: { type: Date, default: Date.now },

  // Origin Details
  zip: { type: String },
  houseSpace: { type: Number },
  selectedFloor: { type: String },
  floorNumber: { type: Number },
  selectedBuilding: { type: String },
  selectedParking: { type: String },
  // store: { type: String, required: true },
  // packing: { type: String, required: true }, // Fixed 'Packing' to lowercase

  // // Destination Details
  zipTo: { type: String },
  houseSpaceTo: { type: Number },
  floorNumberTo: { type: Number },
  selectedFloorTo: { type: String },
  selectedBuildingTo: { type: String },
  selectedParkingTo: { type: String },

  // Extra Services
  selectedPacking: { type: String },
  selectedAssembly: { type: String },
  selectedDisposal: { type: String },
  selectedCleaning: { type: String },
  selectedFurniture: {
    type: Map,
    of: Number,
    default: {},
  },
  furnitureCategories: {
    type: [
      {
        category: { type: String }, // e.g., "Living Room", "Bedroom"
        items: [
          {
            name: { type: String }, // e.g., "Sofa", "Bed"
            count: { type: Number }, // e.g., 2
          },
        ],
      },
    ],
    default: [],
  },
  packingOption: {
    type: String,
    enum: ["Alla rum", "Bara Kök"],
  },
  rutChecked: { type: Boolean }, // Indicates if RUT is checked
  discountPercentage: { type: Number }, // Discount percentage applied
  selectionType: {
    type: String,
    enum: ["Typiskt", "custom", "Kostnadsfri besiktning"],
    default: "Typiskt",
  },
  keyHandling: {
    type: [String],
    default: [],
  },
  selectedStorage: { type: String },
  storageDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("bookings", bookingSchema);
