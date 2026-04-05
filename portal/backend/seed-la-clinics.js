require("dotenv").config();
const mongoose = require("mongoose");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const Post = require("./src/models/postModel");

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const clinics = [
  {
    title: "Cedars-Sinai Medical Center – Los Angeles",
    companyName: "Cedars-Sinai Medical Center",
    content: "<p>Cedars-Sinai Medical Center is one of the most prominent academic medical centers in the United States, consistently ranked among the best hospitals in the nation by U.S. News &amp; World Report. Located in Los Angeles, Cedars-Sinai offers comprehensive inpatient and outpatient care across virtually all medical and surgical specialties.</p><p>Services include cardiology, oncology, neurology, orthopedics, obstetrics, transplant surgery, and emergency medicine. The center is home to world-renowned research institutes and clinical trials programs. Available 24/7 with over 2,000 physicians on staff.</p>",
    address: "8700 Beverly Blvd, Los Angeles, CA 90048",
    lat: 34.0751, lng: -118.3796,
    phone: "+1 310-423-3277", email: "info@cedars-sinai.org",
    status: "active", viewCount: 4820,
    _img: "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?w=800",
  },
  {
    title: "UCLA Medical Center – Ronald Reagan Campus",
    companyName: "UCLA Health – Ronald Reagan UCLA Medical Center",
    content: "<p>Ronald Reagan UCLA Medical Center is a world-class academic medical center and the flagship hospital of UCLA Health. Consistently ranked as one of the best hospitals in California and the nation, it offers cutting-edge treatments across all major specialties.</p><p>Specialties include oncology, neurosurgery, cardiology, transplant medicine, pediatrics, and reproductive endocrinology. The medical center is affiliated with the David Geffen School of Medicine and conducts extensive clinical research and trials.</p>",
    address: "757 Westwood Plaza, Los Angeles, CA 90095",
    lat: 34.0664, lng: -118.4453,
    phone: "+1 310-825-9111", email: "info@uclahealth.org",
    status: "active", viewCount: 3970,
    _img: "https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?w=800",
  },
  {
    title: "Keck Medical Center of USC",
    companyName: "Keck Medicine of USC",
    content: "<p>Keck Medical Center of USC is the university medical center of the University of Southern California, comprising Keck Hospital of USC and USC Norris Cancer Hospital. It is one of only two university-based medical centers in the Los Angeles area.</p><p>Keck specializes in complex, high-acuity conditions and offers leading programs in transplantation, cancer treatment, neurology, cardiology, and orthopedics. The center is recognized for its pioneering research and commitment to patient-centered care.</p>",
    address: "1500 San Pablo St, Los Angeles, CA 90033",
    lat: 34.0627, lng: -118.2014,
    phone: "+1 800-872-2273", email: "info@keckmedicine.org",
    status: "active", viewCount: 2980,
    _img: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?w=800",
  },
  {
    title: "Children's Hospital Los Angeles",
    companyName: "Children's Hospital Los Angeles (CHLA)",
    content: "<p>Children's Hospital Los Angeles is the leading pediatric hospital in Southern California and one of the top children's hospitals in the nation. CHLA provides compassionate care for children from infancy through young adulthood.</p><p>Specialties include pediatric oncology, cardiac surgery, neurology, gastroenterology, neonatology, and organ transplantation. CHLA is affiliated with the Keck School of Medicine of USC and is a major center for pediatric clinical research and innovation.</p>",
    address: "4650 Sunset Blvd, Los Angeles, CA 90027",
    lat: 34.0989, lng: -118.2891,
    phone: "+1 323-660-2450", email: "info@chla.org",
    status: "active", viewCount: 3540,
    _img: "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?w=800",
  },
  {
    title: "Kaiser Permanente Los Angeles Medical Center",
    companyName: "Kaiser Permanente – Los Angeles Medical Center",
    content: "<p>Kaiser Permanente Los Angeles Medical Center is one of the largest and most comprehensive hospitals in Southern California. It serves Kaiser Permanente members with integrated care that spans prevention, diagnosis, treatment, and follow-up.</p><p>Services include emergency medicine, cardiovascular care, oncology, maternity, behavioral health, orthopedic surgery, and robotic surgery. The center is known for its integrated care model that connects primary and specialty care seamlessly.</p>",
    address: "4867 Sunset Blvd, Los Angeles, CA 90027",
    lat: 34.0997, lng: -118.2916,
    phone: "+1 323-783-4011", email: "info@kp.org",
    status: "active", viewCount: 2710,
    _img: "https://images.pexels.com/photos/2324837/pexels-photo-2324837.jpeg?w=800",
  },
  {
    title: "Providence Saint John's Health Center – Santa Monica",
    companyName: "Providence Saint John's Health Center",
    content: "<p>Providence Saint John's Health Center in Santa Monica is one of Southern California's leading acute care hospitals, serving the greater west Los Angeles community for over 100 years. It is part of the Providence health system.</p><p>The center offers a full range of services including the John Wayne Cancer Institute, the Pacific Neuroscience Institute, emergency care, cardiac care, maternity services, and orthopedic surgery. Known for expert oncology care and advanced neurological treatments.</p>",
    address: "2121 Santa Monica Blvd, Santa Monica, CA 90404",
    lat: 34.0242, lng: -118.4726,
    phone: "+1 310-829-5511", email: "info@saintjohns.org",
    status: "active", viewCount: 1890,
    _img: "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?w=800",
  },
  {
    title: "Good Samaritan Hospital Los Angeles",
    companyName: "Good Samaritan Hospital",
    content: "<p>Good Samaritan Hospital is a full-service, acute care hospital located in downtown Los Angeles. It has served the LA community for over 130 years and is recognized for its expertise in cardiovascular care, orthopedics, and emergency services.</p><p>The hospital features advanced cardiac catheterization labs, a certified primary stroke center, comprehensive orthopedic and spine surgery, a level II trauma center, and a range of outpatient services. It is affiliated with the Hospital Corporation of America (HCA).</p>",
    address: "1225 Wilshire Blvd, Los Angeles, CA 90017",
    lat: 34.0567, lng: -118.2757,
    phone: "+1 213-977-2121", email: "info@goodsamla.org",
    status: "active", viewCount: 1620,
    _img: "https://images.pexels.com/photos/3992933/pexels-photo-3992933.jpeg?w=800",
  },
  {
    title: "Hollywood Presbyterian Medical Center",
    companyName: "Hollywood Presbyterian Medical Center",
    content: "<p>Hollywood Presbyterian Medical Center (HPMC) has served the Hollywood community for over 100 years. It is a full-service community hospital providing compassionate care to a diverse patient population in the heart of Los Angeles.</p><p>Services include emergency care, cardiology, orthopedics, obstetrics and maternity, surgical services, and a comprehensive stroke program. HPMC is committed to providing culturally sensitive care and is known for its accessibility and bilingual services.</p>",
    address: "1300 N Vermont Ave, Los Angeles, CA 90027",
    lat: 34.0979, lng: -118.2904,
    phone: "+1 323-913-4800", email: "info@hpmc.com",
    status: "active", viewCount: 1340,
    _img: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?w=800",
  },
  {
    title: "Marina Del Rey Hospital",
    companyName: "Marina Del Rey Hospital",
    content: "<p>Marina Del Rey Hospital is an acute care hospital serving the westside communities of Los Angeles. It is a boutique-style hospital known for its personalized approach to care and state-of-the-art facilities in a comfortable environment.</p><p>Specialties include bariatric surgery, orthopedics, general surgery, emergency care, and maternity services. The hospital is particularly recognized for its bariatric (weight loss surgery) program and joint replacement program. Offers private patient rooms and concierge-level service.</p>",
    address: "4650 Lincoln Blvd, Marina Del Rey, CA 90292",
    lat: 33.9822, lng: -118.4414,
    phone: "+1 310-823-8911", email: "info@marinahospital.com",
    status: "active", viewCount: 1180,
    _img: "https://images.pexels.com/photos/127873/pexels-photo-127873.jpeg?w=800",
  },
  {
    title: "Huntington Hospital – Pasadena",
    companyName: "Huntington Hospital",
    content: "<p>Huntington Hospital is a leading not-for-profit community hospital located in Pasadena, serving the San Gabriel Valley and greater Los Angeles area. It is one of the largest community hospitals in Southern California with 619 licensed beds.</p><p>Services include cancer care, cardiac and vascular surgery, orthopedics, maternity, neuroscience, and emergency medicine. Huntington is consistently recognized for quality and patient safety, holding numerous accreditations and certifications for excellence in care.</p>",
    address: "100 W California Blvd, Pasadena, CA 91105",
    lat: 34.1451, lng: -118.1507,
    phone: "+1 626-397-5000", email: "info@huntingtonhospital.com",
    status: "active", viewCount: 2050,
    _img: "https://images.pexels.com/photos/1350560/pexels-photo-1350560.jpeg?w=800",
  },
  {
    title: "Torrance Memorial Medical Center",
    companyName: "Torrance Memorial Medical Center",
    content: "<p>Torrance Memorial Medical Center is a nationally recognized nonprofit community hospital serving the South Bay area of Los Angeles. With over 500 beds, it is one of the most respected hospitals in Southern California.</p><p>Specialties include cardiovascular care, oncology, orthopedic and spine surgery, women's health, emergency services, and behavioral health. Torrance Memorial is consistently ranked among the top hospitals in California and holds Magnet designation for nursing excellence.</p>",
    address: "3330 Lomita Blvd, Torrance, CA 90505",
    lat: 33.8278, lng: -118.3427,
    phone: "+1 310-325-9110", email: "info@torrancememorial.org",
    status: "active", viewCount: 1760,
    _img: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=800",
  },
  {
    title: "Cedars-Sinai Kerlan-Jobe Institute – Sports Medicine",
    companyName: "Cedars-Sinai Kerlan-Jobe Institute",
    content: "<p>The Cedars-Sinai Kerlan-Jobe Institute is one of the most prestigious sports medicine and orthopedic surgery practices in the world. Based in Los Angeles, it has served as the official medical provider for numerous professional sports teams including the LA Dodgers, LA Rams, LA Kings, and LA Galaxy.</p><p>Services include orthopedic surgery, arthroscopy, sports medicine, physical therapy, and injury prevention programs. The institute is renowned for treating elite athletes and offers the same world-class orthopedic care to all patients.</p>",
    address: "6801 Park Terrace, Los Angeles, CA 90045",
    lat: 33.9592, lng: -118.3957,
    phone: "+1 310-665-7200", email: "info@kerlanjobe.com",
    status: "active", viewCount: 2230,
    _img: "https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?w=800",
  },
  {
    title: "Cedars-Sinai Guerin Children's – Pediatric Specialty Care",
    companyName: "Cedars-Sinai Guerin Children's",
    content: "<p>Cedars-Sinai Guerin Children's is dedicated to providing specialized pediatric medical care in a compassionate, family-centered environment. It brings together expert pediatric specialists under one roof at the Cedars-Sinai campus in Los Angeles.</p><p>Pediatric specialties include cardiology, endocrinology, gastroenterology, neurology, oncology, pulmonology, and surgery. The team works closely with adult specialists to coordinate seamless transitions of care for young patients with complex conditions.</p>",
    address: "8700 Beverly Blvd, Los Angeles, CA 90048",
    lat: 34.0754, lng: -118.3801,
    phone: "+1 310-423-6006", email: "info@cedars-sinai.org",
    status: "active", viewCount: 1490,
    _img: "https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?w=800",
  },
  {
    title: "LAC+USC Medical Center",
    companyName: "Los Angeles County + USC Medical Center",
    content: "<p>Los Angeles County + USC Medical Center (LAC+USC) is a public teaching hospital and one of the largest hospitals in the United States. It serves as the primary safety-net hospital for Los Angeles County and is affiliated with the Keck School of Medicine of USC.</p><p>LAC+USC provides comprehensive medical and surgical care, trauma services (Level I Trauma Center), neonatal intensive care, psychiatric services, and specialty clinics. It is nationally recognized for its burn center, trauma services, and graduate medical education programs.</p>",
    address: "2051 Marengo St, Los Angeles, CA 90033",
    lat: 34.0595, lng: -118.2001,
    phone: "+1 323-409-1000", email: "info@lacusc.org",
    status: "active", viewCount: 2410,
    _img: "https://images.pexels.com/photos/748780/pexels-photo-748780.jpeg?w=800",
  },
  {
    title: "Providence Cedars-Sinai Tarzana Medical Center",
    companyName: "Providence Cedars-Sinai Tarzana Medical Center",
    content: "<p>Providence Cedars-Sinai Tarzana Medical Center is a full-service acute care hospital serving the San Fernando Valley. As part of the Providence and Cedars-Sinai partnership, it combines community care with academic excellence.</p><p>Services include emergency medicine, cardiac care, cancer services, maternity and women's health, neuroscience, orthopedics, and robotic-assisted surgery. The medical center is recognized for high-quality stroke care and has earned The Joint Commission's Gold Seal of Approval.</p>",
    address: "18321 Clark St, Tarzana, CA 91356",
    lat: 34.1706, lng: -118.5548,
    phone: "+1 818-881-0800", email: "info@tarzana.org",
    status: "active", viewCount: 1320,
    _img: "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?w=800",
  },
  {
    title: "Adventist Health White Memorial – East LA",
    companyName: "Adventist Health White Memorial",
    content: "<p>Adventist Health White Memorial is a faith-based, not-for-profit hospital located in the Boyle Heights neighborhood of East Los Angeles. It has served the community for over 100 years with a mission of whole-person care.</p><p>Services include emergency care, maternity, oncology, cardiac care, orthopedics, and a range of outpatient specialty clinics. The hospital is a major training site for medical residents and is known for its commitment to serving underserved communities in East LA.</p>",
    address: "1720 César E. Chávez Ave, Los Angeles, CA 90033",
    lat: 34.0520, lng: -118.2137,
    phone: "+1 323-268-5000", email: "info@whitememorial.com",
    status: "active", viewCount: 1150,
    _img: "https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?w=800",
  },
  {
    title: "Tower Oncology – Beverly Hills Cancer Center",
    companyName: "Tower Oncology",
    content: "<p>Tower Oncology is a leading private oncology and hematology practice in Beverly Hills, offering comprehensive cancer care in an intimate, patient-centered setting. It is one of the most respected cancer treatment centers in Los Angeles.</p><p>Services include medical oncology, hematology, immunotherapy, targeted therapy, clinical trials, and supportive care. Tower Oncology is known for its multidisciplinary approach to cancer treatment and its access to the latest FDA-approved therapies and clinical research studies.</p>",
    address: "9090 Wilshire Blvd, Beverly Hills, CA 90211",
    lat: 34.0676, lng: -118.3942,
    phone: "+1 310-285-7213", email: "info@toweroncology.com",
    status: "active", viewCount: 1870,
    _img: "https://images.pexels.com/photos/4225920/pexels-photo-4225920.jpeg?w=800",
  },
  {
    title: "Glendale Memorial Hospital and Health Center",
    companyName: "Glendale Memorial Hospital and Health Center",
    content: "<p>Glendale Memorial Hospital and Health Center is a 334-bed nonprofit community hospital serving Glendale and surrounding communities in the greater Los Angeles area. Part of Dignity Health, it has provided quality care since 1926.</p><p>Specialties include cardiovascular care, oncology, orthopedics, women's health, emergency medicine, and neuroscience. The hospital is recognized as a Primary Stroke Center and Cardiac Intervention Center, and holds multiple awards for quality and patient safety.</p>",
    address: "1420 S Central Ave, Glendale, CA 91204",
    lat: 34.1302, lng: -118.2572,
    phone: "+1 818-502-1900", email: "info@glendalememorial.com",
    status: "active", viewCount: 1420,
    _img: "https://images.pexels.com/photos/2324837/pexels-photo-2324837.jpeg?w=800",
  },
  {
    title: "Olympia Medical Center – West Hollywood",
    companyName: "Olympia Medical Center",
    content: "<p>Olympia Medical Center is a full-service acute care hospital located in the heart of Los Angeles. It offers a comprehensive range of medical and surgical services with a focus on personalized, high-quality care in a modern, comfortable environment.</p><p>Services include cardiovascular care, orthopedic surgery, minimally invasive surgery, emergency care, diagnostic imaging, and rehabilitation. Olympia Medical Center is particularly well known for its cardiac program and advanced surgical capabilities.</p>",
    address: "5900 W Olympic Blvd, Los Angeles, CA 90036",
    lat: 34.0525, lng: -118.3637,
    phone: "+1 310-657-5900", email: "info@olympiamedcenter.com",
    status: "active", viewCount: 980,
    _img: "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?w=800",
  },
  {
    title: "Grossman Burn Centers – Los Angeles",
    companyName: "Grossman Burn Centers",
    content: "<p>Grossman Burn Centers is one of the nation's leading burn care and reconstructive surgery centers, headquartered in Los Angeles. Founded by renowned plastic and reconstructive surgeon Dr. Peter Grossman, the center has treated thousands of patients with severe burns and complex wounds.</p><p>Services include acute burn care, scar revision, reconstructive surgery, skin grafting, laser treatments, and burn rehabilitation. Grossman Burn Centers also provides telburn consultations and outreach programs, and is affiliated with West Hills Hospital and Medical Center.</p>",
    address: "7326 Medical Center Dr, West Hills, CA 91307",
    lat: 34.2006, lng: -118.6418,
    phone: "+1 818-676-4001", email: "info@grossmanburncenter.com",
    status: "active", viewCount: 1640,
    _img: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?w=800",
  },
];

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    proto.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlink(dest, () => {});
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hospitals");
  console.log("Connected. Seeding 20 LA clinics...\n");

  for (const clinic of clinics) {
    const { _img, ...data } = clinic;
    let imageUrl = "";

    try {
      const ext = ".jpg";
      const fname = `la-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const dest = path.join(UPLOADS_DIR, fname);
      await downloadImage(_img, dest);
      imageUrl = `/uploads/${fname}`;
      console.log(`  ✓ Image: ${fname}`);
    } catch (e) {
      console.warn(`  ⚠ Image failed: ${e.message}`);
    }

    const post = new Post({ ...data, imageUrl, order: 0 });
    await post.save();
    console.log(`  ✅ ${data.companyName}`);
  }

  console.log("\nDone. 20 LA clinics inserted.");
  await mongoose.disconnect();
}

run().catch(console.error);
