const express = require("express");
const router = express.Router();
const Discount = require("../models/discount");
const dbConnect = require("../dbConnect");

dbConnect();

// ✅ Generate Random Discount Code
function generateDiscountCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ✅ Create a New Discount Code (with validation)
router.post("/generate", async (req, res) => {
  try {
    const { percentage, expiryDate } = req.body;

    // ✅ Validate: Ensure percentage is between 1-100
    if (!percentage || percentage < 1 || percentage > 100) {
      return res
        .status(400)
        .json({ error: "Percentage must be between 1 and 100." });
    }

    // ✅ Validate: Ensure expiryDate is provided and in the future
    if (!expiryDate || new Date(expiryDate) <= new Date()) {
      return res
        .status(400)
        .json({ error: "Expiry date must be a future date." });
    }

    // ✅ Generate unique discount code
    const code = generateDiscountCode();

    const newDiscount = new Discount({
      code,
      percentage,
      expiryDate,
      isActive: true,
    });

    await newDiscount.save();

    return res
      .status(201)
      .json({ message: "Discount code created!", discount: newDiscount });
  } catch (error) {
    console.error("Error generating discount code:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Validate Discount Code
router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Discount code is required." });
    }

    const discount = await Discount.findOne({
      code,
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (!discount) {
      return res
        .status(400)
        .json({ error: "Invalid or expired discount code" });
    }

    return res
      .status(200)
      .json({ valid: true, percentage: discount.percentage });
  } catch (error) {
    console.error("Error validating discount code:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch All Discount Codes
router.get("/", async (req, res) => {
  try {
    const discounts = await Discount.find({});
    res.json(discounts);
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    res.status(500).json({ error: "Failed to fetch discount codes" });
  }
});

// ✅ Delete Discount Code
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Discount.findByIdAndDelete(id);
    res.json({ message: "Discount code deleted successfully!" });
  } catch (error) {
    console.error("Error deleting discount code:", error);
    res.status(500).json({ error: "Failed to delete discount code" });
  }
});

module.exports = router;
