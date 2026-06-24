const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ipms2026:2026ipms@ipms-cluster.zwbn5c9.mongodb.net/ipmsdb?retryWrites=true&w=majority&appName=ipms-cluster";

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  await mongoose.connect(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false
  });

  isConnected = true;
  console.log("✅ MongoDB Connected Successfully");
}

module.exports = connectDB;