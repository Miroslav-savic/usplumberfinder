import { getBlogPosts } from "@/lib/api";
import Link from "next/link";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

const SITE = "https://usplumberfinder.com";

export const metadata = {
  title: "Plumbing Tips & Guides | US Plumber Finder Blog",
  description: "Expert plumbing advice, DIY guides, and maintenance tips from licensed plumbers across the US. Learn how to fix leaks, unclog drains, and more.",
  keywords: "plumbing tips, DIY plumbing, pipe repair guide, water heater help, drain cleaning, plumbing advice",
  alternates: { canonical: `${SITE}/blog` },
  openGraph: {
    title: "Plumbing Tips & Guides | US Plumber Finder Blog",
    description: "Expert plumbing advice, DIY guides, and maintenance tips from licensed plumbers across the US.",
    url: `${SITE}/blog`,
    type: "website",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage() {
  let data = { posts: [], total: 0 };
  try { data = await getBlogPosts({ limit: 12 }); } catch {}

  return (
    <div className="blog-page">
      <nav className="detail-nav">
        <Link href="/" style={{ textDecoration: "none" }}><Logo size="sm" /></Link>
        <Link href="/" className="blog-nav-home">← Find Plumbers</Link>
      </nav>

      <div className="blog-container">
        <header className="blog-header">
          <h1 className="blog-title">Plumbing Tips &amp; Guides</h1>
          <p className="blog-subtitle">Expert advice on repairs, maintenance, and choosing the right plumber</p>
        </header>

        {data.posts.length === 0 ? (
          <p className="blog-empty">No articles yet — check back soon.</p>
        ) : (
          <div className="blog-grid">
            {data.posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="blog-card">
                {post.imageUrl && (
                  <div className="blog-card-img-wrap">
                    <img src={post.imageUrl} alt={post.title} className="blog-card-img" />
                  </div>
                )}
                <div className="blog-card-body">
                  {post.tags?.length > 0 && (
                    <div className="blog-card-tags">
                      {post.tags.slice(0, 2).map(t => (
                        <span key={t} className="blog-tag">{t}</span>
                      ))}
                    </div>
                  )}
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-meta">
                    <span className="blog-card-date">{formatDate(post.publishedAt)}</span>
                    <span className="blog-card-read">{post.readTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
