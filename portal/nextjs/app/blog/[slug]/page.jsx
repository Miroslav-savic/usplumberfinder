import { getBlogPost } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import BlogViewTracker from "@/components/BlogViewTracker";

const SITE = "https://usplumberfinder.com";

export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.slug).catch(() => null);
  if (!post) return {};

  const description = post.excerpt || post.title;
  const url = `${SITE}/blog/${post.slug}`;

  return {
    title: post.title,
    description,
    keywords: [...(post.tags || []), "plumbing", "plumbing tips", "plumber"].join(", "),
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author || "US Plumber Finder"],
      tags: post.tags,
      ...(post.imageUrl && { images: [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.imageUrl && { images: [post.imageUrl] }),
    },
  };
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({ params }) {
  const post = await getBlogPost(params.slug).catch(() => null);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    author: { "@type": "Organization", name: post.author || "US Plumber Finder" },
    publisher: { "@type": "Organization", name: "US Plumber Finder", url: SITE },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: `${SITE}/blog/${post.slug}`,
    ...(post.imageUrl && { image: post.imageUrl }),
    keywords: (post.tags || []).join(", "),
    articleSection: "Plumbing",
    inLanguage: "en-US",
  };

  return (
    <div className="blog-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="detail-nav">
        <Link href="/" style={{ textDecoration: "none" }}><Logo size="sm" /></Link>
        <Link href="/blog" className="blog-nav-home">← All Articles</Link>
      </nav>

      <article className="blog-article">
        <header className="blog-article-header">
          {post.tags?.length > 0 && (
            <div className="blog-card-tags">
              {post.tags.map(t => <span key={t} className="blog-tag">{t}</span>)}
            </div>
          )}
          <h1 className="blog-article-title">{post.title}</h1>
          {post.excerpt && <p className="blog-article-excerpt">{post.excerpt}</p>}
          <div className="blog-article-meta">
            <span>{post.author || "US Plumber Finder"}</span>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>
        </header>

        {post.imageUrl && (
          <div className="blog-article-img-wrap">
            <img src={post.imageUrl} alt={post.title} className="blog-article-img" />
          </div>
        )}

        <div
          className="blog-article-content ql-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="blog-article-footer">
          <Link href="/blog" className="blog-back-btn">← Back to all articles</Link>
          <div className="blog-article-cta">
            <p>Need a licensed plumber?</p>
            <Link href="/" className="blog-cta-btn">Find a Plumber Near You</Link>
          </div>
        </footer>
      </article>

      <BlogViewTracker id={post._id} />
    </div>
  );
}
