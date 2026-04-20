require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/plumbers").then(async () => {
  const result = await Post.deleteMany({
    address: { $regex: "UK|Canada|Ontario|Quebec|CB4|WR4|Burlington, ON|Windsor, ON", $options: "i" }
  });
  console.log("Deleted:", result.deletedCount, "non-US records");
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
