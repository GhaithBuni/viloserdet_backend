const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome Admin!",
  });
});

module.exports = router;
