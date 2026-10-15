const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "1d";
const MAX_NAME = 80;
const MAX_EMAIL = 254;
const MAX_PASSWORD = 72; // bcrypt ignores everything after 72 bytes

const isText = (v, max) => typeof v === "string" && v.length > 0 && v.length <= max;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: TOKEN_EXPIRY });

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

// POST /auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate here first: hashing would otherwise hide a too-short password
    if (!isText(name, MAX_NAME) || !isText(email, MAX_EMAIL) || !isText(password, MAX_PASSWORD)) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required (password up to 72 characters)",
      });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ success: true, token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!isText(email, MAX_EMAIL) || !isText(password, MAX_PASSWORD)) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      // Same message for both cases so attackers can't tell which emails exist
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({ success: true, token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
