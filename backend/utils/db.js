const mongoose = require("mongoose");

// Cache the connection promise so serverless invocations reuse it.
let connectionPromise = null;

const connectDB = () => {
  if (!process.env.MONGO_URI) {
    return Promise.reject(new Error("MONGO_URI is not configured"));
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then((conn) => {
        console.log("MongoDB connected");
        return conn;
      })
      .catch((err) => {
        connectionPromise = null; // allow retry on next request
        throw err;
      });
  }
  return connectionPromise;
};

module.exports = connectDB;
