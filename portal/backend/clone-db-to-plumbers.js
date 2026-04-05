require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  console.log("Kreiranje strukture baze: plumbers (po uzoru na hospitals)...");

  const sourceConn = await mongoose.createConnection("mongodb://localhost:27017/hospitals").asPromise();
  const targetConn = await mongoose.createConnection("mongodb://localhost:27017/plumbers").asPromise();

  const collections = await sourceConn.db.listCollections().toArray();
  console.log(`Pronađeno kolekcija: ${collections.map(c => c.name).join(", ")}`);

  for (const { name } of collections) {
    // Kreiraj praznu kolekciju
    try {
      await targetConn.db.createCollection(name);
      console.log(`  ${name}: kolekcija kreirana`);
    } catch (e) {
      console.log(`  ${name}: već postoji`);
    }

    // Kopiraj indekse
    const indexes = await sourceConn.db.collection(name).indexes();
    for (const idx of indexes) {
      if (idx.name === "_id_") continue;
      try {
        const options = { name: idx.name };
        if (idx.unique) options.unique = true;
        if (idx.sparse) options.sparse = true;
        if (idx.weights) options.weights = idx.weights;
        if (idx.default_language) options.default_language = idx.default_language;
        await targetConn.db.collection(name).createIndex(idx.key, options);
        console.log(`    indeks '${idx.name}' kreiran`);
      } catch (e) {
        console.log(`    indeks '${idx.name}' preskočen: ${e.message}`);
      }
    }
  }

  console.log("\nGotovo! Baza 'plumbers' ima istu strukturu kao 'hospitals' (bez podataka).");
  await sourceConn.close();
  await targetConn.close();
}

run().catch(console.error);
