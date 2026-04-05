import { getPublicPosts } from "@/lib/api";
import { extractCity } from "@/lib/extractCity";

const SITE = "https://usplumberfinder.com";

function citySlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function sitemap() {
  const posts = await getPublicPosts().catch(() => []);

  const postUrls = posts.map((p) => ({
    url: `${SITE}/post/${p.slug || p._id}`,
    lastModified: new Date(p.updatedAt || p.createdAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const allCities = [...new Set(posts.map((p) => extractCity(p.address)).filter(Boolean))];
  const cities = allCities.filter(
    (c) => posts.filter((p) => extractCity(p.address) === c).length >= 1
  );
  const cityUrls = cities.map((c) => ({
    url: `${SITE}/plumbers/${citySlug(c)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...cityUrls,
    ...postUrls,
  ];
}
