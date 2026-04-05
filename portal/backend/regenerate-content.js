require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

// Simple deterministic hash so same clinic always gets same variant
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function pick(arr, seed) { return arr[seed % arr.length]; }

// ----- INTRO TEMPLATES -----
const INTROS = [
  (name, city, spec) => `<p>${name} is a ${spec} practice located in ${city}. The clinic focuses on patient-centered care, with providers who take the time to understand each patient's history and tailor treatment accordingly.</p>`,
  (name, city, spec) => `<p>Patients across ${city} rely on ${name} for their ${spec} needs. The practice is known for short wait times, clear communication, and follow-through on treatment plans.</p>`,
  (name, city, spec) => `<p>Based in ${city}, ${name} offers ${spec} services to individuals and families in the area. Appointments are available for new patients, and the staff works to accommodate urgent concerns promptly.</p>`,
  (name, city, spec) => `<p>${name} has built a reputation in ${city} for dependable ${spec} care. Whether you're managing a chronic condition or coming in for a routine visit, the team here is equipped to help.</p>`,
  (name, city, spec) => `<p>If you're looking for ${spec} care in the ${city} area, ${name} is a well-regarded option. The clinic emphasizes thorough evaluations and clear explanations so patients leave with a real understanding of their condition.</p>`,
  (name, city, spec) => `<p>${name} serves the ${city} community with a focus on ${spec}. The clinical team brings experience across a range of conditions and stays current with treatment guidelines.</p>`,
  (name, city, spec) => `<p>Located in ${city}, ${name} provides ${spec} services to patients of various ages and backgrounds. The practice prides itself on accessible care and transparent billing.</p>`,
  (name, city, spec) => `<p>For residents of ${city} seeking ${spec} care, ${name} offers a straightforward, no-frills approach — experienced clinicians, honest assessments, and practical treatment options.</p>`,
];

// ----- SPECIALTY CONTENT -----
const SPECIALTY_CONTENT = {
  "Cardiology": [
    `<p>Cardiology services covering heart and vascular conditions including high blood pressure, irregular heartbeat, chest pain, and elevated cholesterol. Diagnostic services include EKG, echocardiogram, and stress testing.</p>`,
    `<p>Heart and vascular care for patients managing hypertension, atrial fibrillation, valve disorders, and related conditions. Evaluation, imaging, and long-term management plans available.</p>`,
  ],
  "Dental": [
    `<p>Dental services for adults and children including exams, cleanings, fillings, crowns, implants, and cosmetic procedures. New patients welcome.</p>`,
    `<p>Full-spectrum dental care covering preventive, restorative, and cosmetic treatments. Routine checkups, X-rays, and emergency dental visits available.</p>`,
  ],
  "Dermatology": [
    `<p>Dermatology services for acne, eczema, psoriasis, rosacea, skin infections, and skin cancer screenings. Cosmetic concerns including mole removal and sun damage treatment also available.</p>`,
    `<p>Medical and cosmetic dermatology covering rashes, hair loss, nail disorders, and suspicious skin lesions. Annual skin checks recommended for patients with significant sun exposure history.</p>`,
  ],
  "General Medicine": [
    `<p>General medicine for common illnesses, chronic condition management, and preventive care. Annual physicals, bloodwork, and routine screenings available.</p>`,
    `<p>Primary and general medicine services including sick visits, chronic disease management, and wellness exams. Same-day appointments available for acute concerns.</p>`,
  ],
  "Gynecology": [
    `<p>Women's health services including annual exams, Pap smears, contraception counseling, and management of conditions like PCOS, fibroids, and menopause symptoms.</p>`,
    `<p>Gynecology care for women at every life stage — routine well-woman visits, reproductive health, and management of hormonal and gynecological conditions.</p>`,
  ],
  "Neurology": [
    `<p>Neurology services for migraines, epilepsy, neuropathy, Parkinson's disease, multiple sclerosis, and stroke recovery. Diagnostic evaluation and ongoing treatment available.</p>`,
    `<p>Diagnosis and treatment of brain, spinal cord, and nerve conditions. Patients with persistent headaches, numbness, weakness, or cognitive changes are encouraged to schedule an evaluation.</p>`,
  ],
  "Oncology": [
    `<p>Oncology care covering cancer diagnosis, treatment planning, and survivorship follow-up. Treatment options include chemotherapy, immunotherapy, and targeted therapy depending on cancer type and stage.</p>`,
    `<p>Cancer care and management coordinated with surgical and radiation teams. Evidence-based treatment protocols with support for patients and families throughout the process.</p>`,
  ],
  "Ophthalmology": [
    `<p>Eye care services including routine exams, glaucoma screening, cataract evaluation, and management of diabetic eye disease, macular degeneration, and dry eye syndrome.</p>`,
    `<p>Comprehensive eye exams and specialized ophthalmology care. Medical and surgical treatment options available for diagnosed eye conditions.</p>`,
  ],
  "Orthopedics": [
    `<p>Orthopedic care for sports injuries, joint pain, fractures, spine problems, and arthritis. Conservative treatments explored first; surgical consultations available when needed.</p>`,
    `<p>Musculoskeletal care covering bones, joints, tendons, and ligaments. Services include fracture care, joint replacement consultations, and sports medicine.</p>`,
  ],
  "Pediatrics": [
    `<p>Pediatric care from newborns through adolescents. Well-child visits, vaccinations, sick visits, and management of childhood conditions including asthma, infections, and developmental concerns.</p>`,
    `<p>Children's healthcare covering routine checkups, sports physicals, immunizations, and acute illness visits. New patients of all ages welcome.</p>`,
  ],
  "Physical Therapy": [
    `<p>Physical therapy for injury recovery, post-surgical rehabilitation, and chronic pain. Programs include manual therapy, therapeutic exercise, and patient education tailored to each individual.</p>`,
    `<p>Rehabilitation services for back and neck pain, sports injuries, and post-operative recovery. Focus on restoring function and preventing recurrence.</p>`,
  ],
  "Primary Care": [
    `<p>Primary care for annual physicals, chronic condition management, acute illness visits, and preventive screenings. Consistent, coordinated care for patients of all ages.</p>`,
    `<p>Comprehensive primary care handling routine and non-emergency medical needs. Lab work, referrals, and ongoing management of conditions like diabetes and hypertension.</p>`,
  ],
  "Psychiatry": [
    `<p>Psychiatric evaluation and medication management for depression, anxiety, bipolar disorder, ADHD, PTSD, and related conditions. Coordinated care with therapists and other providers.</p>`,
    `<p>Mental health care from a medical perspective. Initial evaluations, ongoing medication management, and collaborative treatment planning. Telehealth may be available.</p>`,
  ],
  "Radiology": [
    `<p>Diagnostic imaging including X-ray, ultrasound, CT, and MRI. Board-certified radiologists review and report all studies. Referral from a physician required for most imaging.</p>`,
    `<p>Medical imaging services for routine and complex diagnostic needs. Results communicated promptly to ordering providers. Most major insurance plans accepted.</p>`,
  ],
  "Surgery": [
    `<p>Surgical consultations, pre-operative evaluation, and post-operative follow-up. General surgery procedures including hernia repair, gallbladder removal, and appendectomy. Second opinions welcome.</p>`,
    `<p>Surgical care covering both elective and necessary procedures. Patients receive a thorough review of diagnosis, options, and expected recovery before any decision is made.</p>`,
  ],
  "Urgent Care": [
    `<p>Urgent care for non-emergency issues including cuts, sprains, fractures, fevers, infections, and allergic reactions. Walk-ins welcome, no appointment needed. On-site lab and X-ray available.</p>`,
    `<p>Same-day care for illnesses and injuries that need prompt attention but aren't emergencies. A faster alternative to the ER for most acute, non-critical conditions.</p>`,
  ],
};

const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL  = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

function formatTime(t) {
  return t.replace(/([AaPp][Mm])/, " $1").replace("  ", " ").trim();
}

function parseHours(workingHours) {
  if (!workingHours) return null;
  const entries = workingHours.split(/,\s*(?=[A-Z][a-z]{2}:)/);
  const map = {};
  for (const entry of entries) {
    const m = entry.match(/^([A-Z][a-z]{2}):\s*(.+)$/);
    if (!m) continue;
    map[m[1]] = m[2].trim();
  }
  return map;
}

function groupDays(map) {
  const rows = [];
  const days = DAY_ORDER.filter(d => d in map);
  if (!days.length) return rows;
  let i = 0;
  while (i < days.length) {
    const hours = map[days[i]];
    let j = i + 1;
    while (j < days.length && map[days[j]] === hours &&
           DAY_ORDER.indexOf(days[j]) === DAY_ORDER.indexOf(days[j - 1]) + 1) j++;
    const group = days.slice(i, j);
    let label;
    if (group.length === 1) label = DAY_FULL[group[0]];
    else if (group.length === 2) label = DAY_FULL[group[0]] + " & " + DAY_FULL[group[1]];
    else label = DAY_FULL[group[0]] + " – " + DAY_FULL[group[group.length - 1]];
    rows.push({ label, hours });
    i = j;
  }
  return rows;
}

function formatHoursHtml(workingHours) {
  const map = parseHours(workingHours);
  if (!map || !Object.keys(map).length) return "";
  const rows = groupDays(map);
  if (!rows.length) return "";
  const rowsHtml = rows.map(r => {
    const hours = r.hours.includes("Open 24h") ? "Open 24 hours" :
      r.hours.split("–").map(formatTime).join(" – ");
    return `<tr><td>${r.label}</td><td>${hours}</td></tr>`;
  }).join("");
  return `<div class="hours-block"><h3>Opening Hours</h3><table class="hours-table">${rowsHtml}</table></div>`;
}

function makeContent(post) {
  const city = post.address ? post.address.split(",")[1]?.trim() || post.address.split(",")[0].trim() : "";
  const specialties = post.specialties && post.specialties.length ? post.specialties : ["General Medicine"];
  const seed = hash(post.companyName + post._id.toString());

  // Intro
  const primarySpec = specialties.length === 1 ? specialties[0] :
    specialties.slice(0, 2).join(" and ");
  const introFn = pick(INTROS, seed);
  const intro = introFn(post.companyName, city, primarySpec);

  // Specialty blocks with richer content
  const specItemsHtml = specialties.map((s, idx) => {
    const variants = SPECIALTY_CONTENT[s];
    const body = variants ? pick(variants, seed + idx) : `<p>${s} services available at this location.</p>`;
    return `<div class="spec-item"><strong>${s}</strong>${body}</div>`;
  }).join("");
  const specBlock = `<div class="spec-block"><h3>Services</h3>${specItemsHtml}</div>`;

  // Hours
  const hoursHtml = formatHoursHtml(post.workingHours || post.openingHours || "");

  return intro + specBlock + hoursHtml;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hospitals");

  const posts = await Post.find({ status: "active" });
  console.log("Total posts:", posts.length);

  let updated = 0;
  for (const post of posts) {
    const content = makeContent(post);
    await Post.updateOne({ _id: post._id }, { $set: { content } });
    updated++;
    if (updated % 200 === 0) console.log(updated + " / " + posts.length);
  }

  console.log("Done. Updated:", updated);
  await mongoose.disconnect();
}

run().catch(console.error);
