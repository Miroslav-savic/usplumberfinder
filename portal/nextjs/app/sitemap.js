import { getPublicPosts, getBlogPosts } from "@/lib/api";
import { extractCity } from "@/lib/extractCity";

export const dynamic = "force-dynamic";

const SITE = "https://usplumberfinder.com";

function citySlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const US_STATE_RE = /,\s*[A-Z]{2}\s*(?:\d{5})?\s*(?:,\s*USA)?\s*$/;

function isUSAddress(address) {
  if (!address) return false;
  // Must end with a pattern like ", TX 77001" or ", TX, USA" — not UK/Canada postcodes
  return US_STATE_RE.test(address) && !/(UK|Canada|Ontario|Quebec|British Columbia|\b[A-Z]{2}\d[A-Z]\s*\d[A-Z]\d)/.test(address);
}

export default async function sitemap() {
  const [posts, blogData] = await Promise.all([
    getPublicPosts().catch(() => []),
    getBlogPosts({ limit: 100 }).catch(() => ({ posts: [] })),
  ]);

  // Filter to US-only posts before building URLs
  const usPosts = posts.filter((p) => isUSAddress(p.address));

  const blogUrls = (blogData.posts || []).map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Profile pages: priority 0.6, monthly
  const postUrls = usPosts.map((p) => ({
    url: `${SITE}/post/${p.slug || p._id}`,
    lastModified: new Date(p.updatedAt || p.createdAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // City pages: priority 0.8, weekly
  const allCities = [...new Set(usPosts.map((p) => extractCity(p.address)).filter(Boolean))];
  const cityUrls = allCities.map((c) => ({
    url: `${SITE}/plumbers/${citySlug(c)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: SITE,              lastModified: new Date(), changeFrequency: "daily",  priority: 1.0 },
    { url: `${SITE}/blog`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE}/about`,  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/privacy`,lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    ...blogUrls,
    ...cityUrls,
    ...postUrls,
  ];
}
