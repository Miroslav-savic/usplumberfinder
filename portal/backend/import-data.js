require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const REMOTE = process.env.MONGO_URI || "mongodb://localhost:27017/hospitals";

async function run() {
  const file = path.join(__dirname, "hospitals-export.json");
  if (!fs.existsSync(file)) {
    console.error("hospitals-export.json nije pronađen!");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  const conn = await mongoose.createConnection(REMOTE).asPromise();

  for (const [col, docs] of Object.entries(data)) {
    if (!docs.length) { console.log(`${col}: prazno, preskačem`); continue; }
    await conn.db.collection(col).deleteMany({});
    await conn.db.collection(col).insertMany(docs);
    console.log(`✓ ${col}: ${docs.length} dokumenata importovano`);
  }

  await conn.close();
  console.log("\nImport završen.");
}

run().catch(console.error);
