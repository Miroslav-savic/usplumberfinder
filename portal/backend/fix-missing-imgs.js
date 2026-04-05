require("dotenv").config();
const mongoose = require("mongoose");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const Post = require("./src/models/postModel");

const UPLOADS_DIR = path.join(__dirname, "uploads");

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    proto.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error("HTTP " + res.statusCode));
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

const fixes = [
  { order: 1001, imgId: 2280548 },
  { order: 1003, imgId: 532787 },
];

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/portal")
  .then(async () => {
    for (const { order, imgId } of fixes) {
      const url = `https://images.pexels.com/photos/${imgId}/pexels-photo-${imgId}.jpeg?w=800`;
      const filename = `fix-${Date.now()}-${imgId}.jpg`;
      const dest = path.join(UPLOADS_DIR, filename);
      try {
        await downloadImage(url, dest);
        await Post.findOneAndUpdate({ order }, { imageUrl: `/uploads/${filename}` });
        console.log(`✓ order ${order} → ${filename}`);
      } catch (e) {
        console.error(`✗ order ${order}: ${e.message}`);
      }
    }
    await mongoose.disconnect();
  });
