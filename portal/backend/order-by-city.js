/**
 * order-by-city.js
 * Sets `order` field on each post based on city population rank.
 * Larger cities get lower order numbers → appear first in listing.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

// US city population rank (lower = bigger city)
// Source: US Census estimates
const CITY_RANK = {
  "new york": 1, "brooklyn": 1, "bronx": 1, "staten island": 1, "manhattan": 1,
  "los angeles": 2, "los angeles county": 2, "la": 2,
  "chicago": 3,
  "houston": 4, "the woodlands": 4,
  "phoenix": 5,
  "philadelphia": 6, "penn wynne": 6, "coatesville": 6,
  "san antonio": 7, "alamo heights": 7, "new braunfels": 7,
  "san diego": 8, "la jolla": 8, "chula vista": 8, "escondido": 8,
  "dallas": 9, "plano": 9, "garland": 9, "irving": 9, "mckinney": 9, "frisco": 9,
  "san jose": 10,
  "austin": 11, "round rock": 11, "pflugerville": 11, "bee cave": 11, "west lake hills": 11,
  "jacksonville": 12,
  "fort worth": 13,
  "columbus": 14,
  "charlotte": 15, "concord": 15, "gastonia": 15,
  "indianapolis": 16,
  "san francisco": 17, "oakland": 17, "berkeley": 17, "fremont": 17, "hayward": 17,
  "seattle": 18, "bellevue": 18, "kent": 18, "renton": 18, "kirkland": 18, "redmond": 18, "tacoma": 18, "everett": 18, "marysville": 18,
  "denver": 19, "aurora": 19, "lakewood": 19, "thornton": 19, "arvada": 19, "westminster": 19, "greenwood village": 19,
  "washington": 20, "bethesda": 20, "silver spring": 20, "rockville": 20, "gaithersburg": 20,
  "nashville": 21,
  "oklahoma city": 22,
  "el paso": 23, "laredo": 23, "corpus christi": 23, "lubbock": 23, "amarillo": 23,
  "boston": 24, "cambridge": 24, "lowell": 24, "worcester": 24, "brockton": 24, "springfield": 24,
  "las vegas": 25, "henderson": 25, "north las vegas": 25,
  "memphis": 26,
  "louisville": 27, "lexington": 27, "bowling green": 27,
  "baltimore": 28, "towson": 28, "annapolis": 28, "frederick": 28,
  "milwaukee": 29, "madison": 29, "green bay": 29, "kenosha": 29, "racine": 29, "appleton": 29,
  "albuquerque": 30, "santa fe": 30, "rio rancho": 30, "las cruces": 30,
  "tucson": 31, "mesa": 31, "chandler": 31, "gilbert": 31, "scottsdale": 31, "glendale": 31, "tempe": 31, "peoria": 31, "surprise": 31, "avondale": 31, "goodyear": 31, "flagstaff": 31, "yuma": 31, "prescott": 31,
  "fresno": 32, "bakersfield": 32, "stockton": 32, "modesto": 32, "visalia": 32, "salinas": 32,
  "sacramento": 33, "elk grove": 33, "roseville": 33, "folsom": 33,
  "kansas city": 34, "overland park": 34, "wichita": 34, "topeka": 34,
  "atlanta": 35, "savannah": 35, "augusta": 35, "columbus": 35, "macon": 35, "athens": 35,
  "miami": 36, "miami beach": 36, "hialeah": 36, "fort lauderdale": 36, "west palm beach": 36,
  "raleigh": 37, "durham": 37, "chapel hill": 37, "cary": 37, "greensboro": 37, "winston-salem": 37, "fayetteville": 37, "high point": 37, "concord": 37,
  "omaha": 38, "lincoln": 38,
  "colorado springs": 39, "pueblo": 39, "fort collins": 39, "boulder": 39, "greeley": 39, "longmont": 39,
  "minneapolis": 40, "st paul": 40, "st louis park": 40, "bloomington": 40, "duluth": 40, "rochester": 40, "plymouth": 40, "brooklyn park": 40,
  "new orleans": 41, "baton rouge": 41, "lafayette": 41, "shreveport": 41, "metairie": 41, "lake charles": 41,
  "arlington": 42,
  "cleveland": 43, "akron": 43, "toledo": 43, "dayton": 43, "youngstown": 43, "canton": 43, "lorain": 43, "hamilton": 43, "kettering": 43, "parma": 43,
  "tampa": 44, "st petersburg": 44, "clearwater": 44, "lakeland": 44,
  "anaheim": 45, "irvine": 45, "santa ana": 45, "orange": 45, "fullerton": 45, "garden grove": 45, "huntington beach": 45,
  "riverside": 46, "san bernardino": 46, "fontana": 46, "moreno valley": 46, "rancho cucamonga": 46, "ontario": 46, "corona": 46,
  "st. louis": 47, "st louis": 47, "springfield": 47,
  "pittsburgh": 48, "erie": 48, "allentown": 48, "scranton": 48, "bethlehem": 48, "reading": 48, "lancaster": 48, "york": 48,
  "orlando": 49, "jacksonville": 49, "gainesville": 49, "tallahassee": 49, "pensacola": 49, "fort myers": 49, "cape coral": 49, "port st lucie": 49, "daytona beach": 49, "palm bay": 49,
  "anchorage": 50,
  "cincinnati": 51, "columbus": 51,
  "jersey city": 52, "newark": 52, "paterson": 52, "trenton": 52, "camden": 52,
  "reno": 53, "sparks": 53, "carson city": 53,
  "buffalo": 54, "rochester": 54, "yonkers": 54, "syracuse": 54, "albany": 54, "utica": 54, "troy": 54, "schenectady": 54,
  "richmond": 55, "virginia beach": 55, "chesapeake": 55, "norfolk": 55, "hampton": 55, "newport news": 55, "alexandria": 55, "arlington": 55, "roanoke": 55, "lynchburg": 55, "charlottesville": 55,
  "boise": 56, "nampa": 56, "meridian": 56, "idaho falls": 56, "pocatello": 56,
  "spokane": 57, "yakima": 57, "bellingham": 57, "kennewick": 57,
  "salt lake city": 58, "provo": 58, "west valley city": 58, "ogden": 58, "st george": 58, "orem": 58, "logan": 58,
  "des moines": 59, "cedar rapids": 59, "davenport": 59, "sioux city": 59, "waterloo": 59, "council bluffs": 59,
  "hartford": 60, "new haven": 60, "bridgeport": 60, "stamford": 60,
  "providence": 61,
  "birmingham": 62, "montgomery": 62, "huntsville": 62, "mobile": 62, "tuscaloosa": 62, "dothan": 62, "florence": 62, "decatur": 62, "auburn": 62,
  "jackson": 63, "gulfport": 63, "biloxi": 63, "hattiesburg": 63, "meridian": 63,
  "little rock": 64, "fort smith": 64, "fayetteville": 64, "springdale": 64, "jonesboro": 64,
  "knoxville": 65, "chattanooga": 65, "clarksville": 65, "murfreesboro": 65, "jackson": 65, "johnson city": 65, "kingsport": 65,
  "charlotte": 15,
  "portland": 66, "eugene": 66, "salem": 66, "gresham": 66, "hillsboro": 66, "beaverton": 66, "medford": 66, "bend": 66, "corvallis": 66, "springfield": 66,
  "wichita": 34,
  "long beach": 67, "glendale": 67, "pasadena": 67, "torrance": 67, "west covina": 67, "norwalk": 67, "el monte": 67, "thousand oaks": 67, "simi valley": 67, "oxnard": 67, "lancaste": 67, "palmdale": 67,
  "sunnyvale": 68, "santa rosa": 68, "santa clara": 68, "concord": 68, "antioch": 68, "fairfield": 68,
  "fort wayne": 69, "evansville": 69, "south bend": 69, "gary": 69, "bloomington": 69, "terre haute": 69, "muncie": 69, "anderson": 69,
  "grand rapids": 70, "warren": 70, "sterling heights": 70, "ann arbor": 70, "dearborn": 70, "livonia": 70, "flint": 70, "lansing": 70,
  "sioux falls": 71, "rapid city": 71, "aberdeen": 71,
  "fargo": 72, "bismarck": 72, "grand forks": 72, "minot": 72,
  "billings": 73, "missoula": 73, "great falls": 73,
  "casper": 74, "laramie": 74, "gillette": 74, "cheyenne": 74,
  "wilmington": 75, "dover": 75,
  "vail": 90, "lone tree": 90, "manhasset": 52, "marina del rey": 2, "beverly hills": 2, "tarzana": 2, "west hills": 2, "hollywood": 2, "maywood": 2, "des plaines": 3, "oak lawn": 3, "elmhurst": 3, "englewood": 3, "palo alto": 17, "mountain view": 17, "stanford": 17, "walnut creek": 17, "la jolla": 8, "falls church": 20, "charlestown": 24, "penn wynne": 6, "selma": 100,
  // NJ suburbs of NYC
  "hoboken": 52, "bayonne": 52, "north bergen": 52, "union city": 52, "kearny": 52, "lyndhurst": 52, "secaucus": 52, "edgewater": 52, "cliffside park": 52, "bergenfield": 52, "hackensack": 52, "irvington": 52, "bloomfield": 52, "clifton": 52, "wayne": 52, "north haven": 52, "woodland park": 52, "pennsauken": 52, "bellmawr": 52, "blackwood": 52, "levittown": 52,
  // CT suburbs
  "new haven": 60, "east haven": 60, "branford": 60, "hamden": 60, "north haven": 60, "west haven": 60, "trumbull": 60, "westport": 60, "old saybrook": 60, "uncasville": 60,
  // FL
  "santa monica": 2, "weston": 36,
  // NJ other
  "middletown": 52, "neptune city": 52, "pennington": 55, "hamilton township": 52, "browns mills": 52, "allendale": 52,
};

function extractCity(address) {
  if (!address) return "";
  const cleaned = address.replace(/,?\s*USA\s*$/, "").trim();
  const parts = cleaned.split(",").map((p) => p.trim());
  const last = parts[parts.length - 1];
  if (/^[A-Z]{2}(\s+\d{5})?$/.test(last) && parts.length >= 2) {
    return parts[parts.length - 2].toLowerCase();
  }
  return last.replace(/^\d{5}\s*/, "").trim().toLowerCase();
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hospitals");

  const posts = await Post.find({ status: "active" }, { address: 1 }).lean();
  console.log(`Setting order for ${posts.length} posts...\n`);

  let found = 0, missing = 0;
  const ops = posts.map((p) => {
    const city = extractCity(p.address);
    const rank = CITY_RANK[city];
    if (rank) found++;
    else { missing++; if (missing <= 10) console.log(`  ? unknown city: "${city}"`); }
    return {
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { order: rank || 99 } },
      },
    };
  });

  await Post.bulkWrite(ops);
  console.log(`\n✅ Done. Ranked: ${found}, Unknown (order=99): ${missing}`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
