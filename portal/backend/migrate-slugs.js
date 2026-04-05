require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hospitals");
  const posts = await Post.find({ slug: { $exists: false } });
  console.log(`Migrating ${posts.length} posts...`);
  for (const post of posts) {
    await post.save(); // triggers pre-save slug generation
    console.log(`  ✓ ${post.companyName} → ${post.slug}`);
  }
  console.log("Done.");
  await mongoose.disconnect();
}

run().catch(console.error);
