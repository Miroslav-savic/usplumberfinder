/**
 * seed-blog.js
 * Seeds 12 real plumbing blog articles.
 * Run: node seed-blog.js [--dry-run]
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Blog = require("./src/models/blogModel");

const DRY_RUN = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/plumbers";

const ARTICLES = [
  {
    title: "How to Fix a Leaky Faucet: A Step-by-Step Guide",
    excerpt: "A dripping faucet wastes thousands of gallons of water per year. Learn how to diagnose and fix the most common faucet leaks yourself — no plumber required.",
    tags: ["DIY", "Faucet Repair", "Water Saving"],
    readTime: 7,
    publishedAt: new Date("2025-12-10"),
    content: `<p>A leaky faucet is one of the most common household plumbing problems — and one of the most wasteful. A single faucet dripping once per second wastes over 3,000 gallons of water per year. The good news: most faucet leaks are straightforward to fix with basic tools and about 30 minutes of your time.</p>

<h2>Step 1: Identify Your Faucet Type</h2>
<p>Before you start, identify which type of faucet you have:</p>
<ul>
  <li><strong>Ball faucet</strong> — single handle that rotates over a rounded ball-shaped cap</li>
  <li><strong>Cartridge faucet</strong> — single or double handle with a cartridge inside</li>
  <li><strong>Compression faucet</strong> — older two-handle type, tightens to stop flow</li>
  <li><strong>Ceramic disc faucet</strong> — wide cylindrical body with a single lever</li>
</ul>
<p>The repair method differs for each type, so knowing what you have determines what parts you need.</p>

<h2>Step 2: Turn Off the Water Supply</h2>
<p>Locate the shut-off valves under the sink and turn them clockwise until closed. Then open the faucet to release any remaining pressure and water in the line. Place a towel under the sink to catch drips.</p>

<h2>Step 3: Disassemble the Faucet Handle</h2>
<p>Remove the decorative cap on the handle (usually pops off with a flathead screwdriver), then unscrew the handle screw and pull off the handle. What you see next depends on your faucet type:</p>
<ul>
  <li><strong>Cartridge faucets:</strong> Pull out the cartridge and take it to a hardware store for an exact match.</li>
  <li><strong>Compression faucets:</strong> Unscrew the packing nut and remove the stem. Replace the rubber washer at the bottom.</li>
  <li><strong>Ball faucets:</strong> Use a ball-faucet repair kit — they include all the small parts (springs, seats, O-rings).</li>
  <li><strong>Ceramic disc faucets:</strong> Remove the cylinder and clean sediment off the discs with distilled white vinegar.</li>
</ul>

<h2>Step 4: Replace Worn Parts</h2>
<p>Most faucet leaks are caused by worn O-rings, rubber washers, or a degraded cartridge. These parts cost $1–$15 at any hardware store. Bring the old part with you to ensure an exact match. Coat new O-rings and washers lightly with plumber's grease before installing.</p>

<h2>Step 5: Reassemble and Test</h2>
<p>Reassemble in reverse order — cartridge or stem first, then packing nut, then handle. Tighten firmly but don't overtighten. Turn the shut-off valves back on slowly and test for leaks. Check both the spout and around the base of the handle.</p>

<h2>When to Call a Plumber</h2>
<p>If you notice corrosion on the valve seat, cracks in the faucet body, or the leak persists after replacing parts, it's time to call a licensed plumber. A corroded valve seat or damaged faucet body usually means the fixture needs to be replaced entirely — a job best left to a professional who can also check for related issues under the sink.</p>

<div class="blog-tip"><strong>Pro Tip:</strong> Take photos at each disassembly step on your phone. When you're putting it back together 20 minutes later, you'll be glad you did.</div>`,
  },

  {
    title: "Signs You Need to Repipe Your Home (And What It Costs)",
    excerpt: "Aging pipes can cause low water pressure, discolored water, and constant leaks. Find out the warning signs that your home needs repiping and what to expect from the process.",
    tags: ["Repiping", "Home Maintenance", "Pipe Repair"],
    readTime: 9,
    publishedAt: new Date("2025-12-18"),
    content: `<p>Most homeowners don't think about their pipes until something goes wrong. But pipes have a lifespan — and when they start to fail, the problems compound quickly. Knowing the warning signs can save you from major water damage and help you budget for one of the larger plumbing investments a homeowner faces.</p>

<h2>Common Warning Signs</h2>

<h3>1. Discolored Water</h3>
<p>If your water runs brown, orange, or red — especially after the water hasn't been used for several hours — that's rust from the inside of galvanized steel pipes. Galvanized pipes were standard in homes built before 1960 and have a lifespan of 40–70 years. Rust is not just an aesthetic problem; it means the pipe walls are deteriorating from the inside out.</p>

<h3>2. Low Water Pressure Throughout the House</h3>
<p>A single low-pressure fixture might have a clogged aerator. But if pressure is low at every tap, shower, and toilet simultaneously, it usually indicates significant buildup (scale) inside the pipes restricting flow — or corrosion that has reduced the pipe's interior diameter.</p>

<h3>3. Frequent Leaks in Multiple Locations</h3>
<p>One pipe leak is a repair. Three in different parts of the house over a couple of years is a pattern — and a sign that the system as a whole is failing. At some point, patching individual leaks becomes more expensive than repiping.</p>

<h3>4. Visible Corrosion or Mineral Buildup</h3>
<p>Inspect any exposed pipes under sinks, in the basement, or in the crawlspace. Bluish-green stains on copper pipes indicate corrosion. Flaking, dimpling, or discoloration on galvanized steel means rust is actively progressing.</p>

<h3>5. Bad-Tasting or Foul-Smelling Water</h3>
<p>Metallic taste or smell can come from copper or galvanized pipes degrading into your water supply. This is both a quality and health concern.</p>

<h2>What Are Pipes Replaced With?</h2>
<p>The three most common materials used for repiping:</p>
<ul>
  <li><strong>Copper</strong> — The gold standard. Durable (50–70 year lifespan), resistant to bacteria, handles high pressure and temperature. More expensive to install.</li>
  <li><strong>PEX (cross-linked polyethylene)</strong> — Flexible, faster to install, freeze-resistant, and significantly cheaper than copper. Most plumbers' first choice for whole-house repiping today.</li>
  <li><strong>CPVC</strong> — Rigid plastic, cheaper than copper but less flexible than PEX. Good for hot and cold supply lines.</li>
</ul>

<h2>What Does Repiping Cost?</h2>
<p>Cost depends on home size, pipe material, and local labor rates:</p>
<ul>
  <li><strong>Small home (under 1,500 sq ft):</strong> $3,000–$6,000</li>
  <li><strong>Medium home (1,500–2,500 sq ft):</strong> $6,000–$12,000</li>
  <li><strong>Large home (2,500+ sq ft):</strong> $10,000–$20,000+</li>
</ul>
<p>PEX repiping is typically 25–40% less expensive than copper for the same home size. Most jobs take 2–5 days and require drywall patching after the pipes are run.</p>

<h2>Can You Stay Home During Repiping?</h2>
<p>Yes, but water will be off for most of each workday. Many homeowners plan ahead with a hotel stay or visit family for the main days. The plumber will typically restore water each evening so you can shower and use facilities overnight.</p>

<div class="blog-tip"><strong>Get at least 3 quotes.</strong> Repiping is a significant project and prices vary widely. Ask each plumber what material they'll use, how they handle drywall, and whether the quote includes permits — most municipalities require a permit for whole-house repiping.</div>`,
  },

  {
    title: "How to Unclog a Drain Without Chemicals",
    excerpt: "Chemical drain cleaners damage pipes and harm the environment. Here are 5 effective methods to clear blocked drains using tools you already own.",
    tags: ["Drain Cleaning", "DIY", "Eco-Friendly"],
    readTime: 6,
    publishedAt: new Date("2026-01-05"),
    content: `<p>When a drain slows or stops, the instinct is to reach for a bottle of Drano. But chemical drain cleaners are corrosive to pipes (especially older PVC and rubber seals), harmful if they contact your skin or eyes, and damaging to the beneficial bacteria in your septic system if you have one. The good news: most household clogs clear with mechanical methods that work just as well — and cost almost nothing.</p>

<h2>1. Boiling Water (For Kitchen Sinks)</h2>
<p>For kitchen sinks clogged with grease or soap buildup, simply boiling water can dissolve the blockage. Bring a full kettle to a boil and pour it directly down the drain in three or four stages, allowing it to work for a few seconds between each pour.</p>
<p><strong>Works for:</strong> Grease, soap scum, and minor buildup<br>
<strong>Not for:</strong> PVC pipes (heat can soften joints) or hair clogs</p>

<h2>2. Baking Soda + Vinegar</h2>
<p>This classic combination creates a fizzing reaction that can break up soft organic clogs. Pour half a cup of baking soda down the drain first, followed immediately by half a cup of white vinegar. Cover the drain with a plug or rag to direct the reaction downward, wait 20–30 minutes, then flush with hot water.</p>
<p>This method works best on partial clogs and regular maintenance — it's less effective on a fully blocked drain.</p>

<h2>3. Plunger (The Right Way)</h2>
<p>Most people don't use a plunger correctly. For sinks, use a cup plunger (the flat-bottomed type). Fill the sink with enough water to cover the plunger cup, press it firmly over the drain to create a seal, and push and pull rapidly 15–20 times without breaking the seal. Then pull it off sharply to create a suction burst.</p>
<p>For toilets, use a flange plunger (the one with the extended rubber flap). Insert the flap into the drain opening and plunge the same way.</p>

<h2>4. Drain Snake (Hand Auger)</h2>
<p>A drain snake — also called a hand auger — is a coiled metal cable with a corkscrew tip. Feed it into the drain, rotating the handle clockwise as you push it through the pipe. When you feel resistance, crank to hook the clog, then pull it out. Available at any hardware store for $25–$50, and it will last for years.</p>
<p>A drain snake works on most clogs that a plunger can't reach — hair in shower drains, roots in main lines (with a motorized version), and anything lodged in the trap.</p>

<h2>5. Remove and Clean the P-Trap</h2>
<p>The P-trap is the curved pipe segment under your sink — it's designed to hold water and block sewer gases, but it's also where most sink clogs accumulate. Place a bucket under the trap, unscrew the two slip-joint nuts by hand (or with pliers), and remove the trap. Clean it out, then reinstall. No tools beyond a bucket and maybe pliers.</p>

<h2>When to Call a Plumber</h2>
<p>If multiple drains are slow at the same time, the problem is in the main sewer line — not an individual fixture. A plunger won't fix a main line clog. Plumbers use motorized augers and hydro-jetting equipment to clear main line blockages. Multiple slow drains, sewage odors, or water backing up into tubs when you flush the toilet are all signs to call a professional.</p>

<div class="blog-tip"><strong>Prevention tip:</strong> Pour a kettle of hot water down your kitchen drain once a week to dissolve grease before it builds up. Use a hair catcher in shower drains and empty it after every shower.</div>`,
  },

  {
    title: "Tankless vs. Tank Water Heaters: Which Is Right for Your Home?",
    excerpt: "Tankless heaters cost more upfront but save on energy. Tank heaters are cheaper but waste standby energy. Here's how to decide which makes sense for your household.",
    tags: ["Water Heater", "Energy Saving", "Home Improvement"],
    readTime: 8,
    publishedAt: new Date("2026-01-14"),
    content: `<p>When your water heater fails — usually dramatically, with a puddle on the floor — you suddenly need to make a purchasing decision you're not prepared for. Choosing between a traditional tank water heater and a tankless (on-demand) unit involves trade-offs in upfront cost, energy efficiency, hot water supply, and installation complexity. Here's what you need to know.</p>

<h2>How Each Type Works</h2>

<h3>Tank Water Heaters</h3>
<p>A storage tank heater keeps 30–80 gallons of water hot at all times, ready for use. It cycles on and off throughout the day to maintain temperature — even when you're at work or sleeping. This "standby heat loss" accounts for 10–20% of a home's water heating energy use.</p>

<h3>Tankless Water Heaters</h3>
<p>Tankless units heat water only when a hot tap is opened. Cold water flows through a heat exchanger (powered by gas or electricity) and delivers hot water within seconds. No storage tank means no standby heat loss — and no "running out" of hot water.</p>

<h2>Upfront Cost</h2>
<ul>
  <li><strong>Tank heater:</strong> $500–$1,200 installed</li>
  <li><strong>Tankless gas:</strong> $1,500–$3,500 installed</li>
  <li><strong>Tankless electric:</strong> $800–$2,000 installed (but may require electrical panel upgrade)</li>
</ul>
<p>Tankless units typically cost 2–3x more to purchase and install than tank heaters. Gas tankless units often require larger gas lines and new venting — adding to the install cost.</p>

<h2>Operating Cost and Efficiency</h2>
<p>Tankless units are 24–34% more energy-efficient than tank heaters for homes that use less than 41 gallons per day. For high-use households (over 86 gallons/day), efficiency gains narrow to 8–14%.</p>
<p>At average US energy rates, a gas tankless unit can save $100–$200 per year over a traditional gas tank heater. At that rate, breakeven on the higher upfront cost is 8–12 years.</p>

<h2>Hot Water Supply</h2>
<ul>
  <li><strong>Tank heaters</strong> can run out. A 40-gallon tank will serve about 2 back-to-back showers (10 minutes each) before running cold. Adding laundry or a dishwasher while showering can exhaust supply faster.</li>
  <li><strong>Tankless heaters</strong> never run out — but have a flow rate limit. A typical whole-house gas unit delivers 5–8 gallons per minute. Running two showers and a dishwasher simultaneously can exceed this capacity. Installing two units in parallel solves this in large homes.</li>
</ul>

<h2>Lifespan</h2>
<ul>
  <li><strong>Tank water heaters:</strong> 8–12 years</li>
  <li><strong>Tankless water heaters:</strong> 20+ years</li>
</ul>
<p>The longer lifespan is part of why tankless makes financial sense over time despite the higher initial cost.</p>

<h2>Which Should You Choose?</h2>
<table class="blog-table">
  <tr><th>Go tankless if...</th><th>Stick with a tank if...</th></tr>
  <tr><td>You plan to stay in the home 10+ years</td><td>You're selling the house soon</td></tr>
  <tr><td>Your current tank just failed and you have time to plan</td><td>You need hot water today at minimum cost</td></tr>
  <tr><td>Energy savings and efficiency matter to you</td><td>Your gas line or electrical panel would need upgrading</td></tr>
  <tr><td>You have a large family with high hot water demand</td><td>Low hot water usage (1–2 person household)</td></tr>
</table>

<div class="blog-tip"><strong>Ask your plumber about heat pump water heaters</strong> — they're a third option that's 2–3x more efficient than standard electric tank heaters. They pull heat from the surrounding air, making them ideal in warmer climates or spaces like garages and basements.</div>`,
  },

  {
    title: "What to Do When a Pipe Bursts: Emergency Steps to Limit Damage",
    excerpt: "A burst pipe can dump hundreds of gallons into your home in minutes. Acting fast in the first five minutes makes the difference between a simple repair and a $30,000 renovation.",
    tags: ["Emergency", "Pipe Repair", "Water Damage"],
    readTime: 5,
    publishedAt: new Date("2026-01-22"),
    content: `<p>A burst pipe is one of the most urgent plumbing emergencies a homeowner can face. Water pressure means even a small crack can discharge hundreds of gallons into walls, ceilings, and floors in a short amount of time. Here's exactly what to do — in order — when it happens.</p>

<h2>Step 1: Turn Off the Main Water Supply (Immediately)</h2>
<p>Find your main shut-off valve and turn it off. In most homes, this is located:</p>
<ul>
  <li>Where the main supply line enters the house (basement, crawlspace, or utility room)</li>
  <li>Near the water meter (sometimes outside, in a meter box)</li>
  <li>In the garage or near the water heater</li>
</ul>
<p><strong>Every adult in your household should know where this valve is before an emergency happens.</strong> The valve is usually a gate valve (turn clockwise to close) or a ball valve (turn the lever 90° until perpendicular to the pipe).</p>

<h2>Step 2: Turn Off the Water Heater</h2>
<p>Once the main supply is off, turn off your water heater to prevent damage. For gas heaters, turn the thermostat to "pilot." For electric heaters, switch off the circuit breaker. Running a water heater without water flowing through it can damage the heating element.</p>

<h2>Step 3: Open Cold Taps to Drain the System</h2>
<p>Open cold water taps at the highest and lowest points in the house. This drains remaining water from the pipes and reduces pressure at the burst location, slowing the flow of water into your home.</p>

<h2>Step 4: Contain and Document the Damage</h2>
<p>Use buckets, towels, and mops to contain water that's already in your home. Move furniture, electronics, and valuables out of the affected area immediately. Take photos and video of all water damage <em>before</em> you clean anything — your insurance company will require documentation.</p>

<h2>Step 5: Call a Plumber</h2>
<p>Call a licensed emergency plumber. Most plumbing companies offer 24/7 emergency service. Be specific about what you're seeing: the location (which room, inside wall vs. exposed), whether water is still flowing, and how much water has accumulated. This helps them come prepared with the right parts and equipment.</p>

<h2>Step 6: Start Drying Immediately</h2>
<p>If water sat in walls or under flooring for more than 24–48 hours, mold can begin to grow. Open windows, run dehumidifiers and fans, and if the water penetrated drywall or insulation, it likely needs to be removed. Many areas have water damage restoration companies that can deploy commercial drying equipment within hours.</p>

<h2>Why Pipes Burst</h2>
<p>The most common causes:</p>
<ul>
  <li><strong>Freezing</strong> — water expands when frozen, creating enough pressure to split pipes</li>
  <li><strong>Corrosion</strong> — older galvanized steel pipes corrode from inside out</li>
  <li><strong>High water pressure</strong> — pressure above 80 PSI stresses pipe joints</li>
  <li><strong>Physical damage</strong> — accidental puncture during renovations</li>
  <li><strong>Tree root intrusion</strong> — roots infiltrate and crack underground supply lines</li>
</ul>

<div class="blog-tip"><strong>Prevention:</strong> Keep your home above 55°F even when away in winter. Open cabinet doors under sinks on exterior walls during cold snaps to let warm air circulate. Have a plumber install a pressure regulator if your home water pressure exceeds 80 PSI.</div>`,
  },

  {
    title: "How to Read Your Water Bill and Spot a Hidden Leak",
    excerpt: "A hidden leak can add hundreds of dollars to your water bill without any visible dripping. Learn how to use your water meter and bill to detect leaks early.",
    tags: ["Leak Detection", "Water Saving", "Home Maintenance"],
    readTime: 6,
    publishedAt: new Date("2026-02-03"),
    content: `<p>Americans spend an average of $1,000 per year on water bills, but the EPA estimates that household leaks account for nearly 10,000 gallons of wasted water per year in a typical home — and 10% of homes leak more than 90 gallons per day. The tricky part: many leaks are hidden inside walls, under slabs, or in outdoor irrigation lines, with no visible drips.</p>

<h2>Understanding Your Water Bill</h2>
<p>Most water utilities bill in units of CCF (hundred cubic feet) or gallons. One CCF equals 748 gallons. The EPA's WaterSense program reports that average indoor water use is 80–100 gallons per person per day, meaning a family of four should use roughly 10,000–12,000 gallons per month.</p>
<p>If your bill consistently shows usage well above that, or if it spikes unexpectedly from one month to the next, suspect a leak.</p>

<h2>The Meter Test (15-Minute Check)</h2>
<p>This test tells you definitively whether water is leaking somewhere in your system:</p>
<ol>
  <li>Make sure no water is running anywhere in or outside your home (no dishwasher, washing machine, sprinklers, or open taps)</li>
  <li>Locate your water meter (usually in a box near the street, or at the side of your house)</li>
  <li>Record the current reading exactly — most digital meters show a flow indicator (a small triangle or dial) that spins when water is moving</li>
  <li>Wait 15 minutes without using any water</li>
  <li>Check the meter again — if the reading has changed, water is moving through your system when it shouldn't be</li>
</ol>
<p>If the flow indicator is spinning when all taps are off, you have a leak.</p>

<h2>Locating the Leak</h2>

<h3>Toilets — Most Common Hidden Leak</h3>
<p>Toilets account for nearly 30% of household water use and are responsible for a large percentage of hidden leaks. Add a few drops of food coloring to the tank (not the bowl). Wait 15 minutes without flushing. If color appears in the bowl, the flapper is leaking. A worn flapper costs $5–$10 to replace.</p>

<h3>Irrigation and Outdoor Faucets</h3>
<p>Shut off the main house supply valve and repeat the meter test. If the meter still moves, the leak is between the meter and the house — often a crack in the supply line underground or a leaking irrigation valve.</p>

<h3>Under-Slab Leaks</h3>
<p>If you notice warm spots on the floor, the sound of running water when all taps are off, or cracks appearing in your foundation, you may have a slab leak — a pipe failure beneath your concrete slab. These require professional leak detection using acoustic equipment and are not DIY repairs.</p>

<h2>When to Call a Plumber</h2>
<p>If the meter test confirms a leak but you can't find the source, call a plumber who offers leak detection services. Professional plumbers use acoustic sensors, thermal imaging cameras, and tracer gas to locate hidden leaks without unnecessary excavation. Catching a slab leak early can mean the difference between a $1,500 repair and $10,000 in foundation damage.</p>

<div class="blog-tip"><strong>Free tool:</strong> Many water utilities offer free leak detection devices or will audit your home's water use at no charge. Check your utility's website before paying out of pocket for basic leak investigation.</div>`,
  },

  {
    title: "Sewer Line Problems: Warning Signs and What to Expect from Repairs",
    excerpt: "A failing sewer line is every homeowner's nightmare. Learn to recognize the early signs and understand your repair options — from traditional excavation to trenchless pipe lining.",
    tags: ["Sewer Line", "Pipe Repair", "Home Maintenance"],
    readTime: 10,
    publishedAt: new Date("2026-02-11"),
    content: `<p>Your home's sewer line carries all wastewater from every toilet, sink, shower, and appliance to the municipal sewer main or your septic tank. It runs underground from your home to the street, and most homeowners never think about it — until it fails. By the time obvious symptoms appear, the problem has usually been developing for months or years.</p>

<h2>Warning Signs of a Sewer Line Problem</h2>

<h3>Multiple Drains Slow or Backing Up</h3>
<p>A single slow drain is a localized clog — usually hair in the trap or grease in the P-trap. When multiple drains in the house are slow simultaneously, or when flushing the toilet causes water to gurgle up in the bathtub, the blockage is downstream in the main sewer line.</p>

<h3>Sewage Odor in or Around the Home</h3>
<p>You should never smell sewer gas inside your home. A healthy sewer line and properly maintained drain traps form a sealed system. Persistent sewage odor indoors or in the yard near the sewer line's path suggests a crack or break in the pipe.</p>

<h3>Wet or Unusually Lush Patches in the Yard</h3>
<p>If your lawn has an area that stays wet when it hasn't rained, or a patch that's noticeably greener and more lush than the surrounding grass, you may have a sewer line leak underground. Sewage acts as fertilizer, which is why the vegetation above a leaking sewer line often thrives while the surrounding area looks normal.</p>

<h3>Foundation Cracks or Sinkholes</h3>
<p>Chronic sewer leaks saturate the soil around the pipe. Over time, this can erode the ground beneath your foundation or driveway, causing settling, cracking, or small sinkholes. This is a late-stage sign indicating significant and long-running leakage.</p>

<h3>Rodent or Insect Activity</h3>
<p>Rats and cockroaches can travel through sewer lines and enter homes through cracks in the pipe. If you're seeing unexplained rodent or roach activity with no obvious entry points, have your sewer line inspected.</p>

<h2>What Causes Sewer Line Failures?</h2>
<ul>
  <li><strong>Tree root intrusion</strong> — roots seek moisture and can infiltrate joints, causing blockages and eventually breaking the pipe entirely</li>
  <li><strong>Pipe age and material</strong> — clay and cast iron pipes installed before 1980 have finite lifespans; Orangeburg pipe (a tar-fiber product common 1940s–1970s) is notorious for collapsing</li>
  <li><strong>Ground movement</strong> — soil settling, earthquakes, or heavy traffic can shift or crack buried pipes</li>
  <li><strong>Grease buildup</strong> — accumulated cooking grease hardens in sewer lines and attracts roots</li>
  <li><strong>Flushing non-flushables</strong> — "flushable" wipes, paper towels, and hygiene products don't dissolve and create blockages</li>
</ul>

<h2>Diagnosis: Sewer Camera Inspection</h2>
<p>A plumber will insert a waterproof camera into your sewer line to inspect its condition. This reveals the exact location, type, and extent of any damage. Cost: $150–$350 for a residential inspection. Before any repair, insist on seeing the camera footage — it determines which repair method is appropriate and gives you a baseline record of your pipe's condition.</p>

<h2>Repair Options</h2>

<h3>Traditional Excavation</h3>
<p>The old-school method: dig a trench to expose the pipe, remove and replace the damaged section. Effective and sometimes unavoidable for severe collapses. Disrupts landscaping, driveways, and sometimes requires permits. Cost: $3,000–$10,000 depending on depth, length, and what's above the pipe.</p>

<h3>Trenchless Pipe Lining (CIPP)</h3>
<p>Cured-in-place pipe lining involves inserting a flexible resin-coated liner into the damaged pipe and inflating it. When the resin cures, it creates a new pipe inside the old one. No excavation needed — typically only two small access holes. The finished pipe is slightly narrower than the original but fully functional and resistant to root re-intrusion. Cost: $3,500–$13,000. Lifespan: 50+ years.</p>

<h3>Pipe Bursting</h3>
<p>A steel bursting head is pulled through the old pipe, shattering it outward while simultaneously pulling a new pipe in behind it. This replaces the pipe without excavation and maintains the same or larger interior diameter. Cost: $4,000–$12,000.</p>

<h2>Homeowner Responsibility</h2>
<p>In most municipalities, you own and are responsible for the sewer line from your home to the property line (or all the way to the municipal main, depending on local rules). Check with your utility to confirm. Sewer line insurance riders are available from some utilities and insurance companies for $5–$15/month — worth considering if your home has older pipes or mature trees near the sewer line's path.</p>

<div class="blog-tip"><strong>Never pour grease down the drain.</strong> Let it solidify in a container and dispose of it in the trash. This is the single most impactful thing homeowners can do to extend sewer line life.</div>`,
  },

  {
    title: "Water Pressure Problems: Too High or Too Low — Causes and Fixes",
    excerpt: "Low water pressure makes showering miserable. High pressure damages pipes and appliances. Learn what causes both and how to fix them.",
    tags: ["Pipe Repair", "Home Maintenance", "DIY"],
    readTime: 7,
    publishedAt: new Date("2026-02-20"),
    content: `<p>Water pressure affects every plumbing fixture in your home — how well your shower rinses shampoo, how fast your dishwasher fills, how quickly your toilet tank refills. Ideal residential water pressure is between 45–80 PSI (pounds per square inch). Outside that range — too low or too high — creates problems ranging from inconvenience to serious pipe and appliance damage.</p>

<h2>Low Water Pressure</h2>

<h3>Causes</h3>
<ul>
  <li><strong>Clogged aerators or showerheads</strong> — mineral deposits from hard water clog the small screens in aerators and showerhead nozzles, dramatically reducing flow from those fixtures</li>
  <li><strong>Partially closed shut-off valves</strong> — the main shut-off or fixture-specific valves may not be fully open after a repair</li>
  <li><strong>Pipe corrosion and buildup</strong> — galvanized steel pipes accumulate internal scale that narrows the water pathway over decades</li>
  <li><strong>Municipal pressure issue</strong> — if your neighbors also notice low pressure, the problem is with the utility, not your home</li>
  <li><strong>Slab or underground leak</strong> — water escaping through a pipe crack reduces pressure throughout the house</li>
  <li><strong>Pressure regulator failure</strong> — a faulty pressure reducing valve (PRV) may be set too low or failing</li>
</ul>

<h3>Fixes</h3>
<p><strong>Cleaning aerators:</strong> Unscrew the aerator from the faucet tip (hand-tight, lefty-loosey). Soak in white vinegar for 30 minutes, scrub with an old toothbrush, and reinstall. Do the same for showerheads — fill a plastic bag with vinegar and rubber-band it over the showerhead overnight.</p>
<p><strong>Adjusting the PRV:</strong> Your pressure reducing valve is usually located where the main supply enters the house, near the main shut-off. It has a screw on top — tightening it increases pressure, loosening decreases it. Check pressure at a hose bib with a pressure gauge ($10–$15 at any hardware store) before and after adjusting.</p>
<p><strong>Replacing the PRV:</strong> If adjusting doesn't help, the PRV itself may need replacement. This is a plumber's job — a new PRV costs $50–$120 in parts; installation runs $100–$350 including labor.</p>

<h2>High Water Pressure</h2>
<p>High pressure feels great in the shower but silently damages your home. Chronic high pressure stresses pipe joints and fittings, causes water hammer (the banging noise when you shut off a tap quickly), reduces the lifespan of washing machine hoses, dishwashers, and water heaters, and can cause dripping faucets by forcing water past worn valve seats.</p>

<h3>What's Normal vs. High</h3>
<ul>
  <li>45–80 PSI: Normal residential range</li>
  <li>80–100 PSI: High — install a pressure regulator</li>
  <li>100+ PSI: Dangerously high — immediate plumber attention</li>
</ul>

<h3>Testing Your Pressure</h3>
<p>Attach a pressure gauge to any outdoor hose bib or washing machine connection. Take the reading in the morning before significant water use. If it's above 80 PSI, you need a pressure reducing valve (PRV) or an adjustment of the existing one.</p>

<h3>Expansion Tanks</h3>
<p>If your home has a closed water supply system (backflow preventers mean water has no way to expand back toward the street), thermal expansion when your water heater heats water can cause pressure spikes. An expansion tank — a small tank installed on the cold water inlet to the water heater — absorbs this expansion. Many plumbing codes now require them. If your water heater is dripping from the pressure relief valve, a failing expansion tank is often the cause.</p>

<div class="blog-tip"><strong>Buy a pressure gauge.</strong> They cost $10–$15 and let you check your own water pressure in 5 minutes. It's the first diagnostic step for almost any pressure complaint — high or low — and tells you immediately whether the problem is in your home or with the utility.</div>`,
  },

  {
    title: "Gas Line Safety: What Every Homeowner Needs to Know",
    excerpt: "Natural gas is safe when handled correctly, but gas line leaks can be deadly. Learn the warning signs of a gas leak and which repairs must always be done by a licensed professional.",
    tags: ["Gas Line", "Safety", "Home Maintenance"],
    readTime: 6,
    publishedAt: new Date("2026-03-02"),
    content: `<p>Natural gas powers millions of American homes — furnaces, water heaters, stoves, dryers, and fireplaces. It's efficient, reliable, and generally very safe. But when gas lines fail, the consequences can be severe. Understanding the warning signs and knowing which work is DIY-appropriate (almost none of it) can keep your household safe.</p>

<h2>Signs of a Gas Leak</h2>

<h3>The Smell</h3>
<p>Natural gas is odorless, but gas companies add a chemical called mercaptan that produces a distinctive rotten-egg or sulfur smell. This is intentional — your nose is the most reliable gas leak detector in your home. Never ignore this smell.</p>

<h3>Physical Symptoms</h3>
<p>Mild carbon monoxide or gas exposure can cause headaches, dizziness, nausea, or eye/nose/throat irritation — especially when multiple family members experience symptoms simultaneously in the home and feel better when outside.</p>

<h3>Dead Vegetation</h3>
<p>Underground gas line leaks can kill grass and plants in a specific area of your yard. A patch of dead vegetation in an otherwise healthy lawn, especially in a line-shaped area, may indicate a buried gas leak.</p>

<h3>Hissing Sound</h3>
<p>A hissing or whistling sound near a gas appliance, meter, or pipe may indicate gas escaping under pressure. This is a serious, immediate-action sign.</p>

<h2>What to Do If You Smell Gas</h2>
<ol>
  <li><strong>Don't operate any switches, lights, or appliances</strong> — a small electrical spark can ignite gas</li>
  <li><strong>Don't use your phone indoors</strong> — take it outside first</li>
  <li><strong>Leave immediately</strong> — leave the door open behind you, don't stop to collect belongings</li>
  <li><strong>From outside, call your gas company's emergency line</strong> (it's on your bill) or call 911</li>
  <li><strong>Don't re-enter the building</strong> until cleared by the gas company or fire department</li>
</ol>

<h2>What Work Requires a Licensed Plumber or Gas Fitter</h2>
<p>In most US states and municipalities, any work that involves gas lines beyond the appliance connection requires a licensed plumber or gas fitter. This includes:</p>
<ul>
  <li>Installing or extending gas lines</li>
  <li>Adding new gas appliance connections</li>
  <li>Replacing gas meters or regulators</li>
  <li>Repairing or replacing gas valves</li>
  <li>Converting appliances between gas types (natural gas vs. propane)</li>
</ul>
<p>Fines for unpermitted gas work can be substantial, and homeowner's insurance may not cover claims resulting from unpermitted gas line modifications.</p>

<h2>What a Homeowner CAN Do</h2>
<p>You're generally allowed to replace the flexible gas connector that connects a gas appliance (stove, dryer, water heater) to the rigid pipe stub-out. Use only AGA-certified flexible connectors and replace them every 5–10 years — they're not meant to last the life of the appliance. Never use a connector that has been kinked, stretched, or has visible corrosion.</p>
<p>You can also turn the gas shut-off valve at an individual appliance — it's the quarter-turn valve on the gas line just behind or below the appliance. This does not require a permit or professional and is appropriate to do in an emergency.</p>

<h2>Annual Inspection</h2>
<p>Have a licensed plumber or your gas utility inspect your gas lines and appliances every few years — annually if your home is older or you've done renovations near gas lines. Many utilities offer free inspections. Carbon monoxide detectors are a non-negotiable safety device in any home with gas appliances — install one on each level and replace batteries annually.</p>

<div class="blog-tip"><strong>Know where your gas meter shut-off is.</strong> It's on the meter outside your home. Closing it requires a gas meter wrench (a flat wrench that fits the valve) — keep one accessible in your emergency kit. Once you shut off the meter, only the gas company can restore service.</div>`,
  },

  {
    title: "How to Winterize Your Plumbing and Prevent Frozen Pipes",
    excerpt: "Frozen pipes are one of the most common and costly winter home emergencies. A few hours of preparation in autumn can prevent thousands of dollars in water damage.",
    tags: ["Pipe Repair", "Emergency", "Home Maintenance"],
    readTime: 7,
    publishedAt: new Date("2026-03-10"),
    content: `<p>When water freezes, it expands. Trapped in a closed pipe, that expansion creates pressure strong enough to split copper, crack PVC, and blow out pipe joints. The result: a burst pipe that can release hundreds of gallons of water into your walls, floors, and ceilings. The Insurance Institute reports that frozen pipe bursts are one of the most common and costly homeowner insurance claims, averaging $15,000 per incident.</p>
<p>The good news: with a few hours of autumn preparation, frozen pipes are almost entirely preventable.</p>

<h2>Which Pipes Are at Risk?</h2>
<p>Pipes most vulnerable to freezing are those with minimal insulation and exposure to cold air:</p>
<ul>
  <li>Pipes in unheated spaces: garages, crawlspaces, attics, unfinished basements</li>
  <li>Pipes running through exterior walls</li>
  <li>Outdoor hose bibs and irrigation supply lines</li>
  <li>Pipes in kitchen or bathroom cabinets on exterior walls</li>
</ul>

<h2>Step 1: Disconnect and Drain Outdoor Hoses</h2>
<p>Before the first freeze, disconnect all garden hoses from outdoor faucets and drain them. Water left in a connected hose can freeze back into the faucet and pipe indoors. Store hoses in a garage or shed for winter.</p>

<h2>Step 2: Shut Off and Drain Outdoor Faucets</h2>
<p>Most modern homes have frost-free (anti-siphon) hose bibs that drain automatically when the water is off — but they only work if the hose is disconnected. For older standard hose bibs, locate the interior shut-off valve (usually in the basement or utility room) and turn it off. Then open the outdoor faucet to drain remaining water from the pipe.</p>

<h2>Step 3: Drain Irrigation Systems</h2>
<p>If you have in-ground irrigation, blow out the system with compressed air (or hire a landscaper) before freezing temperatures arrive. Even a small amount of water trapped in irrigation lines can crack the pipes or heads. Turn off the irrigation system's water supply and shut off the controller.</p>

<h2>Step 4: Insulate Vulnerable Pipes</h2>
<p>Foam pipe insulation (pipe wrap) is inexpensive — $0.50–$1.50 per foot — and easy to install. Cut to length, slit lengthwise, and wrap around pipes in unheated spaces. Pay special attention to pipes in crawlspaces, attics, and garages. For extreme cold, use electric heat tape under the insulation on the most exposed runs.</p>

<h2>Step 5: Seal Air Leaks Near Pipes</h2>
<p>Cold air drafts around pipes — through gaps in the sill plate, around penetrations where pipes pass through exterior walls, or through foundation cracks — accelerate freezing. Use spray foam insulation or caulk to seal any openings where cold air can reach interior pipes.</p>

<h2>During Cold Snaps</h2>
<ul>
  <li>Keep your home heated to at least 55°F even when away or traveling</li>
  <li>Open cabinet doors under sinks on exterior walls to allow warm air to circulate</li>
  <li>Let cold water drip from faucets served by exposed pipes — moving water is significantly harder to freeze</li>
  <li>If you're away for an extended period, have someone check the house regularly or install a smart thermostat with freeze protection alerts</li>
</ul>

<h2>If a Pipe Does Freeze</h2>
<p>If a faucet stops producing water in freezing weather, you likely have a frozen pipe. Do NOT use an open flame to thaw it — this has started house fires. Use a hair dryer, heating pad, or portable space heater near the pipe. Start from the faucet end and work back toward the supply. Turn on the faucet so water can flow as soon as the ice melts — this releases pressure and confirms water is moving. If you can't locate the frozen section or can't thaw it safely, call a plumber. And be prepared: a pipe that froze has likely been stressed and may have developed a crack that won't be apparent until it thaws.</p>

<div class="blog-tip"><strong>Install a low-temperature alarm</strong> in your crawlspace or any unheated space where pipes run. These battery-powered devices alert you (and can text your phone with a WiFi model) when temperatures drop into the danger zone — typically below 40°F. They cost $20–$60 and can save you from returning home to a flooded house.</div>`,
  },

  {
    title: "Choosing a Plumber: 8 Questions to Ask Before You Hire",
    excerpt: "Not all plumbers are equal. Before handing over your home and your money, ask these eight questions to make sure you're hiring someone qualified, licensed, and fair.",
    tags: ["Home Maintenance", "Hiring Tips"],
    readTime: 6,
    publishedAt: new Date("2026-03-20"),
    content: `<p>Hiring a plumber is different from buying a product. You can't compare spec sheets or read a barcode. You're inviting someone into your home, trusting them to diagnose a problem correctly, recommend the right fix, and complete it properly. The wrong hire leads to repeat trips, unnecessary repairs, and sometimes damage worse than the original problem. These eight questions cut through the ambiguity.</p>

<h2>1. Are You Licensed in This State?</h2>
<p>Plumbing licensing requirements vary by state, but in most US states, plumbers must hold a state-issued license (typically "journeyman" or "master plumber") to legally do plumbing work. Licensing means the plumber has passed examinations and meets minimum competency standards. Ask for the license number and verify it on your state's contractor licensing board website — most have a free online lookup tool.</p>
<p>Unlicensed work may not be insurable, may void your homeowner's insurance coverage, and will likely fail to meet code.</p>

<h2>2. Are You Insured?</h2>
<p>A plumber should carry two types of insurance: general liability (covers damage they cause to your property) and workers' compensation (covers injuries to their employees while working on your property). Ask for a certificate of insurance — not just their assurance that they're covered. A legitimate contractor will provide this without hesitation.</p>

<h2>3. Do You Pull Permits for This Work?</h2>
<p>Many plumbing repairs require permits from your municipality — water heater replacements, sewer line work, new gas lines, and any work involving new fixtures or supply lines typically do. Permits ensure the work is inspected by a third party. Skipping permits saves time but creates problems when you sell your home (unpermitted work surfaces in inspections) and may void warranties. A legitimate plumber knows which work requires permits and includes them in the quote.</p>

<h2>4. Can You Give Me a Written Estimate?</h2>
<p>Get a written quote before any work starts. It should specify what work will be done, what materials will be used, and the total price. Be wary of quotes given verbally over the phone without a site visit — plumbing problems often look different once a plumber is on site, but a professional should be able to give a fair range after seeing the issue and present any changes in writing before proceeding.</p>

<h2>5. What Is Your Diagnostic/Trip Charge?</h2>
<p>Many plumbers charge a diagnostic fee ($50–$150) for coming to assess the problem, which is credited toward the repair if you hire them. Others include it in the repair price. Understand this upfront so you're not surprised. If a plumber charges a trip fee and then gives you a quote that seems unreasonable, you've paid $100 to learn you need a second opinion — but that's still cheaper than an unnecessary repair.</p>

<h2>6. How Do You Charge — Flat Rate or Time and Materials?</h2>
<p>Flat-rate pricing means you know the total cost upfront regardless of how long the job takes. Time-and-materials means you pay for hours plus the cost of parts. Both are legitimate; what matters is that you understand the model. Flat-rate is more predictable; time-and-materials can be cheaper for simple jobs that take less time than expected, but more expensive if complications arise.</p>

<h2>7. What Warranty Do You Offer on Labor and Parts?</h2>
<p>A confident plumber stands behind their work. One-year warranties on labor are common; some offer more. Parts warranties depend on the manufacturer — a good plumber will tell you what the manufacturer covers versus what they cover themselves. If a plumber offers no warranty at all, that's a red flag.</p>

<h2>8. Can You Provide References or Show Recent Reviews?</h2>
<p>Online reviews on Google, Yelp, or the BBB give you an unfiltered view of how a plumber treats customers. Three things to look for: How do they respond to negative reviews (defensively or professionally)? Are the reviews recent? Do the reviews mention specific work similar to what you need done?</p>
<p>For large jobs — sewer replacement, whole-house repiping — ask directly for references you can call. Any established plumber should have satisfied customers willing to speak to their work.</p>

<div class="blog-tip"><strong>Don't choose on price alone.</strong> The cheapest quote sometimes reflects cut corners — no permit, substandard materials, or unlicensed workers. The goal is best value: a fair price from a qualified plumber who will do the work correctly and back it with a warranty.</div>`,
  },

  {
    title: "Toilet Trouble: A Complete Guide to Diagnosing and Fixing Common Problems",
    excerpt: "Toilets are simple machines, but they fail in predictable ways. Running water, weak flush, phantom flush, and rocking base — here's how to diagnose and fix each one.",
    tags: ["Toilet Repair", "DIY", "Home Maintenance"],
    readTime: 8,
    publishedAt: new Date("2026-04-01"),
    content: `<p>The toilet is one of the simplest mechanical devices in your home: open tank, inspect, diagnose, fix. Most toilet problems come down to a handful of parts that cost $5–$30 at any hardware store and install without special tools. Here's a systematic guide to the most common toilet problems.</p>

<h2>Problem 1: Running Toilet</h2>
<p>A running toilet wastes 200 gallons of water per day — about $70/month in a typical US market. You'll hear a constant hissing or trickling from the tank.</p>

<h3>Diagnosis</h3>
<p>Remove the tank lid and observe what's happening. There are two likely causes:</p>
<ol>
  <li><strong>Flapper not sealing:</strong> The rubber flapper at the bottom of the tank isn't closing properly, allowing water to drain from the tank into the bowl continuously. Do the food coloring test: add dye to the tank. If color appears in the bowl without flushing, the flapper is leaking.</li>
  <li><strong>Float set too high:</strong> The water level is above the overflow tube (the tube in the center of the tank that prevents overflow). Water continuously drains down the tube into the bowl. You'll see a slight ripple or flow at the top of the overflow tube.</li>
</ol>

<h3>Fix</h3>
<p><strong>Flapper:</strong> Turn off the water supply valve under the toilet, flush to empty the tank, unclip the flapper chain and pull off the old flapper. Take it to the hardware store for a match. Install the new flapper, reconnect the chain (with about 1/2 inch of slack), turn on the supply, and test.</p>
<p><strong>Float:</strong> Adjust the float arm or float cup (depending on fill valve type) so the water level sits 1 inch below the top of the overflow tube. Most modern fill valves have an adjustment screw or clip on the side.</p>

<h2>Problem 2: Weak or Slow Flush</h2>

<h3>Cause: Clogged Rim Jets</h3>
<p>Under the rim of the toilet bowl are small holes (rim jets) that direct water in a circular pattern during flushing. Mineral deposits from hard water can partially or completely block these jets over time, reducing flush power.</p>

<h3>Fix</h3>
<p>Hold a mirror under the rim to see the jets. Use a piece of wire (a bent coat hanger works) to poke into each hole and dislodge buildup. Then pour a quart of white vinegar into the overflow tube in the tank — this drains to the rim and soaks the jets. Wait 20 minutes and flush repeatedly. For severe buildup, use a commercial lime and calcium remover.</p>

<h3>Cause: Low Water Level in Tank</h3>
<p>If the tank isn't filling to the correct level (marked as a line on the inside of the tank, usually 1 inch below the overflow tube), there isn't enough water for a full flush. Adjust the float as described above.</p>

<h2>Problem 3: Phantom Flush (Toilet "Ghosts")</h2>
<p>The toilet spontaneously refills for a few seconds every 20–30 minutes without anyone flushing. This is almost always a flapper that's slowly leaking — the tank drains gradually until the float drops and triggers a refill cycle. Fix: replace the flapper (see above).</p>

<h2>Problem 4: Toilet Doesn't Flush Completely</h2>
<p>The flapper closes too quickly, not allowing all the tank water to drain into the bowl for a full flush.</p>
<p><strong>Fix:</strong> Lengthen the flapper chain slightly (add another link to the connection point on the flush handle arm). The flapper should stay open until the tank is almost empty. Adjust incrementally until you get a full flush — if the chain is too long, it can get caught under the flapper and cause a running toilet.</p>

<h2>Problem 5: Toilet Rocks or Is Loose at the Base</h2>
<p>A rocking toilet is a serious issue — movement breaks the wax ring seal at the floor, allowing sewer gases and water to leak under the toilet and into the subfloor.</p>

<h3>Fix</h3>
<p>First check the closet bolts (the bolts at the base on each side of the toilet). If they're loose, tighten the nuts. If the toilet still rocks, there may be an uneven floor — plastic toilet shims wedged under the base and trimmed flush can stabilize it. If tightening and shimming don't solve it, the toilet needs to be removed, the wax ring replaced, and the toilet reset — a one-hour plumber job or an ambitious DIY project.</p>

<h2>Problem 6: Toilet Clogs Repeatedly</h2>
<p>A single clog is usually a user error (too much toilet paper, a foreign object). Recurring clogs despite normal use suggest either a partial obstruction in the trap that a plunger hasn't fully cleared, or a venting problem (a blocked vent stack can reduce the siphon effect that pulls waste through the drain).</p>
<p>Use a toilet auger — different from a standard drain snake — designed specifically for toilets with a rubber sleeve that protects the porcelain. If the auger doesn't find an obstruction, call a plumber to inspect the drain and vent stack.</p>

<div class="blog-tip"><strong>Replace the entire fill valve and flapper together</strong> when you're doing any tank repair. Replacement kits cost $15–$25 and include both. If one part has worn out, the other likely isn't far behind, and doing it once saves you from getting back under the tank in six months.</div>`,
  },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected:", MONGO_URI, "\nMode:", DRY_RUN ? "DRY RUN" : "LIVE\n");

  let added = 0;
  for (const article of ARTICLES) {
    if (DRY_RUN) {
      console.log(`[DRY] "${article.title}"`);
      continue;
    }
    try {
      const exists = await Blog.exists({ title: article.title });
      if (exists) { console.log(`  Skip (exists): ${article.title}`); continue; }
      await new Blog({ ...article, status: "published" }).save();
      console.log(`  ✓ ${article.title}`);
      added++;
    } catch (e) {
      console.log(`  ✗ ${article.title} — ${e.message}`);
    }
  }

  console.log(`\nDone. Added: ${added}`);
  await mongoose.disconnect();
}

run().catch(console.error);
