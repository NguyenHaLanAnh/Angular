const jwt = require("jsonwebtoken");

/**
 * Middleware xác thực access token
 */
const verifyToken = (req, res, next) => {
  // Lấy header Authorization
  const authHeader = req.headers.authorization; 
  if (!authHeader) {
    return res.status(401).json("Bạn chưa đăng nhập. Vui lòng đăng nhập."); 
  }

  const token = authHeader.split(" ")[1]; 
  if (!token) {
    return res.status(401).json("Token không được cung cấp."); 
  }

  // Xác thực token
  jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
    if (err) {
      console.error("Lỗi xác thực token:", err.message); 
      return res.status(403).json("Token không hợp lệ hoặc đã hết hạn."); 
    }
    req.user = user; 
    next();
  });
};



module.exports = {
  verifyToken,
};
