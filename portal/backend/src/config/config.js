require("dotenv").config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "my_secret_key",
  jwtExpiresIn: "1h",
  port: process.env.PORT || 4001,
};
