/**
 * migrate-ratings.js
 * Fetches Google Places ratings for all posts that have rating=0
 * Run: node migrate-ratings.js [--dry-run]
 */

require("dotenv").config();
const mongoose = require("mongoose");
const https = require("https");
const Post = require("./src/models/postModel");

const API_KEY = "AIzaSyBBYA-lNAF_QICuxmTFR5jG0pCn-O3XS04";
const DRY_RUN = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/plumbers";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = "";
      res.on("data", c => { d += c; });
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    }).on("error", reject);
  });
}

async function findRating(companyName, address) {
  const query = encodeURIComponent(`${companyName} ${address}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`;
  const data = await httpsGet(url);
  const result = (data.results || [])[0];
  if (!result) return null;
  return {
    rating: result.rating || 0,
    reviewCount: result.user_ratings_total || 0,
  };
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);
  console.log("Mode:", DRY_RUN ? "DRY RUN" : "LIVE\n");

  const posts = await Post.find({ $or: [{ rating: 0 }, { rating: { $exists: false } }] }, { _id: 1, companyName: 1, address: 1 });
  console.log(`Found ${posts.length} posts without rating\n`);

  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    process.stdout.write(`[${i + 1}/${posts.length}] ${post.companyName}... `);

    try {
      const r = await findRating(post.companyName, post.address);
      await sleep(250);

      if (!r || r.rating === 0) {
        console.log("no rating");
        notFound++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`[DRY] ${r.rating} ⭐ (${r.reviewCount} reviews)`);
      } else {
        await Post.updateOne({ _id: post._id }, { $set: { rating: r.rating, reviewCount: r.reviewCount } });
        console.log(`✓ ${r.rating} ⭐ (${r.reviewCount} reviews)`);
        updated++;
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
  }

  console.log(`\nDone. Updated: ${updated}, No rating found: ${notFound}`);
  await mongoose.disconnect();
}

run().catch(console.error);
