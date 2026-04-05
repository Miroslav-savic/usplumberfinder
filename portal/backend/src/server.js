const express = require("express");
const cors = require("cors");
const { port } = require("./config/config");
const connectDB = require("./config/db");

const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3002",
  "http://srv1463329.hstgr.cloud",
  "https://eprivrednik.com",
  "https://www.eprivrednik.com",
  "https://usclinicfinder.com",
  "https://www.usclinicfinder.com",
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});