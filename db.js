// =============================================
//  PassForge – db.js
//  MongoDB Connection via Mongoose
// =============================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/passforge';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process on failure
  }
};

module.exports = connectDB;