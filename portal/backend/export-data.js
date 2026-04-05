require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const LOCAL = "mongodb://localhost:27017/hospitals";

async function run() {
  const conn = await mongoose.createConnection(LOCAL).asPromise();

  const collections = ["posts", "users", "reviews"];
  const out = {};

  for (const col of collections) {
    const docs = await conn.db.collection(col).find({}).toArray();
    out[col] = docs;
    console.log(`✓ ${col}: ${docs.length} dokumenata`);
  }

  fs.writeFileSync(
    path.join(__dirname, "hospitals-export.json"),
    JSON.stringify(out, null, 2)
  );

  await conn.close();
  console.log("\nSačuvano u hospitals-export.json");
}

run().catch(console.error);
