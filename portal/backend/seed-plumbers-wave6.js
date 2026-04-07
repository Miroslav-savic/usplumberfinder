/**
 * seed-plumbers-wave6.js
 * Seeds ~200 more plumbers from remaining US cities.
 * Run: node seed-plumbers-wave6.js [--dry-run]
 */

require("dotenv").config();
const mongoose = require("mongoose");
const https = require("https");
const Post = require("./src/models/postModel");

const API_KEY = "AIzaSyBBYA-lNAF_QICuxmTFR5jG0pCn-O3XS04";
const DRY_RUN = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/plumbers";

const ALL_CITIES = [
  { city: "Tulsa",          state: "OK", target: 20 },
  { city: "Lexington",      state: "KY", target: 15 },
  { city: "Greensboro",     state: "NC", target: 15 },
  { city: "Durham",         state: "NC", target: 12 },
  { city: "Chandler",       state: "AZ", target: 12 },
  { city: "Gilbert",        state: "AZ", target: 10 },
  { city: "Glendale",       state: "AZ", target: 10 },
  { city: "Laredo",         state: "TX", target: 10 },
  { city: "Lubbock",        state: "TX", target: 10 },
  { city: "Garland",        state: "TX", target: 10 },
  { city: "Irving",         state: "TX", target: 10 },
  { city: "Hialeah",        state: "FL", target: 10 },
  { city: "Tallahassee",    state: "FL", target: 10 },
  { city: "Stockton",       state: "CA", target: 12 },
  { city: "Irvine",         state: "CA", target: 12 },
  { city: "Fremont",        state: "CA", target: 10 },
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

const SPEC_DESCRIPTIONS = {
  "Drain Cleaning":   "clearing blocked drains using hydro-jetting and professional snake equipment — from kitchen sinks to main sewer lines",
  "Pipe Repair":      "diagnosing and repairing burst, leaking, or corroded pipes with trenchless options available to minimize disruption",
  "Water Heater":     "installing, repairing, and replacing tank and tankless water heaters with same-day service for emergencies",
  "Emergency":        "providing 24/7 emergency response for burst pipes, major leaks, and flooding with fast arrival times",
  "Leak Detection":   "locating hidden leaks using non-invasive acoustic and thermal imaging equipment — no unnecessary digging",
  "Sewer Line":       "inspecting, cleaning, and repairing sewer lines with camera technology to assess condition before any work begins",
  "Bathroom":         "handling complete bathroom plumbing including toilets, showers, bathtubs, and vanity installations",
  "Kitchen":          "covering kitchen plumbing from sink installation and garbage disposal repair to dishwasher hookups",
  "Gas Line":         "installing and testing gas lines for residential and commercial properties with full safety inspections",
  "Repiping":         "repiping homes fully or partially using copper, PEX, or CPVC — especially recommended for older galvanized systems",
  "Backflow":         "installing and certifying backflow preventers to keep your drinking water supply safe",
  "Sump Pump":        "installing sump pumps and battery backup systems to protect basements from flooding",
  "Toilet Repair":    "fixing running toilets, weak flushes, leaking bases, and complete toilet replacements",
  "Faucet & Fixture": "installing and repairing faucets, fixtures, and valves across all major brands",
  "Water Softener":   "installing whole-house water softeners and filtration systems to improve water quality",
};

const OPENERS = [
  (n,c,s) => `<p>${n} is a licensed and insured plumbing company serving ${c}, ${s} and the surrounding area. With a team of experienced technicians, they handle everything from routine maintenance to full plumbing emergencies.</p>`,
  (n,c,s) => `<p>Based in ${c}, ${s}, ${n} has built a reputation for reliable, on-time plumbing service. Every job — from a dripping faucet to a burst main line — is handled with the same level of professionalism and attention to detail.</p>`,
  (n,c,s) => `<p>${n} provides professional plumbing services throughout ${c} and ${s}. Fully licensed and insured, their technicians arrive on time, diagnose accurately, and complete every job to code with upfront, transparent pricing.</p>`,
  (n,c,s) => `<p>Homeowners and businesses in ${c}, ${s} trust ${n} for dependable plumbing solutions. Their licensed team is equipped to handle any plumbing issue efficiently, with clear communication and no hidden fees.</p>`,
  (n,c,s) => `<p>When plumbing problems strike in ${c}, ${s}, residents call ${n}. The company's certified technicians are known for fast response, honest assessments, and quality workmanship backed by a satisfaction guarantee.</p>`,
  (n,c,s) => `<p>${n} serves the ${c}, ${s} area with a full range of residential and commercial plumbing services. Their team is licensed, insured, and committed to getting the job done right the first time.</p>`,
];

const CLOSERS = [
  (n,c,s,p) => `<p>${n} serves ${c} and nearby communities across ${s}. ${p ? `Call <strong>${p}</strong> for a free estimate or to schedule same-day service.` : "Contact them today for a free estimate."}</p>`,
  (n,c,s,p) => `<p>Serving ${c}, ${s} and surrounding areas, ${n} is available for both scheduled appointments and emergency calls. ${p ? `Reach them at <strong>${p}</strong>.` : ""}</p>`,
  (n,c,s,p) => `<p>Whether you're in ${c} or a nearby part of ${s}, ${n} can help. ${p ? `Give them a call at <strong>${p}</strong> — they offer free quotes and competitive rates.` : "Free quotes available on request."}</p>`,
  (n,c,s,p) => `<p>${n} is proud to serve the ${c}, ${s} community. ${p ? `For service requests or estimates, call <strong>${p}</strong> any time.` : "Contact them today to get started."}</p>`,
];

function buildContent(name, city, state, specialties, phone, workingHours, rating, reviewCount, idx) {
  const opener = OPENERS[idx % OPENERS.length](name, city, state);
  const closer = CLOSERS[idx % CLOSERS.length](name, city, state, phone);
  const ratingTemplates = [
    `<p>${name} holds a ${rating?.toFixed(1)}★ rating based on ${reviewCount} customer reviews — a track record that reflects consistent quality.</p>`,
    `<p>With ${reviewCount} verified reviews and a ${rating?.toFixed(1)}-star average, ${name} is one of the top-rated plumbing companies in the area.</p>`,
    `<p>Customers rate ${name} ${rating?.toFixed(1)} out of 5 stars across ${reviewCount} reviews, highlighting their reliability and fair pricing.</p>`,
    `<p>${name} has earned a ${rating?.toFixed(1)}★ rating from ${reviewCount} customers who praise their professionalism and transparent billing.</p>`,
  ];
  const ratingHtml = rating > 0 ? ratingTemplates[idx % ratingTemplates.length] : "";
  const specItems = specialties.map(s =>
    `<div class="spec-item"><strong>${s}</strong><p>${name} specializes in ${SPEC_DESCRIPTIONS[s] || "delivering professional plumbing service"}.</p></div>`
  ).join("");
  const servicesHtml = specialties.length > 0 ? `<div class="spec-block"><h3>Services Offered</h3>${specItems}</div>` : "";
  const availNote = workingHours?.includes("Open 24h") ? `<p><strong>${name} is available 24/7</strong> — including weekends and holidays — for emergency plumbing situations.</p>` : "";
  const hoursHtml = workingHours ? `<div class="hours-block"><h3>Working Hours</h3><table class="hours-table"><tr><td>${workingHours.replace(/, /g, "</td></tr><tr><td>").replace(/: /g, "</td><td>")}</td></tr></table></div>` : "";
  return [opener, ratingHtml, servicesHtml, availNote, closer, hoursHtml].filter(Boolean).join("\n");
}

async function searchPlumbers(city, state, searchType) {
  const data = await httpsGet(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${searchType} in ${city}, ${state}`)}&key=${API_KEY}`);
  return data.results || [];
}

async function getDetails(placeId) {
  const data = await httpsGet(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,geometry,photos,rating,user_ratings_total&key=${API_KEY}`);
  return data.result || null;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected:", MONGO_URI, "\nMode:", DRY_RUN ? "DRY RUN" : "LIVE\n");

  let totalAdded = 0;

  for (const { city, state, target } of ALL_CITIES) {
    const existing = await Post.countDocuments({ address: { $regex: city, $options: "i" } });
    const needed = Math.max(0, target - existing);
    console.log(`\n── ${city}, ${state} — existing: ${existing}, need: ${needed}`);
    if (needed === 0) { console.log("  Skipping"); continue; }

    const seen = new Set();
    let added = 0;

    for (const searchType of SEARCH_TYPES) {
      if (added >= needed) break;
      let results;
      try { results = await searchPlumbers(city, state, searchType); await sleep(400); }
      catch(e) { continue; }

      for (const place of results) {
        if (added >= needed) break;
        if (seen.has(place.place_id)) continue;
        seen.add(place.place_id);
        if (await Post.exists({ companyName: place.name, address: place.formatted_address || "" })) continue;

        let details;
        try { details = await getDetails(place.place_id); await sleep(400); }
        catch(e) { continue; }
        if (!details) continue;

        const address = details.formatted_address || place.formatted_address || "";
        const phone = details.formatted_phone_number || "";
        const workingHours = formatHours(details.opening_hours?.periods);
        const specialties = inferSpecialties(place.name);
        const rating = details.rating || place.rating || 0;
        const reviewCount = details.user_ratings_total || place.user_ratings_total || 0;
        const content = buildContent(place.name, city, state, specialties, phone, workingHours, rating, reviewCount, totalAdded + added);
        let imageUrl = details.photos?.[0]?.photo_reference
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[0].photo_reference}&key=${API_KEY}`
          : "";

        if (DRY_RUN) { console.log(`  [DRY] ${place.name}`); }
        else {
          try {
            await new Post({ companyName: place.name, title: `${place.name} – ${city}, ${state}`, content, address, lat: details.geometry?.location?.lat, lng: details.geometry?.location?.lng, phone, website: details.website || "", workingHours, specialties, imageUrl, rating, reviewCount, status: "active" }).save();
            console.log(`  ✓ ${place.name} | ⭐${rating} (${reviewCount})`);
          } catch(e) { console.log(`  ✗ ${e.message}`); continue; }
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
