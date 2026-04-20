/**
 * migrate-content.js
 * Regenerates unique, data-rich content for each plumber post.
 * Run: node migrate-content.js [--dry-run]
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

const DRY_RUN = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/plumbers";

const SPEC_DESCRIPTIONS = {
  "Drain Cleaning":   "clearing blocked drains using hydro-jetting and professional snake equipment",
  "Pipe Repair":      "diagnosing and repairing burst, leaking, or corroded pipes with trenchless options available",
  "Water Heater":     "installing, repairing, and replacing tank and tankless water heaters with same-day service",
  "Emergency":        "24/7 emergency response for burst pipes, major leaks, and flooding",
  "Leak Detection":   "locating hidden leaks with non-invasive acoustic and thermal imaging equipment",
  "Sewer Line":       "inspecting, cleaning, and repairing sewer lines using camera technology",
  "Bathroom":         "complete bathroom plumbing — toilets, showers, bathtubs, and vanity installations",
  "Kitchen":          "kitchen plumbing from sink installation and disposal repair to dishwasher hookups",
  "Gas Line":         "installing and testing gas lines for residential and commercial properties",
  "Repiping":         "full or partial repiping using copper, PEX, or CPVC for older galvanized systems",
  "Backflow":         "installing and certifying backflow preventers to keep drinking water safe",
  "Sump Pump":        "installing sump pumps and battery backup systems to protect against basement flooding",
  "Toilet Repair":    "fixing running toilets, weak flushes, leaking bases, and full replacements",
  "Faucet & Fixture": "installing and repairing faucets, fixtures, and valves across all major brands",
  "Water Softener":   "whole-house water softeners and filtration systems to improve water quality",
};

// Deterministic shuffle using a seed (post index)
function seededPick(arr, seed) {
  return arr[seed % arr.length];
}

function buildUniqueContent(post, index) {
  const name = post.companyName;
  const city = extractCity(post.address);
  const state = extractState(post.address);
  const location = [city, state].filter(Boolean).join(", ");
  const specs = post.specialties || [];
  const phone = post.phone || "";
  const rating = post.rating || 0;
  const reviewCount = post.reviewCount || 0;
  const is247 = post.workingHours && post.workingHours.includes("Open 24h");
  const hasRating = rating > 0 && reviewCount > 0;
  const r = rating.toFixed(1);
  const s1 = specs[0] || "plumbing";
  const s2 = specs[1] || "";
  const s3 = specs[2] || "";

  // ── Opening paragraph — 8 variants, each uses real data differently ──
  const openers = [
    `<p>${name} is a licensed and insured plumbing company serving ${location || name + "'s local area"}. Their certified technicians handle everything from routine maintenance to full plumbing emergencies, arriving on time with the tools and parts to complete most jobs in a single visit.</p>`,

    `<p>When plumbing problems strike in ${city || "the local area"}, homeowners and property managers call ${name}. The team is known for fast response times, honest assessments, and quality work — ${hasRating ? `backed by a ${r}★ rating from ${reviewCount} verified customers` : "backed by a satisfaction guarantee"}.</p>`,

    `<p>${name} provides${is247 ? " round-the-clock" : ""} plumbing services throughout ${location || "the area"}. Fully licensed and insured, their technicians diagnose accurately and complete every job to code — with upfront pricing and no hidden fees.</p>`,

    `<p>Homeowners and businesses in ${location || "the area"} rely on ${name} for dependable plumbing solutions. ${hasRating ? `With ${reviewCount} reviews averaging ${r} stars, they` : "Their licensed team"} handles any plumbing issue efficiently, with clear communication from estimate to completion.</p>`,

    `<p>Based in ${city || "the local area"}, ${name} has built a reputation for reliable, on-time plumbing service. ${specs.length > 0 ? `Specializing in ${s1.toLowerCase()}${s2 ? ` and ${s2.toLowerCase()}` : ""}, they` : "They"} complete every job right the first time — from a dripping faucet to a full sewer line replacement.</p>`,

    `<p>${name} serves the ${location || "local"} area with a full range of residential${is247 ? " and commercial" : " and light commercial"} plumbing services. Their licensed, insured team is committed to transparent pricing, professional workmanship, and same-day availability for urgent calls.</p>`,

    `<p>${hasRating ? `Rated ${r} stars by ${reviewCount} customers, ` : ""}${name} is a trusted plumbing contractor${location ? ` in ${location}` : ""}. They combine technical expertise with straightforward communication — giving you a clear diagnosis and fair price before any work begins.</p>`,

    `<p>${name} brings professional-grade plumbing service to ${city || "the local area"}. ${is247 ? "Available 24/7 including holidays, they" : "Operating on a reliable schedule, they"} dispatch experienced technicians equipped to handle everything from clogged drains to complete system replacements.</p>`,
  ];

  // ── Rating sentence — 5 variants ──
  let ratingHtml = "";
  if (hasRating) {
    const ratingVariants = [
      `<p>${name} holds a ${r}★ rating from ${reviewCount} customer reviews — a track record built on consistent workmanship and fair pricing.</p>`,
      `<p>With ${reviewCount} verified reviews and a ${r}-star average, ${name} ranks among the top-rated plumbers in ${city || "the area"}.</p>`,
      `<p>Customers rate ${name} ${r} out of 5 across ${reviewCount} reviews, consistently praising their punctuality, transparency, and quality of work.</p>`,
      `<p>${reviewCount} customers have reviewed ${name}, giving them a ${r}★ average — with frequent mentions of professionalism and honest billing.</p>`,
      `<p>${name}'s ${r}★ rating (${reviewCount} reviews) reflects a team that shows up on time, quotes accurately, and completes work cleanly.</p>`,
    ];
    ratingHtml = seededPick(ratingVariants, index);
  }

  // ── Services section — uses actual specialty descriptions ──
  let servicesHtml = "";
  if (specs.length > 0) {
    const specItems = specs.map(s => {
      const desc = SPEC_DESCRIPTIONS[s] || "professional plumbing service with licensed technicians";
      return `<div class="spec-item"><strong>${s}</strong><p>${name} specializes in ${desc}.</p></div>`;
    }).join("");
    servicesHtml = `<div class="spec-block"><h3>Services Offered</h3>${specItems}</div>`;
  }

  // ── 24/7 availability note ──
  const availNote = is247
    ? `<p><strong>${name} is available 24/7</strong> — including nights, weekends, and holidays — for plumbing emergencies that can't wait.</p>`
    : "";

  // ── Closing paragraph — 6 variants with phone CTA ──
  const closers = [
    `<p>${name} serves ${city || "the local area"} and nearby communities. ${phone ? `Call <strong>${phone}</strong> for a free estimate or to schedule same-day service.` : "Contact them today for a free estimate."}</p>`,
    `<p>Serving ${location || "the area"} and surrounding communities, ${name} is available for scheduled maintenance and emergency calls. ${phone ? `Reach them at <strong>${phone}</strong>.` : ""}</p>`,
    `<p>Whether you're facing a minor repair or a major system failure, ${name} can help${city ? ` across ${city}` : ""}. ${phone ? `Call <strong>${phone}</strong> — they offer free quotes and competitive rates.` : "Free quotes available on request."}</p>`,
    `<p>${name} is proud to serve the ${location || "local"} community. ${phone ? `For service requests or estimates, call <strong>${phone}</strong> any time.` : "Contact them today to get started."}</p>`,
    `<p>Get in touch with ${name} for reliable plumbing service${city ? ` in ${city}` : ""}. ${phone ? `Call <strong>${phone}</strong> to book a visit or request a same-day quote.` : "Contact them for a free quote."}</p>`,
    `<p>${name} covers ${location || "the local area"} for all residential and commercial plumbing needs. ${phone ? `Dial <strong>${phone}</strong> to speak with their team directly — no call centers, no runaround.` : "Reach out for honest pricing and professional service."}</p>`,
  ];

  // ── Hours table ──
  const hoursHtml = post.workingHours
    ? `<div class="hours-block"><h3>Working Hours</h3><table class="hours-table"><tr><td>${post.workingHours.replace(/, /g, "</td></tr><tr><td>").replace(/: /g, "</td><td>")}</td></tr></table></div>`
    : "";

  return [
    seededPick(openers, index),
    ratingHtml,
    servicesHtml,
    availNote,
    seededPick(closers, Math.floor(index / 2)),
    hoursHtml,
  ].filter(Boolean).join("\n");
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
  const m = address.match(/,\s*([A-Z]{2})\s*(?:\d{5})?/);
  return m ? m[1] : "";
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected:", MONGO_URI);
  console.log("Mode:", DRY_RUN ? "DRY RUN" : "LIVE\n");

  const posts = await Post.find(
    {},
    { _id: 1, companyName: 1, address: 1, specialties: 1, phone: 1, workingHours: 1, rating: 1, reviewCount: 1 }
  );
  console.log(`Found ${posts.length} posts\n`);

  let updated = 0;
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const content = buildUniqueContent(post, i);
    if (DRY_RUN) {
      console.log(`[DRY] ${post.companyName}\n${content.slice(0, 120)}...\n`);
    } else {
      await Post.updateOne({ _id: post._id }, { $set: { content } });
      if (i % 100 === 0) console.log(`[${i + 1}/${posts.length}] ${post.companyName}`);
      updated++;
    }
  }

  console.log(`\n✓ Done. Updated: ${updated}`);
  await mongoose.disconnect();
}

run().catch(console.error);
