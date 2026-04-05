require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  const portalConn = await mongoose.createConnection("mongodb://localhost:27017/portal").asPromise();
  const hospitalsConn = await mongoose.createConnection("mongodb://localhost:27017/hospitals").asPromise();

  const users = await portalConn.db.collection("users").find({}).toArray();
  console.log(`Kopiranje ${users.length} korisnika...`);

  if (users.length > 0) {
    await hospitalsConn.db.collection("users").deleteMany({});
    await hospitalsConn.db.collection("users").insertMany(users);
    console.log("Gotovo.");
  } else {
    console.log("Nema korisnika u portal bazi.");
  }

  await portalConn.close();
  await hospitalsConn.close();
}

run().catch(console.error);
