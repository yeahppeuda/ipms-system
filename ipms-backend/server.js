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
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

/* =========================
   ROUTES
========================= */
// Make sure these files exist inside your /routes folder!
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
    message: "IPMS API is running smoothly"
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
   START SERVER & GRACEFUL SHUTDOWN
========================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Pro-tip: Graceful shutdown to prevent database connection leaks
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  server.close(() => {
    console.log('Server successfully closed.');
    process.exit(0);
  });
});