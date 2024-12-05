const User = require("../models/userModel")
const jwt = require("jsonwebtoken");

let refreshTokens = []; // Lưu trữ tạm thời refresh token (nên dùng DB hoặc Redis)

// Tạo access token
const createAccessToken = (user) => {
  return jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_ACCESS_KEY, {
    expiresIn: "15m",
  });
};

// Tạo refresh token
const createRefreshToken = (user) => {
  return jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_REFRESH_KEY, {
    expiresIn: "7d",
  });
};

// Đăng ký
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json("Email đã được sử dụng.");

    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json("Tên tài khoản đã tồn tại.");

    const newUser = new User({ username, email, password });
    const savedUser = await newUser.save();
    res.status(201).json({
      message: "Tạo tài khoản thành công",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.isAdmin ? 'admin' : 'user',
      },
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Đăng nhập
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json("Email không tồn tại.");

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json("Mật khẩu không đúng.");

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.isAdmin ? 'admin' : 'user',
      },
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};


// Refresh token
const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json("Bạn chưa đăng nhập.");

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token không hợp lệ.");
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
    if (err) return res.status(403).json("Token không hợp lệ.");

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    // Cập nhật refresh token
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    refreshTokens.push(newRefreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.json({ accessToken: newAccessToken });
  });
};

// Đăng xuất
const logoutUser = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.clearCookie("refreshToken");
  res.json("Đăng xuất thành công.");
};

module.exports = { registerUser, loginUser, refreshToken, logoutUser };
