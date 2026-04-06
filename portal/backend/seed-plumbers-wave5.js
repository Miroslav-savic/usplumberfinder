/**
 * seed-plumbers-wave5.js
 * Seeds ~500 more plumbers from new US cities.
 * Run: node seed-plumbers-wave5.js [--dry-run]
 */

require("dotenv").config();
const mongoose = require("mongoose");
const https = require("https");
const Post = require("./src/models/postModel");

const API_KEY = "AIzaSyBBYA-lNAF_QICuxmTFR5jG0pCn-O3XS04";
const DRY_RUN = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/plumbers";

const ALL_CITIES = [
  // More Texas
  { city: "Fort Worth",     state: "TX", target: 25 },
  { city: "El Paso",        state: "TX", target: 15 },
  { city: "Arlington",      state: "TX", target: 15 },
  // More Florida
  { city: "Fort Lauderdale",state: "FL", target: 20 },
  { city: "St. Petersburg", state: "FL", target: 15 },
  // More California
  { city: "Riverside",      state: "CA", target: 15 },
  { city: "Fresno",         state: "CA", target: 15 },
  { city: "Bakersfield",    state: "CA", target: 12 },
  // More New York
  { city: "Rochester",      state: "NY", target: 12 },
  { city: "Yonkers",        state: "NY", target: 10 },
  // More Illinois
  { city: "Aurora",         state: "IL", target: 10 },
  { city: "Naperville",     state: "IL", target: 10 },
  // More Georgia
  { city: "Augusta",        state: "GA", target: 12 },
  { city: "Savannah",       state: "GA", target: 12 },
  // More Ohio
  { city: "Columbus",       state: "OH", target: 20 },
  { city: "Cincinnati",     state: "OH", target: 15 },
  { city: "Akron",          state: "OH", target: 10 },
  // More Washington
  { city: "Spokane",        state: "WA", target: 12 },
  { city: "Tacoma",         state: "WA", target: 12 },
  // New Mexico
  { city: "Santa Fe",       state: "NM", target: 8  },
  // Mississippi
  { city: "Biloxi",         state: "MS", target: 8  },
  // Hawaii
  { city: "Maui",           state: "HI", target: 8  },
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

function buildContent(post, city, state, idx) {
  const name = post.companyName;
  const phone = post.phone || "";
  const specs = post.specialties || [];
  const opener = OPENERS[idx % OPENERS.length](name, city, state);
  const closer = CLOSERS[idx % CLOSERS.length](name, city, state, phone);

  let ratingHtml = "";
  if (post.rating > 0) {
    const r = post.rating.toFixed(1);
    const templates = [
      `<p>${name} holds a ${r}★ rating based on ${post.reviewCount} customer reviews — a track record that reflects consistent quality and customer satisfaction.</p>`,
      `<p>With ${post.reviewCount} verified reviews and a ${r}-star average, ${name} is one of the top-rated plumbing companies in the area.</p>`,
      `<p>Customers rate ${name} ${r} out of 5 stars across ${post.reviewCount} reviews, highlighting their reliability, fair pricing, and quality of work.</p>`,
      `<p>${name} has earned a ${r}★ rating from ${post.reviewCount} customers who praise their professionalism, punctuality, and transparent billing.</p>`,
    ];
    ratingHtml = templates[idx % templates.length];
  }

  let servicesHtml = "";
  if (specs.length > 0) {
    const specItems = specs.map(s => {
      const desc = SPEC_DESCRIPTIONS[s] || "delivering professional plumbing service with licensed technicians";
      return `<div class="spec-item"><strong>${s}</strong><p>${name} specializes in ${desc}.</p></div>`;
    }).join("");
    servicesHtml = `<div class="spec-block"><h3>Services Offered</h3>${specItems}</div>`;
  }

  const availNote = post.workingHours && post.workingHours.includes("Open 24h")
    ? `<p><strong>${name} is available 24/7</strong> — including weekends and holidays — for emergency plumbing situations that can't wait.</p>`
    : "";

  const hoursHtml = post.workingHours
    ? `<div class="hours-block"><h3>Working Hours</h3><table class="hours-table"><tr><td>${post.workingHours.replace(/, /g, "</td></tr><tr><td>").replace(/: /g, "</td><td>")}</td></tr></table></div>`
    : "";

  return [opener, ratingHtml, servicesHtml, availNote, closer, hoursHtml].filter(Boolean).join("\n");
}

async function searchPlumbers(city, state, searchType) {
  const query = encodeURIComponent(`${searchType} in ${city}, ${state}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`;
  const data = await httpsGet(url);
  return data.results || [];
}

async function getDetails(placeId) {
  const fields = "name,formatted_address,formatted_phone_number,website,opening_hours,geometry,photos,rating,user_ratings_total";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const data = await httpsGet(url);
  return data.result || null;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);
  console.log("Mode:", DRY_RUN ? "DRY RUN" : "LIVE", "\n");

  let totalAdded = 0;

  for (const { city, state, target } of ALL_CITIES) {
    const existing = await Post.countDocuments({ address: { $regex: city, $options: "i" } });
    const needed = Math.max(0, target - existing);
    console.log(`\n── ${city}, ${state} — existing: ${existing}, target: ${target}, need: ${needed} more`);
    if (needed === 0) { console.log("  Skipping"); continue; }

    const seen = new Set();
    let added = 0;

    for (const searchType of SEARCH_TYPES) {
      if (added >= needed) break;
      console.log(`  Searching: "${searchType} in ${city}"...`);
      let results;
      try { results = await searchPlumbers(city, state, searchType); await sleep(400); }
      catch(e) { console.log(`  Error: ${e.message}`); continue; }

      for (const place of results) {
        if (added >= needed) break;
        if (seen.has(place.place_id)) continue;
        seen.add(place.place_id);

        const exists = await Post.exists({ companyName: place.name, address: place.formatted_address || "" });
        if (exists) { console.log(`  → Skip: ${place.name}`); continue; }

        let details = null;
        try { details = await getDetails(place.place_id); await sleep(400); }
        catch(e) { console.log(`  → Error: ${place.name}`); continue; }
        if (!details) continue;

        const address = details.formatted_address || place.formatted_address || "";
        const phone = details.formatted_phone_number || "";
        const website = details.website || "";
        const lat = details.geometry?.location?.lat || place.geometry?.location?.lat;
        const lng = details.geometry?.location?.lng || place.geometry?.location?.lng;
        const workingHours = formatHours(details.opening_hours?.periods);
        const specialties = inferSpecialties(place.name);
        const rating = details.rating || place.rating || 0;
        const reviewCount = details.user_ratings_total || place.user_ratings_total || 0;

        const postObj = { companyName: place.name, phone, workingHours, specialties, rating, reviewCount };
        const content = buildContent(postObj, city, state, totalAdded + added);

        let imageUrl = "";
        if (details.photos?.[0]?.photo_reference) {
          imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[0].photo_reference}&key=${API_KEY}`;
        }

        const postData = {
          companyName: place.name,
          title: `${place.name} – ${city}, ${state}`,
          content, address, lat, lng, phone, website,
          workingHours, specialties, imageUrl, rating, reviewCount,
          status: "active",
        };

        if (DRY_RUN) {
          console.log(`  [DRY] ${place.name} | ${address}`);
        } else {
          try {
            await new Post(postData).save();
            console.log(`  ✓ ${place.name} | ${city} | ⭐${rating} (${reviewCount})`);
          } catch(e) {
            console.log(`  ✗ ${place.name} — ${e.message}`); continue;
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
