// models/ExtraService.js
const mongoose = require("mongoose");

const extraServiceSchema = new mongoose.Schema({
  extraBadrum: { type: Number, default: 0 },
  extraToalett: { type: Number, default: 0 },
  inglasadDuschhörna: { type: Number, default: 0 },
  diskmaskin: { type: Number, default: 0 },
  torktumlare: { type: Number, default: 0 },
  tvattmaskin: { type: Number, default: 0 },
  persienner: { type: Number, default: 0 },
});
const ExtraService = mongoose.model("ExtraService", extraServiceSchema);
module.exports = ExtraService;
