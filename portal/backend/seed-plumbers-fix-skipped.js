/**
 * seed-plumbers-fix-skipped.js
 * Re-runs all city searches and adds franchise plumbers (Roto-Rooter, Mr. Rooter, etc.)
 * that were previously skipped because companyName alone was used as duplicate check.
 * Now uses companyName + address — same company in different city = valid new entry.
 * Run: node seed-plumbers-fix-skipped.js [--dry-run]
 */

require("dotenv").config();
const mongoose = require("mongoose");
const https = require("https");
const Post = require("./src/models/postModel");

const API_KEY = "AIzaSyBBYA-lNAF_QICuxmTFR5jG0pCn-O3XS04";
const DRY_RUN = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/plumbers";

const ALL_CITIES = [
  // New York
  { city: "Manhattan",     state: "NY", target: 20 },
  { city: "Brooklyn",      state: "NY", target: 15 },
  { city: "Queens",        state: "NY", target: 15 },
  { city: "The Bronx",     state: "NY", target: 10 },
  { city: "Staten Island", state: "NY", target: 8 },
  // Chicago
  { city: "Chicago",       state: "IL", target: 30 },
  { city: "Evanston",      state: "IL", target: 8 },
  { city: "Oak Park",      state: "IL", target: 8 },
  { city: "Naperville",    state: "IL", target: 8 },
  { city: "Schaumburg",    state: "IL", target: 6 },
  // Dallas
  { city: "Dallas",        state: "TX", target: 30 },
  { city: "Fort Worth",    state: "TX", target: 12 },
  { city: "Arlington",     state: "TX", target: 8 },
  { city: "Plano",         state: "TX", target: 8 },
  { city: "Irving",        state: "TX", target: 6 },
  // Los Angeles
  { city: "Los Angeles",   state: "CA", target: 30 },
  { city: "Long Beach",    state: "CA", target: 10 },
  { city: "Glendale",      state: "CA", target: 8 },
  { city: "Santa Monica",  state: "CA", target: 8 },
  { city: "Burbank",       state: "CA", target: 6 },
  { city: "Pasadena",      state: "CA", target: 8 },
  // Miami
  { city: "Miami",         state: "FL", target: 30 },
  { city: "Miami Beach",   state: "FL", target: 10 },
  { city: "Hialeah",       state: "FL", target: 8 },
  { city: "Fort Lauderdale",state: "FL", target: 10 },
  { city: "Coral Gables",  state: "FL", target: 6 },
  { city: "Boca Raton",    state: "FL", target: 6 },
  // Seattle
  { city: "Seattle",       state: "WA", target: 30 },
  { city: "Bellevue",      state: "WA", target: 10 },
  { city: "Tacoma",        state: "WA", target: 10 },
  { city: "Redmond",       state: "WA", target: 6 },
  { city: "Kirkland",      state: "WA", target: 6 },
  { city: "Renton",        state: "WA", target: 6 },
];

const SEARCH_TYPES = [
  "plumber",
  "plumbing service",
  "emergency plumber",
  "drain cleaning service",
  "water heater installation",
  "pipe repair plumber",
];

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

function formatHours(periods) {
  if (!periods) return "";
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const map = {};
  for (const p of periods) {
    if (!p.open) continue;
    const day = days[p.open.day];
    const open = p.open.time.replace(/(\d{2})(\d{2})/, (_, h, m) => {
      const hr = parseInt(h);
      return `${hr > 12 ? hr-12 : hr || 12}:${m}${hr >= 12 ? "PM" : "AM"}`;
    });
    const close = p.close ? p.close.time.replace(/(\d{2})(\d{2})/, (_, h, m) => {
      const hr = parseInt(h);
      return `${hr > 12 ? hr-12 : hr || 12}:${m}${hr >= 12 ? "PM" : "AM"}`;
    }) : "Open 24h";
    map[day] = `${open}–${close}`;
  }
  return Object.entries(map).map(([d, h]) => `${d}: ${h}`).join(", ");
}

function inferSpecialties(name) {
  const text = name.toLowerCase();
  const found = new Set();
  if (text.includes("drain") || text.includes("clog")) found.add("Drain Cleaning");
  if (text.includes("sewer")) found.add("Sewer Line");
  if (text.includes("water heater") || text.includes("boiler")) found.add("Water Heater");
  if (text.includes("emergency") || text.includes("24") || text.includes("urgent")) found.add("Emergency");
  if (text.includes("leak") || text.includes("detect")) found.add("Leak Detection");
  if (text.includes("gas")) found.add("Gas Line");
  if (text.includes("bath")) found.add("Bathroom");
  if (text.includes("kitchen") || text.includes("sink")) found.add("Kitchen");
  if (text.includes("repip")) found.add("Repiping");
  if (text.includes("backflow")) found.add("Backflow");
  if (text.includes("sump")) found.add("Sump Pump");
  if (text.includes("toilet")) found.add("Toilet Repair");
  if (text.includes("faucet") || text.includes("fixture")) found.add("Faucet & Fixture");
  if (text.includes("water softener") || text.includes("filter")) found.add("Water Softener");
  if (text.includes("pipe") || text.includes("pip")) found.add("Pipe Repair");
  if (found.size === 0) { found.add("Drain Cleaning"); found.add("Pipe Repair"); }
  return Array.from(found);
}

function buildContent(name, city, state, specialties, address, phone, workingHours) {
  const specs = specialties.join(", ");
  const specDescriptions = {
    "Drain Cleaning":   "Professional drain cleaning and unclogging for kitchen, bathroom, and main sewer drains. Using hydro-jetting and snake equipment to clear stubborn blockages fast.",
    "Pipe Repair":      "Expert diagnosis and repair of burst, leaking, or corroded pipes. Trenchless options available to minimize property disruption.",
    "Water Heater":     "Installation, repair, and replacement of tank and tankless water heaters. Same-day service available for no hot water emergencies.",
    "Emergency":        "24/7 emergency plumbing response for burst pipes, major leaks, and flooding. Fast arrival times across the service area.",
    "Leak Detection":   "Non-invasive leak detection using advanced acoustic and thermal imaging equipment to pinpoint hidden leaks in walls, slabs, and underground pipes.",
    "Sewer Line":       "Sewer line inspection, cleaning, repair, and replacement. Camera inspections available to assess line condition without digging.",
    "Bathroom":         "Complete bathroom plumbing services including toilet, shower, bathtub, and vanity installation and repair.",
    "Kitchen":          "Kitchen plumbing services covering sink installation, garbage disposal repair, dishwasher hookup, and faucet replacement.",
    "Gas Line":         "Licensed gas line installation, repair, and pressure testing for residential and commercial properties. Safety inspections included.",
    "Repiping":         "Full or partial repiping using copper, PEX, or CPVC. Recommended for older homes with galvanized or polybutylene piping.",
    "Backflow":         "Backflow preventer installation, testing, and certification to protect your drinking water supply.",
    "Sump Pump":        "Sump pump installation, repair, and battery backup systems to protect your basement from flooding.",
    "Toilet Repair":    "Toilet repair, replacement, and unclogging. Fixing running toilets, weak flushes, and leaking bases.",
    "Faucet & Fixture": "Faucet, fixture, and valve installation and repair. Wide selection of brands and styles available.",
    "Water Softener":   "Water softener and whole-house filtration system installation and maintenance to improve water quality.",
  };
  const specItems = specialties.map(s =>
    `<div class="spec-item"><strong>${s}</strong><p>${specDescriptions[s] || "Professional plumbing service delivered by licensed, experienced technicians."}</p></div>`
  ).join("");
  const hoursHtml = workingHours
    ? `<div class="hours-block"><h3>Working Hours</h3><table class="hours-table"><tr><td>${workingHours.replace(/, /g, "</td></tr><tr><td>").replace(/: /g, "</td><td>")}</td></tr></table></div>`
    : "";
  return [
    `<p>${name}, based in ${city}, ${state}, provides professional plumbing services including ${specs}. The team is fully licensed and insured, with technicians who arrive on time, diagnose accurately, and complete every job to code.</p>`,
    `<p>Whether it's a dripping faucet or a burst main line, ${name} handles jobs of all sizes with the same level of professionalism. Transparent pricing and upfront quotes mean no surprises on the final bill.</p>`,
    `<div class="spec-block"><h3>Services</h3>${specItems}</div>`,
    address ? `<p>${name} serves customers in ${city} and the surrounding ${state} area. Located at ${address.replace(", USA", "")}. ${phone ? `For service requests or estimates, call ${phone}.` : ""}</p>` : "",
    hoursHtml,
  ].filter(Boolean).join("\n");
}

async function searchPlumbers(city, state, searchType) {
  const query = encodeURIComponent(`${searchType} in ${city}, ${state}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`;
  const data = await httpsGet(url);
  return data.results || [];
}

async function getDetails(placeId) {
  const fields = "name,formatted_address,formatted_phone_number,website,opening_hours,geometry,photos,types";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const data = await httpsGet(url);
  return data.result || null;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);
  console.log("Mode: fix skipped (companyName+address duplicate check)\n");

  let totalAdded = 0;

  for (const { city, state, target } of ALL_CITIES) {
    const existing = await Post.countDocuments({ address: { $regex: city, $options: "i" } });
    const needed = Math.max(0, target - existing);
    console.log(`\n── ${city}, ${state} — existing: ${existing}, target: ${target}, need: ${needed} more`);
    if (needed === 0) { console.log("  Skipping — already has enough"); continue; }

    const seen = new Set();
    let added = 0;

    for (const searchType of SEARCH_TYPES) {
      if (added >= needed) break;
      console.log(`  Searching: "${searchType} in ${city}"...`);

      let results;
      try {
        results = await searchPlumbers(city, state, searchType);
        await sleep(400);
      } catch(e) {
        console.log(`  Error: ${e.message}`);
        continue;
      }

      for (const place of results) {
        if (added >= needed) break;
        if (seen.has(place.place_id)) continue;
        seen.add(place.place_id);

        // Duplicate check: same name AND same address = skip, same name different address = allow
        const exists = await Post.exists({ companyName: place.name, address: place.formatted_address || "" });
        if (exists) { console.log(`  → Skip (exists at this address): ${place.name}`); continue; }

        let details = null;
        try {
          details = await getDetails(place.place_id);
          await sleep(400);
        } catch(e) {
          console.log(`  → Error fetching details for ${place.name}`);
          continue;
        }
        if (!details) continue;

        const address = details.formatted_address || place.formatted_address || "";
        const phone = details.formatted_phone_number || "";
        const website = details.website || "";
        const lat = details.geometry?.location?.lat || place.geometry?.location?.lat;
        const lng = details.geometry?.location?.lng || place.geometry?.location?.lng;
        const workingHours = formatHours(details.opening_hours?.periods);
        const specialties = inferSpecialties(place.name);
        const content = buildContent(place.name, city, state, specialties, address, phone, workingHours);

        let imageUrl = "";
        if (details.photos?.[0]?.photo_reference) {
          imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[0].photo_reference}&key=${API_KEY}`;
        }

        const postData = {
          companyName: place.name,
          title: `${place.name} – ${city}, ${state}`,
          content,
          address,
          lat,
          lng,
          phone,
          website,
          workingHours,
          specialties,
          imageUrl,
          status: "active",
        };

        if (DRY_RUN) {
          console.log(`  [DRY] Would add: ${place.name} | ${address}`);
        } else {
          try {
            const post = new Post(postData);
            await post.save();
            console.log(`  ✓ Added: ${place.name} | ${city}`);
          } catch(e) {
            console.log(`  ✗ Failed: ${place.name} — ${e.message}`);
            continue;
          }
        }
        added++;
      }
    }

    console.log(`  → ${city}: added ${added}`);
    totalAdded += added;
  }

  console.log(`\n✓ Done. Total added: ${totalAdded}`);
  await mongoose.disconnect();
}

run().catch(console.error);
