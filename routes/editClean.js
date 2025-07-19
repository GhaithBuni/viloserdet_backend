const express = require("express");
const router = express.Router();
const Pricing = require("../models/cleanprice");

// Get all pricing entries
router.get("/", async (req, res) => {
  const data = await Pricing.find();
  res.json(data);
});

// Update a specific pricing entry
router.put("/:id", async (req, res) => {
  try {
    const updated = await Pricing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
