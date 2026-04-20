import { getPublicPostBySlug, getRelatedPosts, imgUrl } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ViewTracker from "@/components/ViewTracker";
import PostGallery from "@/components/PostGallery";
import Logo from "@/components/Logo";
import { extractCity } from "@/lib/extractCity";
import PlumberContact from "@/components/PlumberContact";

const AddressMap = dynamic(() => import("@/components/AddressMap"), { ssr: false });
const ReviewSection = dynamic(() => import("@/components/ReviewSection"), { ssr: false });


const SITE = "https://usplumberfinder.com";

const DAY_NAMES = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

function expandDayRange(range) {
  const order = ["mon","tue","wed","thu","fri","sat","sun"];
  const [from, to] = range.toLowerCase().split("-").map(s => s.trim().slice(0,3));
  if (!to) return [DAY_NAMES[from]].filter(Boolean);
  const start = order.indexOf(from);
  const end = order.indexOf(to);
  if (start === -1 || end === -1) return [];
  return order.slice(start, end + 1).map(d => DAY_NAMES[d]);
}

function toHHMM(time) {
  // "7:30 AM" → "07:30", "7PM" → "19:00"
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = m[2] || "00";
  const period = (m[3] || "").toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

const SHORT_TO_LONG = {
  sun:"Sunday",mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday"
};

function parseOpeningHours(hoursStr) {
  if (!hoursStr) return null;
  // 24/7: any day has "Open 24h"
  if (hoursStr.includes("Open 24h")) {
    const allDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return [{ "@type": "OpeningHoursSpecification", dayOfWeek: allDays, opens: "00:00", closes: "23:59" }];
  }
  // Format: "Sun: 7:00AM–8:00PM, Mon: 7:00AM–8:00PM, ..."
  const lines = hoursStr.split(/,\s*(?=[A-Z][a-z]{2}:)|\n|;/).map(s => s.trim()).filter(Boolean);
  const specs = [];
  for (const line of lines) {
    const m = line.match(/^([A-Za-z]{3}):\s*(\d{1,2}(?::\d{2})?(?:AM|PM))\s*[–\-]\s*(\d{1,2}(?::\d{2})?(?:AM|PM))$/i);
    if (!m) continue;
    const day = SHORT_TO_LONG[m[1].toLowerCase()];
    const opens = toHHMM(m[2]);
    const closes = toHHMM(m[3]);
    if (!day || !opens || !closes) continue;
    specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: day, opens, closes });
  }
  return specs.length ? specs : null;
}

function parseAddress(address) {
  if (!address) return {};
  const cleaned = address.replace(/,?\s*USA\s*$/, "").trim();
  const parts = cleaned.split(",").map(p => p.trim());
  const last = parts[parts.length - 1];
  const stateZip = last.match(/^([A-Z]{2})\s*(\d{5})?$/);
  return {
    street: parts[0] || "",
    state: stateZip ? stateZip[1] : "",
    postalCode: stateZip ? (stateZip[2] || "") : "",
  };
}

export async function generateMetadata({ params }) {
  const post = await getPublicPostBySlug(params.slug).catch(() => null);
  if (!post) return {};

  const city = extractCity(post.address);
  const { state } = parseAddress(post.address);
  const location = [city, state].filter(Boolean).join(", ");
  const specs = (post.specialties || []).slice(0, 3).join(", ");

  // Build description using real data, skipping missing fields
  const parts = [];
  if (location) parts.push(`${post.companyName} in ${location}`);
  if (post.rating > 0) parts.push(`rated ${post.rating.toFixed(1)}★ by ${post.reviewCount} customers`);
  const descParts = [parts.join(" — ")];
  if (specs) descParts.push(`Services: ${specs}.`);
  if (post.phone) descParts.push(`Call ${post.phone}.`);
  const description = descParts.join(" ").slice(0, 155);

  const image = post.imageUrl ? imgUrl(post.imageUrl) : null;
  const url = `${SITE}/post/${post.slug}`;
  const title = location
    ? `${post.companyName} – ${location} | Reviews & Contact | Plumber Finder`
    : `${post.companyName} | Reviews & Contact | Plumber Finder`;
  const keywords = [post.companyName, city, state, ...(post.specialties || []), "plumber", "plumbing service", "USA"].filter(Boolean).join(", ");

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type: "website", locale: "en_US", siteName: "US Plumber Finder",
      ...(image && { images: [{ url: image, width: 800, height: 600, alt: post.companyName }] }),
    },
    twitter: {
      card: "summary_large_image", title, description, ...(image && { images: [image] }),
    },
  };
}

export default async function PostDetailPage({ params }) {
  const [post, related] = await Promise.all([
    getPublicPostBySlug(params.slug).catch(() => null),
    getRelatedPosts(params.slug).catch(() => []),
  ]);
  if (!post) notFound();

  const galleryUrls = (post.gallery || []).map(imgUrl);
  const city = extractCity(post.address);
  const { street, state, postalCode } = parseAddress(post.address);
  const openingHours = parseOpeningHours(post.workingHours);

  const plainDesc = (post.content ? post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) : "")
    || [post.companyName, post.address, (post.specialties || []).join(", ")].filter(Boolean).join(" · ").slice(0, 200);

  const profileUrl = `${SITE}/post/${post.slug}`;

  // ── BreadcrumbList JSON-LD (Task 10) ──
  const citySlugStr = city ? city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      ...(citySlugStr ? [{ "@type": "ListItem", position: 2, name: `Plumbers in ${city}`, item: `${SITE}/plumbers/${citySlugStr}` }] : []),
      { "@type": "ListItem", position: citySlugStr ? 3 : 2, name: post.companyName, item: profileUrl },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Plumber",
    name: post.companyName,
    description: plainDesc,
    // Use the plumber's own website as canonical URL; fall back to profile page
    url: post.website || profileUrl,
    mainEntityOfPage: profileUrl,
    ...(post.website && { sameAs: profileUrl }),
    ...(post.imageUrl && { image: imgUrl(post.imageUrl) }),
    ...(post.phone && { telephone: post.phone }),
    ...(post.email && { email: post.email }),
    address: {
      "@type": "PostalAddress",
      ...(street && { streetAddress: street }),
      addressLocality: city,
      ...(state && { addressRegion: state }),
      ...(postalCode && { postalCode }),
      addressCountry: "US",
    },
    ...(post.lat && post.lng && {
      geo: { "@type": "GeoCoordinates", latitude: post.lat, longitude: post.lng },
    }),
    ...((post.specialties || []).length > 0 && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Plumbing Services",
        itemListElement: post.specialties.map(s => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })),
      },
    }),
    ...(city && { areaServed: { "@type": "City", name: city } }),
    ...(openingHours && { openingHoursSpecification: openingHours }),
    ...(post.rating > 0 && post.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: post.rating.toFixed(1),
        reviewCount: post.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <div className="detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav className="detail-nav">
        <Link href="/" style={{ textDecoration: "none" }}><Logo size="sm" /></Link>
      </nav>

      <div className="detail-container">
        <Link href="/" className="back-btn">← Back</Link>

        <div className="detail-header">
          <span className="detail-company">{post.companyName}</span>
          <h1 className="detail-title">{post.title}</h1>

          <div className="detail-meta">
            {post.viewCount >= 100 && <span>{post.viewCount} views</span>}
            {post.reviewCount > 0 && (
              <>
                <span>·</span>
                <span>{"★".repeat(Math.round(post.rating))} {post.rating?.toFixed(1)} ({post.reviewCount} reviews)</span>
              </>
            )}
          </div>
        </div>

        {post.imageUrl && (
          <div className="detail-img-wrap">
            <img src={imgUrl(post.imageUrl)} alt={post.title} className="detail-img" />
          </div>
        )}

        {post.content && <div className="detail-content ql-content" dangerouslySetInnerHTML={{ __html: post.content }} />}

        {galleryUrls.length > 0 && <PostGallery images={galleryUrls} />}

        <PlumberContact
          phone={post.phone}
          email={post.email}
          website={post.website}
          workingHours={post.workingHours}
          specialties={post.specialties}
          companyName={post.companyName}
          city={city}
        />

        {post.lat && (
          <AddressMap lat={post.lat} lng={post.lng} address={post.address} companyName={post.companyName} />
        )}

        <ReviewSection postId={post._id} />

        {related.length > 0 && (
          <div className="related-plumbers">
            <h3 className="related-title">Related Plumbers</h3>
            <div className="related-grid">
              {related.map(r => (
                <Link key={r._id} href={`/post/${r.slug}`} className="related-card">
                  {r.imageUrl && (
                    <img src={imgUrl(r.imageUrl)} alt={r.companyName} className="related-img" />
                  )}
                  <div className="related-info">
                    <span className="related-name">{r.companyName}</span>
                    {(r.specialties || []).length > 0 && (
                      <span className="related-spec">{r.specialties.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ViewTracker id={post._id} />
    </div>
  );
}
