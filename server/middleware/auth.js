const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Verifies the Bearer token and attaches req.user (without the password).
async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User no longer exists" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function signToken(userId) {
  return jwt.sign({ id: userId }, SECRET, { expiresIn: "7d" });
}

module.exports = { protect, signToken };
