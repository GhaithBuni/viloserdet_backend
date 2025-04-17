require("dotenv").config(); // Load environment variables
const express = require("express");
const router = express.Router();
const Pricing = require("../models/price");
const dbConnect = require("../dbConnect");
const Discount = require("../models/discount"); // ✅ Import Discount model
const axios = require("axios");

// Connect to database
dbConnect();

async function getDistance(startPostcode, endPostcode) {
  const apiKey = process.env.GOOGLE_API_KEY; // Use environment variable for API key
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${startPostcode},Sweden&destinations=${endPostcode}, Sweden&region=se&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (
      response.data.rows[0].elements[0].status === "OK" &&
      response.data.status === "OK" &&
      response.data.origin_addresses[0] !== "Sweden" &&
      response.data.destination_addresses[0] !== "Sweden"
    ) {
      console.log(
        "Distance fetched successfully:",
        response.data.rows[0].elements[0].status
      );
      const distanceInMeters = response.data.rows[0].elements[0].distance.value;
      return distanceInMeters / 1000; // Convert meters to kilometers
    } else {
      console.error(
        "Google API Error:",
        response.data.rows[0].elements[0].status
      );
      throw new Error("Invalid postal codes or API quota exceeded.");
    }
  } catch (error) {
    console.error("Error fetching distance:", error);
    throw new Error("Kunde inte hämta avståndet. Kontrollera postnumren.");
  }
}
// ✅ GET route (for testing)
router.get("/", async (req, res) => {
  res.status(200).json({ message: "Pricing API is working!" });
});

// ✅ POST route for price calculation (Now with Discount Support)
router.post("/", async (req, res) => {
  try {
    const {
      size,
      floor,
      startPostcode,
      endPostcode,
      newFloor,
      elevator,
      newElevator,
      parkingDistance,
      parkingDistanceTo,
      discountCode,
    } = req.body;

    const distance = await getDistance(startPostcode, endPostcode);

    if (!distance) {
      return res
        .status(400)
        .json({ error: "Kunde inte hämta avståndet. Kontrollera postnumren." });
    }

    const pricingTier = await Pricing.findOne({
      minSize: { $lte: size }, // Less than or equal to size
      maxSize: { $gte: size }, // Greater than or equal to size
    });

    if (!pricingTier) {
      return res.status(404).json({
        error:
          "Pris för denna storlek finns inte i våra data. Vänligen kontakta oss för ett prisförslag.",
      });
    }

    let totalPrice = pricingTier.basePrice;

    let cleaningFee = pricingTier.cleaningCost * size;
    const totalCleaning = Math.round(cleaningFee * 0.85);

    // Extra distance cost
    if (distance > 31 && distance <= 200) {
      totalPrice += pricingTier.extraKmCost.from31to200km * (distance - 31);
    } else if (distance > 200) {
      totalPrice += pricingTier.extraKmCost.from31to200km * (200 - 31);
      totalPrice += pricingTier.extraKmCost.above200km * (distance - 200);
    }
    // Floor cost (if no elevator)
    if (elevator === "Ingen Hiss") {
      if (floor >= 3 && 4 >= floor) {
        totalPrice += pricingTier.noElevatorCost.floors3to4;
      } else if (floor >= 5 && 8 >= floor) {
        totalPrice += pricingTier.noElevatorCost.floors5to8;
      }
    }

    if (newElevator === "Ingen Hiss") {
      if (newFloor >= 3 && 4 >= newFloor) {
        totalPrice += pricingTier.noElevatorCost.floors3to4;
      } else if (newFloor >= 5 && 8 >= newFloor) {
        totalPrice += pricingTier.noElevatorCost.floors5to8;
      }
    }

    // Parking distance
    if (parkingDistance >= 26 && parkingDistance <= 50) {
      totalPrice += pricingTier.parkingDistance.between26to50m;
    } else if (parkingDistance >= 15 && parkingDistance <= 25) {
      totalPrice += pricingTier.parkingDistance.within25m;
    }

    if (parkingDistanceTo >= 26 && parkingDistanceTo <= 50) {
      totalPrice += pricingTier.parkingDistance.between26to50m;
    }
    if (parkingDistanceTo >= 15 && parkingDistanceTo <= 25) {
      totalPrice += pricingTier.parkingDistance.within25m;
    }

    // ✅ Apply Discount if Discount Code is Provided
    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode,
        isActive: true,
        expiryDate: { $gte: new Date() },
      });

      if (discount) {
        const discountAmount = (totalPrice * discount.percentage) / 100;
        totalPrice -= discountAmount; // Apply discount
      } else {
        return res
          .status(400)
          .json({ error: "Invalid or expired discount code" });
      }
    }

    return res.status(200).json({
      price: Math.round(totalPrice),
      distance: distance + " km",
      packning: pricingTier.PackgingService,
      FurniturePrice: pricingTier.furnitureRemoval,
      cleaning: totalCleaning,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
