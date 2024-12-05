// db.js
const mongoose = require('mongoose');
require('dotenv').config();  // Đọc các biến môi trường từ file .env

const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Đã kết nối tới MongoDB');
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
