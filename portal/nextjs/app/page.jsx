import { getPublicPosts } from "@/lib/api";
import Logo from "@/components/Logo";
import HeroSlider from "@/components/HeroSlider";
import PortalPosts from "@/components/PortalPosts";
import Link from "next/link";
import { Suspense } from "react";
import { extractCity } from "@/lib/extractCity";

export const metadata = {
  title: "Plumber Finder — Find Plumbers Near You",
  description: "Search and find licensed plumbers, plumbing contractors, and emergency plumbing services near you across the United States.",
  keywords: "find plumbers near me, plumber USA, emergency plumber, drain cleaning, pipe repair, water heater, plumbing service near me",
  alternates: { canonical: "https://usplumberfinder.com" },
  openGraph: {
    title: "Plumber Finder — Find Plumbers Near You",
    description: "Search and find licensed plumbers and plumbing services near you across the United States.",
    url: "https://usplumberfinder.com",
    type: "website",
    locale: "en_US",
    siteName: "Plumber Finder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plumber Finder — Find Plumbers Near You",
    description: "Search and find licensed plumbers and plumbing services near you across the United States.",
  },
};

const POPULAR_CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
  "Indianapolis", "Seattle", "Denver", "Nashville", "Boston",
];

const FOOTER_CITIES = [
  ["New York", "Brooklyn", "Queens", "The Bronx", "Staten Island"],
  ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Sacramento"],
  ["Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio"],
  ["Dallas", "Austin", "Denver", "Seattle", "Nashville"],
  ["Boston", "Atlanta", "Miami", "Orlando", "Tampa"],
  ["Las Vegas", "Portland", "Minneapolis", "Baltimore", "Charlotte"],
];

function citySlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I find a plumber near me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the Near Me button on the homepage to find plumbers based on your current location, or search by city name in the search bar.",
      },
    },
    {
      "@type": "Question",
      name: "How do I search plumbers by city?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Type any US city name in the search box or browse the city list at the bottom of the page to see all plumbers in that city.",
      },
    },
    {
      "@type": "Question",
      name: "What types of plumbing services are listed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plumber Finder lists licensed plumbers, emergency plumbing services, drain cleaning specialists, water heater technicians, pipe repair contractors, and other plumbing professionals across the United States.",
      },
    },
    {
      "@type": "Question",
      name: "Is Plumber Finder free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Plumber Finder is completely free. Browse plumbers, view contact information, hours, and services at no cost.",
      },
    },
  ],
};

export default async function PortalPage() {
  const rawPosts = await getPublicPosts().catch(() => []);
  const posts = rawPosts.map(({ content, ...p }) => ({
    ...p,
    content: content
      ? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300)
      : "",
  }));

  return (
    <div className="portal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <nav className="portal-nav">
        <Link href="/" style={{ textDecoration: "none" }}><Logo size="md" /></Link>
        <div className="nav-links">
          <Link href="/about" className="nav-contact">About</Link>
        </div>
      </nav>

      <HeroSlider />

      <main className="portal-main">
        <Suspense>
          <PortalPosts initialPosts={posts} />
        </Suspense>

        <section className="popular-cities">
          <h2 className="popular-cities-title">Browse Plumbers by City</h2>
          <div className="popular-cities-grid">
            {POPULAR_CITIES.map((city) => (
              <Link key={city} href={`/plumbers/${citySlug(city)}`} className="city-pill">
                {city}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="portal-footer">
        <div className="footer-top">
          <div className="footer-cities">
            {FOOTER_CITIES.map((col, i) => (
              <div key={i} className="footer-city-col">
                {col.map((city) => (
                  <Link key={city} href={`/plumbers/${citySlug(city)}`} className="footer-city-link">
                    {city}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-left">
            <Logo size="sm" white />
            <span>© {new Date().getFullYear()} Plumber Finder. All rights reserved.</span>
          </div>
          <div className="footer-links">
            <Link href="/about" className="footer-contact">About</Link>
            <Link href="/privacy" className="footer-contact">Privacy Policy</Link>
            <a href="mailto:business.smartdev@gmail.com" className="footer-contact">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,12 2,6"/>
              </svg>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
