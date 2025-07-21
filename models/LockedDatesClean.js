const mongoose = require("mongoose");

const LockedDateSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Storing as a string (YYYY-MM-DD)
});

module.exports = mongoose.model("LockedDateClean", LockedDateSchema);
