const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require("cookie-parser")
const connectDB = require('./config/db')
const authRoute = require("./routes/authRoute");
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json());
app.use(cors());
app.use(cookieParser());


// Kết nối tới MongoDB connectDB();
connectDB();

//Route
app.use('/api/auth', authRoute);

// Đọc các biến môi trường từ file .env dotenv.config();
dotenv.config();
// Khởi động server
const port = process.env.PORT || 3000;
app.listen(port, () => { 
    // In thông báo khi server khởi động thành công });
    console.log(`Server đang chạy trên http://localhost:${port}`)
}); 
