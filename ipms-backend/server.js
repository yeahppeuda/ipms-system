const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  require("dotenv").config();
  const app = express();

  /* =========================
    MIDDLEWARE
  ========================= */
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

  app.use(express.json());

  /* =========================
    HANDLE BAD JSON ERRORS
  ========================= */
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format"
      });
    }
    next();
  });

  /* =========================
    REQUEST LOGGER
  ========================= */
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  /* =========================
    DATABASE CONNECTION
  ========================= */
// Gamitin ang centralized DB connector para sa serverless-safe na connection caching
const connectDB = require("./utils/db");
  
  /* =========================
    DB CONNECTION MIDDLEWARE
  ========================= */
  // Tinitiyak na connected si Mongoose bago mag-execute ng kahit anong route
  // Ito ang serverless-safe na paraan — may connection caching, hindi mag-reconnect kung live pa
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error("❌ DB Connection Failed:", err.message);
      res.status(503).json({ success: false, message: "Database unavailable. Please try again." });
    }
  });

  /* =========================
    ROUTES
  ========================= */
  const authRoutes = require("./routes/authRoutes");
  const researchRoutes = require("./routes/researchRoutes");
  const eventRoutes = require("./routes/eventRoutes");
  const calendarRoutes = require("./routes/calendarRoutes"); 
  const userRoutes = require("./routes/userRoutes");
  const logRoutes = require("./routes/logRoutes");
  const inventoryRoutes = require("./routes/inventoryRoutes");

  app.use("/api/auth", authRoutes);
  app.use("/api/research", researchRoutes);
  app.use("/api/events", eventRoutes); 
  app.use("/api/calendar", calendarRoutes); 
  app.use("/api/users", userRoutes);
  app.use("/api/logs", logRoutes); 
  app.use("/api/inventory-of-technology", inventoryRoutes);

  /* =========================
    HEALTH CHECK
  ========================= */
  app.get("/", (req, res) => {
    res.json({
      status: "OK",
      message: "IPMS API is running smoothly",
      environment: process.env.NODE_ENV || "development"
    });
  });

  /* =========================
    404 HANDLER
  ========================= */
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.url} not found`
    });
  });

  /* =========================
    GLOBAL ERROR HANDLER
  ========================= */
  app.use((err, req, res, next) => {
    console.error("🔥 SERVER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  });

  /* =========================
    START SERVER (LOCAL ONLY) & EXPORT
  ========================= */
  // Patakbuhin lang ang server port kung HINDI production (hindi Vercel)
  if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running locally on http://localhost:${PORT}`);
    });

    // Ang graceful shutdown ay para sa local machine/tradisyunal na VPS lang
    process.on('SIGINT', async () => {
      console.log('Shutting down local server...');
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      server.close(() => {
        console.log('Server successfully closed.');
        process.exit(0);
      });
    });
  }

  // IMPORTANTE: Kailangan i-export ang app para makuha ng Vercel Serverless Functions
  module.exports = app;