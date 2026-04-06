/**
 * migrate-content.js
 * Regenerates unique content for each post based on their actual data.
 * Run: node migrate-content.js [--dry-run]
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

const DRY_RUN = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/plumbers";

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
  "Pipe Repair":      "repairing burst, leaking, and corroded pipes quickly with minimal property disruption",
};

// Varied opening templates
const OPENERS = [
  (name, city, state) => `<p>${name} is a licensed and insured plumbing company serving ${city}, ${state} and the surrounding area. With a team of experienced technicians, they handle everything from routine maintenance to full plumbing emergencies.</p>`,
  (name, city, state) => `<p>Based in ${city}, ${state}, ${name} has built a reputation for reliable, on-time plumbing service. Every job — from a dripping faucet to a burst main line — is handled with the same level of professionalism and attention to detail.</p>`,
  (name, city, state) => `<p>${name} provides professional plumbing services throughout ${city} and ${state}. Fully licensed and insured, their technicians arrive on time, diagnose accurately, and complete every job to code with upfront, transparent pricing.</p>`,
  (name, city, state) => `<p>Homeowners and businesses in ${city}, ${state} trust ${name} for dependable plumbing solutions. Their licensed team is equipped to handle any plumbing issue efficiently, with clear communication and no hidden fees.</p>`,
  (name, city, state) => `<p>When plumbing problems strike in ${city}, ${state}, residents call ${name}. The company's certified technicians are known for fast response, honest assessments, and quality workmanship backed by a satisfaction guarantee.</p>`,
  (name, city, state) => `<p>${name} serves the ${city}, ${state} area with a full range of residential and commercial plumbing services. Their team is licensed, insured, and committed to getting the job done right the first time.</p>`,
];

// Varied closers
const CLOSERS = [
  (name, city, state, phone) => `<p>${name} serves ${city} and nearby communities across ${state}. ${phone ? `Call <strong>${phone}</strong> for a free estimate or to schedule same-day service.` : "Contact them today for a free estimate."}</p>`,
  (name, city, state, phone) => `<p>Serving ${city}, ${state} and surrounding areas, ${name} is available for both scheduled appointments and emergency calls. ${phone ? `Reach them at <strong>${phone}</strong>.` : ""}</p>`,
  (name, city, state, phone) => `<p>Whether you're in ${city} or a nearby part of ${state}, ${name} can help. ${phone ? `Give them a call at <strong>${phone}</strong> — they offer free quotes and competitive rates.` : "Free quotes available on request."}</p>`,
  (name, city, state, phone) => `<p>${name} is proud to serve the ${city}, ${state} community. ${phone ? `For service requests or estimates, call <strong>${phone}</strong> any time.` : "Contact them today to get started."}</p>`,
];

// Varied rating sentences
function ratingLine(rating, reviewCount, name) {
  if (!rating || rating === 0) return "";
  const r = rating.toFixed(1);
  const templates = [
    `<p>${name} holds a ${r}★ rating based on ${reviewCount} customer reviews — a track record that reflects consistent quality and customer satisfaction.</p>`,
    `<p>With ${reviewCount} verified reviews and a ${r}-star average, ${name} is one of the top-rated plumbing companies in the area.</p>`,
    `<p>Customers rate ${name} ${r} out of 5 stars across ${reviewCount} reviews, highlighting their reliability, fair pricing, and quality of work.</p>`,
    `<p>${name} has earned a ${r}★ rating from ${reviewCount} customers who praise their professionalism, punctuality, and transparent billing.</p>`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function hoursHtml(workingHours) {
  if (!workingHours) return "";
  return `<div class="hours-block"><h3>Working Hours</h3><table class="hours-table"><tr><td>${workingHours.replace(/, /g, "</td></tr><tr><td>").replace(/: /g, "</td><td>")}</td></tr></table></div>`;
}

function buildUniqueContent(post, index) {
  const name = post.companyName;
  const city = extractCity(post.address);
  const state = extractState(post.address);
  const specs = post.specialties || [];
  const phone = post.phone || "";

  // Pick templates deterministically based on post index to avoid randomness on re-runs
  const opener = OPENERS[index % OPENERS.length](name, city, state);
  const closer = CLOSERS[index % CLOSERS.length](name, city, state, phone);
  const rating = ratingLine(post.rating, post.reviewCount, name);

  // Services section with spec-specific descriptions
  let servicesHtml = "";
  if (specs.length > 0) {
    const specItems = specs.map(s => {
      const desc = SPEC_DESCRIPTIONS[s] || "delivering professional plumbing service with licensed technicians";
      return `<div class="spec-item"><strong>${s}</strong><p>${name} specializes in ${desc}.</p></div>`;
    }).join("");
    servicesHtml = `<div class="spec-block"><h3>Services Offered</h3>${specItems}</div>`;
  }

  // 24/7 or hours callout
  let availNote = "";
  if (post.workingHours && post.workingHours.includes("Open 24h")) {
    availNote = `<p><strong>${name} is available 24/7</strong> — including weekends and holidays — for emergency plumbing situations that can't wait.</p>`;
  }

  return [opener, rating, servicesHtml, availNote, closer, hoursHtml(post.workingHours)]
    .filter(Boolean).join("\n");
}

function extractCity(address) {
  if (!address) return "";
  const cleaned = address.replace(/,?\s*USA\s*$/, "").trim();
  const parts = cleaned.split(",").map(p => p.trim());
  const last = parts[parts.length - 1];
  if (/^[A-Z]{2}(\s+\d{5})?$/.test(last) && parts.length >= 2) return parts[parts.length - 2];
  return last.replace(/^\d{5}\s*/, "").trim();
}

function extractState(address) {
  if (!address) return "";
  const m = address.match(/\b([A-Z]{2})\s*(\d{5})?/);
  return m ? m[1] : "";
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected:", MONGO_URI);
  console.log("Mode:", DRY_RUN ? "DRY RUN" : "LIVE\n");

  const posts = await Post.find({}, { _id: 1, companyName: 1, address: 1, specialties: 1, phone: 1, workingHours: 1, rating: 1, reviewCount: 1 });
  console.log(`Found ${posts.length} posts\n`);

  let updated = 0;
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const content = buildUniqueContent(post, i);
    if (DRY_RUN) {
      console.log(`[DRY] ${post.companyName}\n${content.slice(0, 120)}...\n`);
    } else {
      await Post.updateOne({ _id: post._id }, { $set: { content } });
      if (i % 50 === 0) console.log(`[${i + 1}/${posts.length}] ${post.companyName}`);
      updated++;
    }
  }

  console.log(`\n✓ Done. Updated: ${updated}`);
  await mongoose.disconnect();
}

run().catch(console.error);
