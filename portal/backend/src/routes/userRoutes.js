const express = require("express");
const { getMe, getAllUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, getAllUsers);

module.exports = router;
