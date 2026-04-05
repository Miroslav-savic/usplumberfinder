/**
 * enrich-content.js
 * Enriches thin clinic posts (<1500 chars) with richer, unique content.
 * Run: node enrich-content.js [--dry-run]
 */

const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hospitals";
const DRY_RUN = process.argv.includes("--dry-run");
const MIN_LENGTH = 1500;

// ── Helpers ──────────────────────────────────────────────────────────────────

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return Math.abs(h);
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function extractCity(address) {
  if (!address) return "";
  const cleaned = address.replace(/,?\s*USA\s*$/, "").trim();
  const parts = cleaned.split(",").map((p) => p.trim());
  const last = parts[parts.length - 1];
  if (/^[A-Z]{2}(\s+\d{5})?$/.test(last) && parts.length >= 2) return parts[parts.length - 2];
  return "";
}

// ── Specialty descriptions (4 variants each) ─────────────────────────────────

const SPECIALTY_DESC = {
  Cardiology: [
    `Our cardiology team handles a wide range of heart and vascular conditions. Common reasons patients come in include chest pain, shortness of breath, high blood pressure, and irregular heartbeat. Diagnostic services include EKG, echocardiogram, Holter monitoring, and stress testing. We work closely with interventional cardiologists when procedures such as catheterization or stenting are indicated.`,
    `Cardiovascular care at our facility covers everything from routine blood pressure management to complex arrhythmia workups. Our cardiologists use the latest imaging tools — including echocardiography and nuclear stress testing — to get an accurate picture of your heart health. Patients with a family history of heart disease or prior cardiac events are encouraged to schedule a preventive evaluation.`,
    `Heart health requires consistent attention, and our cardiology department is equipped to provide it. We treat conditions including coronary artery disease, heart failure, valve disorders, and pericarditis. Lifestyle counseling, medication management, and referrals for cardiac surgery are all part of the care continuum we offer.`,
    `From first-time evaluations to ongoing chronic disease management, our cardiology team is here for every stage. We perform non-invasive cardiac testing on-site, including Doppler ultrasound and ambulatory blood pressure monitoring. High-risk patients benefit from our coordinated care approach involving dietitians, pharmacists, and cardiac rehabilitation specialists.`,
  ],
  Oncology: [
    `Cancer care at our clinic is delivered by a multidisciplinary team that brings together medical oncologists, radiation specialists, and surgical consultants. Treatment plans are evidence-based and individualized, drawing on current clinical guidelines and emerging therapies. Supportive care, including pain management and nutritional guidance, is integrated throughout treatment.`,
    `Our oncology department provides comprehensive cancer diagnosis and treatment services. We evaluate patients for a wide range of malignancies, including breast, lung, colon, prostate, and hematologic cancers. Genetic counseling and biomarker testing help us identify targeted therapy options. Our team is committed to transparent communication with patients and families at every step.`,
    `Managing cancer requires a team that coordinates across specialties, and that is exactly what we offer. Our oncology services include chemotherapy administration, immunotherapy, and hormone therapy, supported by on-site laboratory and imaging services. Palliative care integration ensures that quality of life remains a central focus alongside curative goals.`,
    `Oncology at our center is built around personalized medicine. We use molecular profiling and pathology review to identify the most effective treatment strategies for each patient. Clinical trial access may be available for eligible patients. Our nurse navigators help coordinate appointments, test results, and insurance authorizations so patients can focus on recovery.`,
  ],
  Orthopedics: [
    `Our orthopedic team treats conditions affecting the bones, joints, muscles, and connective tissue. Common presentations include knee and hip pain, rotator cuff injuries, back and neck problems, sports injuries, and osteoarthritis. We begin with conservative approaches — physical therapy, injections, and bracing — and pursue surgical options only when medically necessary.`,
    `Whether you are recovering from a sports injury or managing chronic joint pain, our orthopedic specialists have the experience to help. We offer on-site X-ray and MRI coordination, along with joint injection therapy, fracture management, and pre-surgical evaluations. Patients recovering from orthopedic surgery benefit from our structured rehabilitation partnerships.`,
    `Orthopedic care at our clinic covers the full spectrum from acute fracture treatment to elective joint replacement consultations. Our surgeons specialize in minimally invasive techniques that reduce recovery time and post-operative discomfort. We treat patients of all ages, from pediatric growth plate injuries to adult degenerative conditions.`,
    `Persistent joint or muscle pain should not be ignored, and our orthopedic team is here to identify the root cause. We evaluate the spine, shoulder, elbow, wrist, hip, knee, and ankle with equal expertise. Custom orthotics, casting, splinting, and activity modification plans are available alongside more intensive interventions when needed.`,
  ],
  Neurology: [
    `Our neurology team evaluates and manages conditions affecting the brain, spinal cord, and peripheral nervous system. Patients are referred or self-referred for issues including persistent headaches, dizziness, memory problems, numbness, weakness, and movement disorders. Diagnostic tools include EEG, nerve conduction studies, and neuroimaging coordination.`,
    `Neurological conditions require careful, thorough evaluation. Our neurologists have experience with epilepsy, multiple sclerosis, Parkinson's disease, neuropathy, and stroke follow-up care. Cognitive assessments are available for patients and families concerned about memory decline. We work in close collaboration with neurosurgeons when intervention is indicated.`,
    `From migraine management to post-stroke rehabilitation coordination, our neurology practice covers a broad range of conditions. We take time to listen to the full history before ordering tests, ensuring that diagnostic resources are used appropriately. Long-term treatment plans are reviewed regularly and adjusted as the patient's condition evolves.`,
    `Brain and nerve health significantly affects daily functioning, and our neurology team takes that seriously. We offer specialized clinics for headache, sleep disorders, and movement conditions. Patients with new or worsening neurological symptoms receive priority scheduling. Telemedicine follow-up options are available for established patients with stable conditions.`,
  ],
  Gynecology: [
    `Our gynecology services support women's health at every stage of life. Routine care includes annual well-woman exams, Pap smears, STI screening, and contraception counseling. We also manage conditions such as PCOS, endometriosis, uterine fibroids, pelvic pain, and menopause symptoms, with a focus on both symptom control and long-term wellbeing.`,
    `Women's health care at our clinic is comprehensive and confidential. We perform in-office procedures including colposcopy, endometrial biopsy, IUD insertion and removal, and vulvar assessments. Our providers are experienced in managing abnormal Pap results, HPV follow-up, and complex menstrual disorders. Referrals to maternal-fetal medicine and reproductive endocrinology are coordinated when needed.`,
    `From adolescent gynecology to post-menopausal care, our team is prepared to address each patient's evolving needs. We offer counseling on fertility awareness, hormone therapy, and pelvic floor health. Minimally invasive surgical options — including hysteroscopy and laparoscopic procedures — are discussed with patients for whom conservative management has not provided adequate relief.`,
    `Our gynecologists prioritize open communication and patient education throughout every visit. We address a wide range of concerns from irregular periods and vaginal infections to ovarian cysts and perimenopausal changes. Pelvic ultrasound services and lab testing are coordinated efficiently to minimize wait times for results and follow-up care.`,
  ],
  "Urgent Care": [
    `Our urgent care services are designed for conditions that need prompt attention but do not require an emergency room visit. We treat sprains, minor fractures, lacerations, infections, fever, rashes, urinary tract infections, and flu-like illnesses. Walk-ins are welcome, and on-site labs and X-rays help us reach a diagnosis and begin treatment in a single visit.`,
    `When illness or injury strikes and your primary care physician is unavailable, our urgent care team is here. We handle a broad range of acute conditions efficiently, with shorter wait times than a typical ER. Our providers can prescribe medications, issue work or school excuses, and coordinate follow-up care with specialists as needed.`,
    `Urgent care at our clinic bridges the gap between your primary care provider and the emergency room. We are staffed and equipped to handle most non-life-threatening medical situations, including animal bites, eye injuries, allergic reactions, and occupational health evaluations. Patients with chest pain, difficulty breathing, or signs of stroke should call 911.`,
    `Fast, reliable care for everyday medical problems is what our urgent care department delivers. Services include rapid strep, flu, and COVID testing, as well as wound care, splinting, and IV hydration when indicated. Our care teams communicate visit summaries directly to your primary care provider to maintain continuity of your medical record.`,
  ],
  Surgery: [
    `Our surgical team offers consultations, pre-operative assessment, and post-operative follow-up for a range of elective and urgent procedures. General surgery services include hernia repair, gallbladder removal, appendectomy, and soft tissue tumor excision. We prioritize minimally invasive techniques to reduce recovery time and surgical risk where appropriate.`,
    `Surgical care at our facility begins long before the operating room. We conduct thorough pre-operative evaluations to optimize patient safety, including risk stratification for cardiac and pulmonary conditions. Our surgeons work with anesthesia, nursing, and post-operative care teams to ensure a smooth experience from consultation through recovery.`,
    `Our surgeons provide second opinions and collaborate with referring physicians to confirm that surgery is the appropriate intervention. Procedures are performed in accredited surgical facilities with robust safety protocols. Discharge planning begins at the time of admission, with home care instructions, follow-up scheduling, and medication reconciliation completed before the patient leaves.`,
    `From elective procedures to urgent surgical needs, our team brings extensive training and a patient-centered approach to the operating environment. We specialize in laparoscopic and robotic-assisted techniques for appropriate cases, offering smaller incisions, less pain, and faster return to normal activities. Patient education is a central part of our pre-operative process.`,
  ],
  Pediatrics: [
    `Our pediatric team provides health care for children from newborns through late adolescence. Routine services include well-child visits, developmental screenings, immunizations, and school and sports physicals. We also manage acute illness, chronic conditions such as asthma and ADHD, and behavioral health concerns in partnership with families and schools.`,
    `Child healthcare requires patience, expertise, and a practice environment children feel comfortable in. Our pediatricians are experienced with the full range of childhood illnesses and developmental milestones. We offer extended hours to accommodate working families and same-day sick appointments for acute concerns. Adolescent-specific care, including confidential health discussions, is available.`,
    `From the first newborn exam to college preparedness physicals, our pediatric practice supports healthy development at every stage. We follow current AAP immunization guidelines and offer catch-up schedules for patients who have fallen behind. Nutrition counseling, allergy evaluation, and behavioral health referrals are integrated into our comprehensive care model.`,
    `Our pediatric providers build long-term relationships with children and their families. We track growth and development over time, providing age-appropriate guidance on sleep, screen time, nutrition, and social development. Parents have direct access to their child's care team for questions between visits, reducing unnecessary office visits and providing peace of mind.`,
  ],
  Dermatology: [
    `Our dermatology services address conditions affecting the skin, hair, and nails. Medical dermatology includes evaluation and treatment of acne, eczema, psoriasis, rosacea, fungal infections, and suspicious skin lesions. We perform in-office skin biopsies and have an efficient referral pathway for cases requiring dermatopathology or Mohs surgery.`,
    `Skin health affects both appearance and overall wellbeing. Our dermatologists provide thorough full-body skin exams, particularly important for patients with a history of sun damage, multiple moles, or a family history of melanoma. Cosmetic services are available alongside medical care, including the treatment of hyperpigmentation, scarring, and chronic inflammatory conditions.`,
    `We treat dermatologic conditions across all age groups and skin types. Our team is experienced in managing pediatric skin disorders, pregnancy-related skin changes, and occupational dermatitis. Patch testing for contact allergy and phototherapy for psoriasis or eczema are available at our facility. Prescription skincare guidance is provided at each visit.`,
    `From routine acne management to complex autoimmune skin diseases, our dermatology team offers evidence-based care. We stay current with biologic and targeted therapy options for conditions like moderate-to-severe psoriasis and atopic dermatitis. Early detection of skin cancer through annual screening exams is a priority, especially for fair-skinned patients and outdoor workers.`,
  ],
  Psychiatry: [
    `Our psychiatric services provide evaluation and treatment for a wide range of mental health conditions, including depression, anxiety, bipolar disorder, PTSD, OCD, and psychosis. We offer medication management in combination with therapy referrals and work closely with psychologists and social workers to deliver coordinated care. Telehealth appointments are available for appropriate patients.`,
    `Mental health care at our clinic is confidential, compassionate, and evidence-based. Our psychiatrists conduct comprehensive initial evaluations and develop personalized treatment plans that consider each patient's history, preferences, and goals. Medication changes are monitored carefully with regular follow-up appointments and direct communication between visits when needed.`,
    `We provide psychiatric care for adolescents, adults, and older adults, with attention to the distinct clinical presentations in each age group. Our approach integrates pharmacotherapy with psychoeducation and, where available, structured therapy programs. Crisis resources and coordination with inpatient services are available for patients in acute distress.`,
    `Accessing mental health care can be daunting, and our team works to make the experience as approachable as possible. New patients receive thorough evaluations rather than rushed prescription visits. We address co-occurring substance use and medical comorbidities that frequently complicate psychiatric treatment. Long-term medication management and diagnostic reassessment are offered as part of ongoing care.`,
  ],
  "Physical Therapy": [
    `Our physical therapy team helps patients recover from injury, surgery, and chronic pain through individualized rehabilitation programs. We treat musculoskeletal, neurological, and post-surgical conditions using manual therapy, therapeutic exercise, dry needling, and modalities such as ultrasound and electrical stimulation. Home exercise programs are tailored to each patient's capacity and goals.`,
    `Physical therapy at our clinic begins with a thorough functional assessment to identify movement impairments and contributing factors. Treatment progresses systematically from pain management and range of motion restoration to strength building and functional retraining. We work closely with referring physicians and surgeons to ensure therapy aligns with each patient's overall care plan.`,
    `From sports rehabilitation to recovery after joint replacement, our physical therapists have experience across a broad spectrum of conditions. We prioritize hands-on care combined with patient education so that individuals understand why each exercise or technique is being used. Discharge planning includes a self-management program to reduce the risk of re-injury.`,
    `Chronic pain and mobility limitations respond well to skilled physical therapy when treatment is consistent and well-designed. Our team addresses conditions including low back pain, rotator cuff dysfunction, knee osteoarthritis, plantar fasciitis, and post-fracture stiffness. Balance training and fall prevention programs are available for older adults.`,
  ],
  "Primary Care": [
    `Our primary care team serves as the foundation of your healthcare, providing preventive services, chronic disease management, and coordination with specialists. Annual physicals, blood pressure monitoring, diabetes management, cholesterol screening, and cancer prevention screenings are all part of the routine care we offer. We accept new patients and strive to maintain continuity of care over time.`,
    `Building a relationship with a primary care provider improves long-term health outcomes, and our team is committed to that partnership. We manage common conditions including hypertension, type 2 diabetes, hypothyroidism, asthma, and depression. Acute illness visits are accommodated on short notice, and we provide direct communication with specialists when referrals are needed.`,
    `Comprehensive adult primary care is our specialty. We provide immunizations, wellness counseling, occupational health screenings, and pre-travel health consultations. Chronic disease registries help us proactively reach out to patients due for preventive care or lab monitoring. Our goal is to keep our patients healthy, not just to treat illness when it occurs.`,
    `Our primary care providers take a whole-person approach to health. In addition to managing medical conditions, we address mental health concerns, sleep quality, nutrition, and physical activity. Same-day telehealth options are available for established patients with minor concerns. Medical records and referral coordination are handled efficiently to minimize delays in care.`,
  ],
  Radiology: [
    `Our radiology services support accurate diagnosis with a range of imaging modalities. We perform and interpret digital X-rays, ultrasound examinations, and fluoroscopic procedures on-site. Cross-sectional imaging, including CT and MRI, is coordinated with accredited imaging centers with rapid report turnaround to minimize delays in patient care.`,
    `Timely and accurate imaging is essential to sound clinical decision-making. Our radiology team works closely with referring providers to ensure that the most appropriate study is ordered for each clinical scenario. Results are communicated promptly, with direct consultation available for complex or urgent findings.`,
    `Diagnostic imaging at our facility prioritizes both accuracy and patient comfort. Low-dose protocols are used wherever clinically appropriate to minimize radiation exposure. Ultrasound-guided procedures — including joint aspirations, biopsies, and drainage — are performed by experienced practitioners with direct imaging confirmation.`,
    `Our imaging services are staffed by radiologists with subspecialty training in musculoskeletal, abdominal, and neurological imaging. We support a wide range of clinical questions, from routine chest X-rays to complex soft tissue evaluations. Peer review and quality assurance processes ensure consistent diagnostic quality across all studies.`,
  ],
  Ophthalmology: [
    `Our ophthalmology department provides comprehensive eye care, from routine vision exams to medical and surgical management of eye disease. We evaluate and treat glaucoma, diabetic retinopathy, macular degeneration, cataracts, dry eye syndrome, and strabismus. Anterior and posterior segment imaging is available on-site to guide diagnosis and treatment planning.`,
    `Protecting your vision starts with regular evaluation by an experienced ophthalmologist. Our team screens for eye conditions that often develop without symptoms, including elevated intraocular pressure and early retinal changes. Cataract surgery consultations, refractive surgery assessment, and medical management of inflammatory eye disease are all within our scope of care.`,
    `Eye health is closely linked to overall health, and our ophthalmologists coordinate with internists, endocrinologists, and neurologists when systemic disease affects the eyes. We offer in-office laser treatments, intravitreal injections, and eyelid procedures alongside comprehensive ophthalmic examinations. Low vision rehabilitation resources are available for patients with irreversible visual impairment.`,
    `From pediatric amblyopia to age-related macular degeneration, our ophthalmology team manages the full spectrum of ocular conditions. Contact lens fittings and spectacle prescriptions are provided alongside medical care. Emergency evaluation for sudden vision changes, eye trauma, and acute angle-closure glaucoma is prioritized with same-day or next-day access.`,
  ],
  Dental: [
    `Our dental team provides comprehensive oral healthcare for patients of all ages. Routine services include professional cleanings, dental X-rays, fillings, crowns, bridges, and tooth extractions. Periodontal disease management, root canal therapy, and cosmetic procedures including whitening and veneers are also available. We prioritize preventive care to help patients maintain their natural teeth long-term.`,
    `Oral health is closely connected to overall systemic health, and our dental providers take a thorough approach to each patient's care. We screen for signs of oral cancer, temporomandibular joint dysfunction, and sleep-related breathing disorders alongside standard dental evaluation. Anxiety management options including nitrous oxide sedation are available for patients who experience dental fear.`,
    `Our dental practice offers family dentistry in an environment designed to put patients at ease. We treat children from their first tooth and adults through every stage of life. Restorative services including dental implant placement coordination, dentures, and partial prosthetics help patients regain function and confidence after tooth loss.`,
    `Preventive dentistry reduces the need for expensive restorative work later, and we emphasize patient education on home care techniques at every visit. Digital X-rays reduce radiation exposure while providing high-resolution diagnostic images. Our team stays current with infection control standards and uses modern sterilization protocols to ensure patient safety.`,
  ],
  "General Medicine": [
    `Our general medicine practice provides broad diagnostic and therapeutic services for adult patients. We evaluate undifferentiated symptoms, manage chronic medical conditions, and coordinate specialist referrals as needed. Common conditions we manage include infections, metabolic disorders, respiratory illness, and gastrointestinal complaints.`,
    `General medicine serves as an accessible entry point for patients with a wide range of health concerns. Our clinicians are trained to evaluate complex presentations and identify when specialist input is required. We emphasize thorough history-taking and physical examination alongside appropriate diagnostic testing.`,
    `From acute illness visits to management of long-term health conditions, our general medicine team is equipped to handle diverse clinical needs. We provide prescription management, sick notes, specialist referrals, and coordination with allied health providers including dietitians and physiotherapists.`,
    `Our general medicine providers bring a broad clinical foundation to every patient encounter. We manage hypertension, diabetes, thyroid conditions, anemia, and infectious disease alongside less common diagnoses. Patients presenting with multiple concurrent conditions benefit from our integrated approach to assessment and management.`,
  ],
};

const DEFAULT_SPECIALTY_DESC = [
  `Our team provides specialized care with a focus on thorough evaluation and individualized treatment planning. Patients benefit from experienced clinicians, current clinical guidelines, and a commitment to clear communication throughout the care process.`,
  `Specialized care at our clinic is delivered by trained providers who stay current with evidence-based practices. We address both acute presentations and chronic conditions, coordinating with other disciplines as the patient's needs require.`,
  `Our clinical team approaches each patient encounter with attention to detail and a preference for conservative, effective treatment strategies. When more intensive intervention is warranted, we facilitate referrals and coordinate care across settings.`,
  `We provide focused specialty care in a setting designed to support patient comfort and clinical accuracy. Appointments are structured to allow adequate time for history review, examination, and patient education without feeling rushed.`,
];

// ── Intro templates ───────────────────────────────────────────────────────────

const INTROS = [
  (name, city, specs) =>
    `${name}${city ? `, located in ${city},` : ""} provides ${listSpecs(specs)} services to patients throughout the area. The practice emphasizes thorough clinical evaluation and clear communication so that every patient leaves with a complete understanding of their diagnosis and next steps.`,
  (name, city, specs) =>
    `For ${city ? `residents of ${city}` : "patients in the area"} seeking ${listSpecs(specs)} care, ${name} offers a patient-centered approach backed by clinical experience. New patient appointments are accepted, and the team works to accommodate urgent concerns in a timely manner.`,
  (name, city, specs) =>
    `${name} serves ${city ? `the ${city} community` : "the local community"} with a focus on ${listSpecs(specs)}. The clinical team brings experience across a range of conditions and stays current with evolving treatment guidelines to deliver evidence-based care.`,
  (name, city, specs) =>
    `Based in ${city || "the area"}, ${name} delivers ${listSpecs(specs)} care with an emphasis on accessibility and clinical quality. Patients benefit from a team that takes time to understand individual health histories before recommending treatment.`,
  (name, city, specs) =>
    `${name} has established itself as a reliable destination for ${listSpecs(specs)} care in ${city || "the local area"}. The practice combines clinical expertise with a commitment to patient education, ensuring that individuals and families can make informed decisions about their health.`,
];

const ABOUT_PARAS = [
  (name) =>
    `At ${name}, the care team believes that informed patients achieve better outcomes. Each visit includes time for questions, and providers offer plain-language explanations of diagnoses, treatment options, and follow-up expectations.`,
  (name) =>
    `The team at ${name} takes a whole-person view of health. Beyond addressing immediate complaints, providers look for underlying patterns, risk factors, and lifestyle contributors that may affect long-term wellbeing.`,
  (name) =>
    `${name} is committed to reducing barriers to quality care. Appointment availability, transparent billing practices, and clear referral pathways are priorities that reflect the practice's broader mission to serve the community effectively.`,
  (name) =>
    `Continuity of care is a priority at ${name}. Patients who return to the same provider benefit from accumulated clinical knowledge and a therapeutic relationship built on trust and mutual understanding.`,
  (name) =>
    `The clinical culture at ${name} values thoroughness over speed. Providers conduct comprehensive assessments rather than focusing narrowly on chief complaints, often identifying concerns that a shorter encounter would miss.`,
];

const LOCATION_PARAS = [
  (name, city, address, phone) =>
    `${name} is conveniently accessible${city ? ` to patients in and around ${city}` : ""}. ${address ? `The clinic is located at ${address}.` : ""} ${phone ? `For appointments or questions, patients can reach the office at ${phone}.` : ""}`,
  (name, city, address, phone) =>
    `Patients visiting ${name} will find the clinic ${city ? `situated in ${city}` : "conveniently located"}${address ? ` at ${address}` : ""}. ${phone ? `The front desk is reachable at ${phone} for scheduling and general inquiries.` : ""}`,
  (name, city, address, phone) =>
    `${city ? `Serving ${city} and surrounding communities, ` : ""}${name} ${address ? `operates from ${address}` : "is accessible to local residents"}. ${phone ? `New and returning patients may call ${phone} to schedule an appointment or ask questions about available services.` : ""}`,
];

function listSpecs(specialties) {
  if (!specialties || specialties.length === 0) return "medical";
  if (specialties.length === 1) return specialties[0];
  if (specialties.length === 2) return `${specialties[0]} and ${specialties[1]}`;
  return `${specialties.slice(0, -1).join(", ")}, and ${specialties[specialties.length - 1]}`;
}

// ── Content builder ──────────────────────────────────────────────────────────

function buildContent(post) {
  const h = hash(post.companyName + String(post._id));
  const city = extractCity(post.address || "");
  const name = post.companyName || "";
  const specs = post.specialties || [];
  const address = (post.address || "").replace(/,?\s*USA\s*$/, "").trim();
  const phone = post.phone || "";

  const intro = pick(INTROS, h)(name, city, specs);
  const about = pick(ABOUT_PARAS, h + 1)(name);
  const location = pick(LOCATION_PARAS, h + 2)(name, city, address, phone);

  // Specialty blocks
  let specHtml = "";
  if (specs.length > 0) {
    const items = specs.map((s) => {
      const variants = SPECIALTY_DESC[s] || DEFAULT_SPECIALTY_DESC;
      const desc = pick(variants, hash(name + s));
      return `<div class="spec-item"><strong>${s}</strong><p>${desc}</p></div>`;
    }).join("");
    specHtml = `<div class="spec-block"><h3>Services</h3>${items}</div>`;
  }

  // Hours block — preserve existing if present
  const hoursMatch = (post.content || "").match(/<div class="hours-block">[\s\S]*?<\/div>\s*<\/div>/);
  const hoursHtml = hoursMatch ? hoursMatch[0] : "";

  return [
    `<p>${intro}</p>`,
    `<p>${about}</p>`,
    specHtml,
    `<p>${location}</p>`,
    hoursHtml,
  ].filter(Boolean).join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();
  const col = db.collection("posts");

  const posts = await col.find({}).toArray();
  console.log(`Total posts: ${posts.length}`);

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    const contentLen = (post.content || "").length;
    const noSpecialties = !post.specialties || post.specialties.length === 0;

    if (contentLen >= MIN_LENGTH && !noSpecialties) {
      skipped++;
      continue;
    }

    const newContent = buildContent(post);

    if (!DRY_RUN) {
      await col.updateOne(
        { _id: post._id },
        { $set: { content: newContent, updatedAt: new Date() } }
      );
    } else {
      console.log(`\n[DRY RUN] ${post.companyName} (${contentLen} chars → ${newContent.length} chars)`);
      if (updated < 2) console.log(newContent.slice(0, 300) + "...");
    }

    updated++;
    if (updated % 100 === 0) console.log(`Updated ${updated}...`);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (already good): ${skipped}`);
  await client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
