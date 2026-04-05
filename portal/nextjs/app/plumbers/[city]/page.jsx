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

export async function generateMetadata({ params }) {
  const posts = await getPublicPosts().catch(() => []);
  const cityName = [...new Set(posts.map((p) => extractCity(p.address)).filter(Boolean))].find(
    (c) => citySlug(c) === params.city
  );
  if (!cityName) return {};

  const count = posts.filter((p) => extractCity(p.address) === cityName).length;
  const title = `Plumbers in ${cityName} | Plumber Finder`;
  const description = `Browse ${count} plumber${count !== 1 ? "s" : ""} in ${cityName}. Find plumbing services, read reviews, and contact a plumber near you.`;
  const url = `${SITE}/plumbers/${params.city}`;

  return {
    title,
    description,
    keywords: `plumbers in ${cityName}, plumbing service ${cityName}, emergency plumber ${cityName}, drain cleaning ${cityName}, pipe repair ${cityName}, water heater ${cityName}`,
    alternates: { canonical: url },
    robots: count < 1 ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "en_US",
      siteName: "Plumber Finder",
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

  const jsonLd = {
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

  return (
    <div className="portal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="portal-nav">
        <Link href="/" style={{ textDecoration: "none" }}><Logo size="md" /></Link>
      </nav>

      <div className="city-page-header">
        <div className="city-page-header-inner">
          <Link href="/" className="back-btn">← Back</Link>
          <h1 className="city-page-title">Plumbers in {cityName}</h1>
          <p className="city-page-subtitle">
            {plumbers.length} plumber{plumbers.length !== 1 ? "s" : ""} found in {cityName}
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
