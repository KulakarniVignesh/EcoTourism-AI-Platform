const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const guideRoutes = require("./routes/guideRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const travelRoutes = require("./routes/travelRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("🌍 Eco Tourism AI Platform Backend Running 🚀");
});

// 404 Error Handler
app.use((req, res) => {
  res.status(404).json({
    reply: "Endpoint not found. Please check your API URL.",
    error: "Not Found"
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });

// Port Configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend Server running on http://0.0.0.0:${PORT}`);
});