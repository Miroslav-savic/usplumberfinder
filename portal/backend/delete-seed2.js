require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/portal")
  .then(async () => {
    const result = await Post.deleteMany({ order: { $gte: 1000 } });
    console.log("Obrisano:", result.deletedCount, "klinika");
    await mongoose.disconnect();
  })
  .catch(e => { console.error(e); process.exit(1); });
