require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

// Keyword → specialty mapping (checked against title + content + companyName)
const SPECIALTY_KEYWORDS = [
  { specialty: "Cardiology",        keywords: ["cardiology","cardiolog","cardiac","heart","cardiovascular","echocardiogram"] },
  { specialty: "Oncology",          keywords: ["oncology","oncolog","cancer","tumor","chemotherapy","radiation therapy","hematology"] },
  { specialty: "Pediatrics",        keywords: ["pediatric","children","child","kids","neonatal","newborn"] },
  { specialty: "Orthopedics",       keywords: ["orthoped","bone","joint","spine","sports medicine","fracture","hip replacement","knee"] },
  { specialty: "Neurology",         keywords: ["neurolog","brain","stroke","epilepsy","multiple sclerosis","parkinson","alzheimer","neuro"] },
  { specialty: "Dermatology",       keywords: ["dermatolog","skin","acne","eczema","psoriasis","cosmetic dermatology"] },
  { specialty: "Gynecology",        keywords: ["gynecolog","obstetric","women","maternity","prenatal","childbirth","mammograph","breast"] },
  { specialty: "Ophthalmology",     keywords: ["ophthalm","eye","vision","cataract","glaucoma","lasik","retina"] },
  { specialty: "Dental",            keywords: ["dental","dentist","orthodont","oral surgery","teeth","tooth","implant","periodon"] },
  { specialty: "Psychiatry",        keywords: ["psychiatr","mental health","behavioral health","depression","anxiety","psychology","counseling"] },
  { specialty: "Physical Therapy",  keywords: ["physical therapy","rehabilitation","rehab","occupational therapy","sports rehab"] },
  { specialty: "Urgent Care",       keywords: ["urgent care","walk-in","emergency","trauma","immediate care","after-hours"] },
  { specialty: "Primary Care",      keywords: ["primary care","family medicine","internal medicine","general practice","preventive","annual exam"] },
  { specialty: "Surgery",           keywords: ["surgery","surgical","laparoscop","robotic surgery","transplant","bariatric"] },
  { specialty: "Radiology",         keywords: ["radiolog","imaging","mri","ct scan","x-ray","ultrasound","mammography","pet scan"] },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hospitals");
  console.log("Connected to MongoDB");

  const posts = await Post.find({});
  console.log(`Processing ${posts.length} clinics...`);

  let updated = 0;
  for (const post of posts) {
    const text = [post.title, post.companyName, post.content]
      .join(" ")
      .toLowerCase()
      .replace(/<[^>]+>/g, " ");

    const matched = SPECIALTY_KEYWORDS
      .filter(({ keywords }) => keywords.some((kw) => text.includes(kw)))
      .map(({ specialty }) => specialty);

    if (matched.length > 0) {
      post.specialties = matched;
      await post.save();
      updated++;
      console.log(`  ✓ ${post.companyName}: [${matched.join(", ")}]`);
    }
  }

  console.log(`\nDone. Updated ${updated}/${posts.length} clinics.`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
