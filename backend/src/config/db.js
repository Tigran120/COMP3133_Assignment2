const mongoose = require('mongoose');

const DB_NAME = process.env.DB_NAME || 'comp3133_101498001_Assigment1';
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
