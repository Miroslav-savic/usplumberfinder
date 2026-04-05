const User = require("../models/userModel");

async function getMe(req, res) {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(user);
}

async function getAllUsers(req, res) {
  const users = await User.find().select("-password");
  return res.json(users);
}

module.exports = { getMe, getAllUsers };
