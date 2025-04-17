const express = require("express");
const router = express.Router();
const Pricing = require("../models/cleanprice");
const dbConnect = require("../dbConnect");
const Discount = require("../models/discount");

dbConnect();

router.post("/", async (req, res) => {
  try {
    const { size } = req.body;

    const pricingTier = await Pricing.findOne({
      minSize: { $lte: size }, // Less than or equal to size
      maxSize: { $gte: size }, // Greater than or equal to size
    });

    if (!pricingTier) {
      return res
        .status(404)
        .json({ error: "Pricing data not found for selected size." });
    }

    const PricePerKvm = pricingTier.basePrice;
    let totalPrice = PricePerKvm * size;

    return res.status(200).json({
      price: totalPrice,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
