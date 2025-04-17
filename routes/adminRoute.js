const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { username, password } = req.body; // Changed from email to username
  if (!username || !password) {
    // Changed from email to username
    return res.status(400).json({ message: "Missing username or password" }); // Updated message
  }

  const admin = await Admin.findOne({ username }); // Changed from email to username
  if (!admin) {
    console.log("❌ Admin Not Found");
    return res.status(403).json({ message: "Unauthorized: Admin not found" });
  }

  try {
    // Debug bcrypt.compare()
    const isMatch = await bcrypt.compare(
      password.trim(),
      admin.password.trim()
    );

    if (!isMatch) {
      console.log("❌ Password does not match");
      return res
        .status(400)
        .json({ message: "Invalid credentials: Password does not match" });
    }

    const token = jwt.sign({ username: admin.username }, "secretkey", {
      // Changed from email to username
      expiresIn: "1d",
    });

    console.log("✅ Login successful");
    res.json({ token });
  } catch (err) {
    console.log("❌ bcrypt error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
