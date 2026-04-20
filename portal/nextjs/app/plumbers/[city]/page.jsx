import { getPublicPosts, imgUrl } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { extractCity } from "@/lib/extractCity";

const SITE = "https://usplumberfinder.com";

export const revalidate = 300;

function citySlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractStateFromAddress(address) {
  if (!address) return "";
  const m = address.match(/,\s*([A-Z]{2})\s*(?:\d{5})?/);
  return m ? m[1] : "";
}

// ── City-specific editorial content (Task 9) ──────────────────────────────
const CITY_CONTENT = {
  "new-york": {
    heading: "Finding a Plumber in New York City",
    body: `NYC plumbing costs run 20–40% above the national average due to high labor rates and the complexity of aging multi-family building systems. Licensed plumbers in New York must hold a Master Plumber license issued by the NYC Department of Buildings — a rigorous credential that separates qualified contractors from unlicensed operators. Verify any plumber's license at nyc.gov/buildings before work begins. For apartment buildings, confirm whether your co-op or building management requires internal approval for plumbing repairs. Emergency plumbers operate 24/7 throughout all five boroughs, with typical response times of 45–90 minutes in Manhattan and the outer boroughs. Always get a written estimate and confirm whether the price includes permits and inspection fees — both are required for gas line work, new fixture installations, and main drain repairs. Older buildings in Brooklyn, Queens, and the Bronx often have galvanized steel supply lines from the 1940s that are overdue for replacement.`,
    faqs: [
      {
        q: "Do I need a permit for plumbing work in New York City?",
        a: "Most plumbing work in NYC requires a permit from the Department of Buildings. This includes water supply lines, drain lines, gas piping, and water heater replacement. Your licensed plumber should pull the permit — if they say a permit isn't needed for significant work, treat that as a red flag.",
      },
      {
        q: "How much does an emergency plumber cost in New York City?",
        a: "Emergency plumbing in NYC typically runs $150–$300/hour depending on the borough and time of call. After-hours and weekend calls command a significant premium. Get a written estimate before work begins — many companies charge a separate diagnostic fee in addition to the repair cost.",
      },
      {
        q: "How do I verify a plumber's license in New York?",
        a: "Verify a plumber's license through the NYC Department of Buildings at nyc.gov/buildings or the NYC Department of Consumer and Worker Protection. A licensed master plumber holds both an individual license and a registered business license with the city.",
      },
    ],
  },
  "los-angeles": {
    heading: "Finding a Plumber in Los Angeles",
    body: `Plumbing costs in Los Angeles reflect California's high labor market — expect to pay $100–$200/hour for licensed work, with major projects like water heater replacement running $1,200–$3,000 installed. California requires all plumbing contractors to hold a C-36 license issued by the California Contractors State License Board (CSLB). Verify any license instantly at cslb.ca.gov. Older neighborhoods like Silver Lake, Echo Park, and Highland Park often have galvanized steel pipes from the 1940s–60s that are past their service life. LA's notoriously hard water (300–400 ppm) accelerates scale buildup in water heaters and pipes, making water softeners a high-return investment. For slab leaks — common in LA's clay-heavy soil that shifts with rainfall — look for plumbers who offer thermal imaging detection before any excavation. Licensed contractors are bonded and insured by law; unlicensed work is not covered by homeowner's insurance.`,
    faqs: [
      {
        q: "How do I verify a plumber's license in Los Angeles?",
        a: "All California plumbing contractors must hold a C-36 license from the CSLB. Verify any license at cslb.ca.gov — enter the company name or license number for instant results. Licensed contractors are bonded and insured by law, meaning you're protected if something goes wrong.",
      },
      {
        q: "What causes slab leaks in Los Angeles?",
        a: "LA's expansive clay soil swells and contracts with seasonal moisture changes, stressing underground supply pipes. Copper pipes also corrode over time in LA's slightly alkaline water. Thermal imaging and acoustic leak detection can locate slab leaks without unnecessary concrete removal — always ask if a plumber offers this before agreeing to excavation.",
      },
      {
        q: "Is hard water a plumbing problem in LA?",
        a: "Yes. Los Angeles water averages 300–400 mg/L hardness — one of the harder water supplies among major US cities. This leaves visible white scale on fixtures, clogs aerators, reduces water heater efficiency, and shortens pipe life. A whole-house water softener or salt-free conditioner significantly extends the life of your plumbing system.",
      },
    ],
  },
  "chicago": {
    heading: "Finding a Plumber in Chicago",
    body: `Chicago's extreme winters — with temperatures regularly falling below 0°F — make frozen and burst pipes one of the most common plumbing emergencies in the region. Properties built before 1940, common in Pilsen, Logan Square, and Hyde Park, often have original galvanized steel pipes or clay sewer lines that have exceeded their useful life. Chicago plumbers must be licensed by the City of Chicago Department of Buildings, and work over $500 typically requires a permit. The city's Combined Sewer System in older neighborhoods means sewage and stormwater share the same lines — during heavy rain, sewer backup into basements is a real risk, making backflow preventer installation strongly recommended. Emergency plumbers in Chicago charge $100–$250/hour, with after-hours rates 50–75% higher. Always confirm the plumber pulls their own permits rather than asking you to manage the process.`,
    faqs: [
      {
        q: "How do I prevent frozen pipes in Chicago?",
        a: "Insulate pipes in unheated spaces — attic, crawlspace, garage. Keep interior temperature above 55°F even when traveling. Open cabinet doors under sinks on exterior walls during cold snaps to allow warm air to circulate. For extended vacations, have someone check the property every 48 hours or install a smart thermostat with freeze alerts.",
      },
      {
        q: "Why does my basement flood after heavy rain in Chicago?",
        a: "Many Chicago neighborhoods use a Combined Sewer System where storm and sanitary sewage share the same pipes. During heavy rain, the system overloads and sewage backs up into basement floor drains. A licensed plumber can install a backflow preventer or overhead sewer system — the most effective long-term solution.",
      },
      {
        q: "Do plumbers in Chicago need to pull permits?",
        a: "Yes. Most plumbing work in Chicago requires permits from the Department of Buildings. Your plumber should obtain the permit before work begins. Unpermitted work can create problems when selling your home and may not be covered by homeowner's insurance. If a contractor asks you to pull your own permit, that's a red flag.",
      },
    ],
  },
  "houston": {
    heading: "Finding a Plumber in Houston",
    body: `Houston's hot, humid climate and clay-heavy soil create a distinctive set of plumbing challenges. The city's well-documented soil movement — clay expands when wet and contracts when dry — is the leading cause of slab leaks and foundation settling, making Houston one of the highest-risk metro areas for under-slab pipe damage in the US. Plumbing work in Houston still requires permits from the City's Public Works department, and plumbers must be licensed by the Texas State Board of Plumbing Examiners. Houston's moderately hard water (150–200 mg/L) contributes to accelerated water heater scaling. Following major weather events like Hurricane Harvey, sump pump installation and flood-proofing have become standard recommendations for Houston homeowners. Emergency plumbers typically charge $90–$180/hour, lower than coastal city averages, but rates rise significantly for after-hours weekend calls.`,
    faqs: [
      {
        q: "Why do pipes leak under slabs in Houston?",
        a: "Houston's expansive clay soil moves significantly with moisture changes during Texas's alternating wet and dry seasons. This ground movement stresses underground copper supply pipes, causing pinhole leaks and joint failures over time. A qualified leak detection specialist can locate slab leaks using acoustic and thermal equipment — often without breaking concrete until the exact location is confirmed.",
      },
      {
        q: "Does Houston have hard water?",
        a: "Yes. Houston water has moderate hardness at 150–200 mg/L. This accelerates scale accumulation in water heaters, reducing efficiency and shortening lifespan. Flushing a tank water heater annually removes accumulated sediment, and a water softener extends the system's life significantly in Houston's water conditions.",
      },
      {
        q: "Are plumbers licensed in Houston/Texas?",
        a: "Yes. Texas requires all plumbers to be licensed by the Texas State Board of Plumbing Examiners (part of TDLR). Verify any plumber's license at tdlr.texas.gov before hiring. Performing unlicensed plumbing work in Texas is a Class A misdemeanor, and unlicensed work may not be covered by homeowner's insurance.",
      },
    ],
  },
  "phoenix": {
    heading: "Finding a Plumber in Phoenix",
    body: `Phoenix's desert climate creates a unique plumbing environment: extreme summer heat (attic temperatures can exceed 140°F) degrades PVC pipes and flexible connectors, while the region's very hard water (350–500 mg/L — among the hardest in the US) aggressively deposits calcium scale in water heaters, pipes, and fixtures. Most Phoenix-area homes were built after 1950 with copper supply lines, but the slightly alkaline Phoenix water leads to a higher-than-average rate of pinhole leaks in copper. Arizona requires plumbers to hold an ROC license from the Arizona Registrar of Contractors — verify at azroc.gov. Water heaters typically last 8–12 years in Phoenix versus 15+ years in softer-water markets due to rapid scale accumulation. A water softener or inline scale inhibitor is one of the highest-ROI plumbing upgrades for Phoenix homeowners. Winter freezes also occur in the Valley — and homes built for desert heat are poorly insulated against cold snaps.`,
    faqs: [
      {
        q: "Why do water heaters fail faster in Phoenix?",
        a: "Phoenix has some of the hardest water in the US at 350–500 mg/L. Calcium carbonate accumulates rapidly at the bottom of tank water heaters, causing overheating, reducing efficiency, and shortening the unit's life to 8–12 years versus 15+ in softer-water markets. Annual flushing and a water softener or descaler significantly extend heater life.",
      },
      {
        q: "What is hard water and how does it affect my Phoenix home's plumbing?",
        a: "Hard water contains high concentrations of dissolved calcium and magnesium. In Phoenix, it leaves visible white scale on faucets, showerheads, and glass, clogs aerators, coats the inside of pipes over time, and causes early water heater failure. A whole-house water softener or salt-free conditioner is a practical and cost-effective solution for Phoenix homeowners.",
      },
      {
        q: "How do I verify a plumber's license in Arizona?",
        a: "Use the Arizona Registrar of Contractors license lookup at azroc.gov. Enter the contractor's ROC number or company name to verify license status, bond, and insurance in real time. Working with an unlicensed contractor in Arizona can void homeowner's insurance coverage for related claims and expose you to significant liability.",
      },
    ],
  },
};

export async function generateMetadata({ params }) {
  const posts = await getPublicPosts().catch(() => []);
  const cityName = [...new Set(posts.map((p) => extractCity(p.address)).filter(Boolean))].find(
    (c) => citySlug(c) === params.city
  );
  if (!cityName) return {};

  const cityPosts = posts.filter((p) => extractCity(p.address) === cityName);
  const state = extractStateFromAddress(cityPosts[0]?.address || "");
  const count = cityPosts.length;
  const location = [cityName, state].filter(Boolean).join(", ");
  const title = `Plumbers in ${location} | Licensed & Reviewed | Plumber Finder`;
  const description = `Find ${count} licensed plumber${count !== 1 ? "s" : ""} in ${location}. Compare reviews, services, and availability. Free directory.`;
  const url = `${SITE}/plumbers/${params.city}`;

  return {
    title: { absolute: title },
    description,
    keywords: `plumbers in ${cityName}, plumbing service ${cityName}, licensed plumber ${cityName}, emergency plumber ${cityName}, drain cleaning ${cityName}, pipe repair ${cityName}, water heater ${cityName}`,
    alternates: { canonical: url },
    robots: count < 1 ? { index: false, follow: false } : undefined,
    openGraph: {
      title, description, url, type: "website", locale: "en_US", siteName: "US Plumber Finder",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CityPage({ params }) {
  const posts = await getPublicPosts().catch(() => []);

  const cityName = [...new Set(posts.map((p) => extractCity(p.address)).filter(Boolean))].find(
    (c) => citySlug(c) === params.city
  );
  if (!cityName) notFound();

  const plumbers = posts.filter((p) => extractCity(p.address) === cityName);
  const state = extractStateFromAddress(plumbers[0]?.address || "");
  const cityContent = CITY_CONTENT[params.city] || null;

  // ── JSON-LD: ItemList ──
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Plumbers in ${cityName}`,
    description: `List of ${plumbers.length} plumbers in ${cityName}`,
    numberOfItems: plumbers.length,
    itemListElement: plumbers.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.companyName,
      url: `${SITE}/post/${p.slug || p._id}`,
    })),
  };

  // ── JSON-LD: BreadcrumbList (Task 10) ──
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: `Plumbers in ${cityName}`, item: `${SITE}/plumbers/${params.city}` },
    ],
  };

  // ── JSON-LD: FAQPage (Task 9) ──
  const faqJsonLd = cityContent ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cityContent.faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  } : null;

  return (
    <div className="portal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <nav className="portal-nav">
        <Link href="/" style={{ textDecoration: "none" }}><Logo size="md" /></Link>
      </nav>

      <div className="city-page-header">
        <div className="city-page-header-inner">
          <Link href="/" className="back-btn">← Back</Link>
          <h1 className="city-page-title">Plumbers in {cityName}{state ? `, ${state}` : ""}</h1>
          <p className="city-page-subtitle">
            {plumbers.length} licensed plumber{plumbers.length !== 1 ? "s" : ""} found in {cityName}
          </p>
        </div>
      </div>

      <main className="portal-main">
        <div className="posts-grid">
          {plumbers.map((post) => (
            <a key={post._id} href={`/post/${post.slug || post._id}`} className="post-card">
              <div className="post-card-img-wrap">
                {post.imageUrl && (
                  <img src={imgUrl(post.imageUrl)} alt={post.title} className="post-card-img" />
                )}
              </div>
              <div className="post-card-body">
                <span className="post-company">{post.companyName}</span>
                <h2 className="post-card-title">{post.title}</h2>
                <p className="post-card-excerpt">
                  {post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 250).replace(/\s\S*$/, "") + "…"}
                </p>
                <div className="post-card-meta">
                  <div className="post-meta-left">
                    {post.reviewCount > 0 ? (
                      <span className="star-rating">
                        {"★".repeat(Math.round(post.rating || 0))}{"☆".repeat(5 - Math.round(post.rating || 0))}
                        <span className="star-count">{post.rating?.toFixed(1)} ({post.reviewCount})</span>
                      </span>
                    ) : (
                      <span className="post-card-new">New</span>
                    )}
                  </div>
                  <span className="post-card-read-more">Read more →</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* City editorial content — top 5 cities only (Task 9) */}
        {cityContent && (
          <section className="city-editorial">
            <h2 className="city-editorial-heading">{cityContent.heading}</h2>
            <p className="city-editorial-body">{cityContent.body}</p>

            <h3 className="city-editorial-faq-title">Frequently Asked Questions</h3>
            <div className="city-editorial-faqs">
              {cityContent.faqs.map(({ q, a }, i) => (
                <details key={i} className="city-faq-item">
                  <summary className="city-faq-q">{q}</summary>
                  <p className="city-faq-a">{a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="city-page-back">
          <Link href="/" className="city-back-link">← Browse all plumbers</Link>
        </div>
      </main>

      <footer className="portal-footer">
        <div className="footer-left">
          <Logo size="sm" white />
          <span>© {new Date().getFullYear()} Plumber Finder. All rights reserved.</span>
        </div>
        <a href="mailto:business.smartdev@gmail.com" className="footer-contact">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,12 2,6"/>
          </svg>
          Contact
        </a>
      </footer>
    </div>
  );
}
