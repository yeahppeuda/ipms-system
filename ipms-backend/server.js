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
    DATABASE CONNECTION (Serverless-safe)
  ========================= */
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in environment variables");
    // Inalis ang process.exit(1) para hindi mag-crash ang Vercel container bago pa man makasagot sa request
  }

  // Ginagamit natin ang `global` object para mag-persist ang cached connection
  // sa pagitan ng mga invocation ng SAME warm container sa Vercel.
  // Kung walang ganito, posibleng gumawa ng bagong koneksyon (o sumubok sa patay na
  // koneksyon) sa BAWAT request, na sanhi ng 500 error o connection exhaustion.
  let cached = global._mongooseConn;

  if (!cached) {
    cached = global._mongooseConn = { conn: null, promise: null };
  }

  async function connectDB() {
    // 1 = connected. Kung connected na ang cached conn, gamitin agad ito.
    if (cached.conn && mongoose.connection.readyState === 1) {
      return cached.conn;
    }

    // Kung walang ongoing connection attempt, gumawa ng bago.
    if (!cached.promise) {
      cached.promise = mongoose
        .connect(process.env.MONGO_URI, {
          maxPoolSize: 5,
          serverSelectionTimeoutMS: 5000,
        })
        .then((mongooseInstance) => {
          console.log("✅ MongoDB Connected Successfully");
          return mongooseInstance;
        })
        .catch((err) => {
          console.error("❌ MongoDB Connection Error:", err.message);
          // I-reset ang promise para puwedeng ulitin sa susunod na request
          cached.promise = null;
          throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  }

  /* =========================
    GLOBAL CONNECTION MIDDLEWARE
    Tinitiyak na "buhay" ang koneksyon BAGO pumasok sa anumang route.
  ========================= */
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Database connection failed. Please try again.",
      });
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