const Post = require("../models/postModel");

// PUBLIC — samo aktivni postovi, sortirani po redu dodavanja (najstariji prvi)
async function getPublicPosts(req, res) {
  const posts = await Post.find({ status: "active" }).sort({ createdAt: 1 });
  return res.json(posts);
}

// PUBLIC — jedan post po ID-u
async function getPublicPost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, status: "active" });
  if (!post) return res.status(404).json({ message: "Post not found" });
  return res.json(post);
}

// PUBLIC — jedan post po slug-u
async function getPublicPostBySlug(req, res) {
  const post = await Post.findOne({ slug: req.params.slug, status: "active" });
  if (!post) return res.status(404).json({ message: "Post not found" });
  return res.json(post);
}

// PUBLIC — related posts (ista specijalnost ili isti grad, max 4)
async function getRelatedPosts(req, res) {
  const post = await Post.findOne({ slug: req.params.slug, status: "active" }, { specialties: 1, address: 1 });
  if (!post) return res.json([]);
  const city = post.address ? post.address.split(",")[1]?.trim() : null;
  const related = await Post.find({
    status: "active",
    slug: { $ne: req.params.slug },
    $or: [
      ...(post.specialties?.length ? [{ specialties: { $in: post.specialties } }] : []),
      ...(city ? [{ address: { $regex: city, $options: "i" } }] : []),
    ],
  }, { companyName: 1, slug: 1, imageUrl: 1, specialties: 1, address: 1 })
    .limit(4);
  return res.json(related);
}

// PUBLIC — inkrement pregleda (poziva se samo jednom po sesiji)
async function incrementView(req, res) {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  return res.json({ viewCount: post.viewCount });
}

// PUBLIC — search autocomplete
async function searchPosts(req, res) {
  const q = (req.query.q || "").trim();
  if (!q || q.length < 2) return res.json([]);
  const skip = parseInt(req.query.skip) || 0;
  const limit = 10;
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);
  const hasLocation = !isNaN(userLat) && !isNaN(userLng);

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const phraseRegex = new RegExp(escaped, "i");
  const words = escaped.split(/\s+/).filter(Boolean);
  const wordConditions = words.map((w) => ({
    $or: [
      { companyName: new RegExp(w, "i") },
      { title: new RegExp(w, "i") },
      { address: new RegExp(w, "i") },
      { specialties: new RegExp(w, "i") },
    ],
  }));

  const projection = { companyName: 1, title: 1, address: 1, slug: 1, specialties: 1, lat: 1, lng: 1 };

  // Kada je lokacija poznata, dohvati veći pool i sortiraj po distanci
  if (hasLocation) {
    const poolLimit = 200;
    const phrasePool = await Post.find(
      { status: "active", $or: [
        { companyName: phraseRegex }, { title: phraseRegex },
        { address: phraseRegex }, { specialties: phraseRegex },
      ]},
      projection
    ).limit(poolLimit);

    let pool = phrasePool;
    if (phrasePool.length < 20) {
      const wordPool = await Post.find(
        { status: "active", $and: wordConditions },
        projection
      ).limit(poolLimit);
      const seen = new Set(phrasePool.map((p) => String(p._id)));
      pool = [...phrasePool, ...wordPool.filter((p) => !seen.has(String(p._id)))];
    }

    function dist(p) {
      if (!p.lat || !p.lng) return 99999;
      const R = 3958.8;
      const dLat = (p.lat - userLat) * Math.PI / 180;
      const dLng = (p.lng - userLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(userLat * Math.PI / 180) * Math.cos(p.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    pool.sort((a, b) => dist(a) - dist(b));
    return res.json(pool.slice(skip, skip + limit));
  }

  // Bez lokacije — stara logika
  const phraseResults = await Post.find(
    { status: "active", $or: [
      { companyName: phraseRegex }, { title: phraseRegex },
      { address: phraseRegex }, { specialties: phraseRegex },
    ]},
    projection
  ).skip(skip).limit(limit);

  if (phraseResults.length >= 5) return res.json(phraseResults);

  const wordResults = await Post.find(
    { status: "active", $and: wordConditions },
    projection
  ).skip(skip).limit(limit);

  const seen = new Set(phraseResults.map((p) => String(p._id)));
  const combined = [...phraseResults, ...wordResults.filter((p) => !seen.has(String(p._id)))];
  return res.json(combined.slice(0, limit));
}

// ADMIN — svi postovi
async function getAllPosts(req, res) {
  const posts = await Post.find().sort({ createdAt: 1 });
  return res.json(posts);
}

// ADMIN — kreiraj post
async function createPost(req, res) {
  const { title, content, companyName, address, lat, lng, phone, email, website, workingHours, specialties } = req.body;
  if (!title || !content || !companyName) {
    return res.status(400).json({ message: "title, content and companyName are required" });
  }
  const imageUrl = req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : "";
  const gallery = (req.files?.gallery || []).map(f => `/uploads/${f.filename}`);
  const count = await Post.countDocuments();
  const specArray = Array.isArray(specialties)
    ? specialties
    : specialties ? specialties.split(",").map(s => s.trim()).filter(Boolean) : [];
  const post = new Post({
    title, content, companyName,
    address: address || "",
    lat: lat ? parseFloat(lat) : null,
    lng: lng ? parseFloat(lng) : null,
    phone: phone || "",
    email: email || "",
    website: website || "",
    workingHours: workingHours || "",
    specialties: specArray,
    imageUrl, gallery, order: count,
  });
  await post.save();
  return res.status(201).json(post);
}

// ADMIN — edituj post
async function updatePost(req, res) {
  const { title, content, companyName, address, lat, lng, phone, email, website, workingHours, keepGallery, specialties } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.title = title;
  post.content = content;
  post.companyName = companyName;
  post.address = address || "";
  post.lat = lat ? parseFloat(lat) : null;
  post.lng = lng ? parseFloat(lng) : null;
  post.phone = phone || "";
  post.email = email || "";
  post.website = website || "";
  post.workingHours = workingHours || "";
  post.specialties = Array.isArray(specialties)
    ? specialties
    : specialties ? specialties.split(",").map(s => s.trim()).filter(Boolean) : [];

  if (req.files?.image?.[0]) post.imageUrl = `/uploads/${req.files.image[0].filename}`;
  const newGallery = (req.files?.gallery || []).map(f => `/uploads/${f.filename}`);
  const existing = keepGallery ? (Array.isArray(keepGallery) ? keepGallery : [keepGallery]) : [];
  post.gallery = [...existing, ...newGallery];

  await post.save();
  return res.json(post);
}

// ADMIN — upload inline slike za Quill editor
async function uploadInlineImage(req, res) {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  return res.json({ url: `/uploads/${req.file.filename}` });
}

// ADMIN — promijeni status (active/paused)
async function setStatus(req, res) {
  const { status } = req.body;
  if (!["active", "paused"].includes(status)) {
    return res.status(400).json({ message: "Status mora biti active ili paused" });
  }
  const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!post) return res.status(404).json({ message: "Post not found" });
  return res.json(post);
}

// PUBLIC — like post
async function likePost(req, res) {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  return res.json({ likes: post.likes });
}

// ADMIN — reorder (prima array of { id, order })
async function reorderPosts(req, res) {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ message: "items array required" });
  await Promise.all(items.map(({ id, order }) => Post.findByIdAndUpdate(id, { order })));
  return res.json({ message: "Reordered" });
}

// ADMIN — obrisi post
async function deletePost(req, res) {
  await Post.findByIdAndDelete(req.params.id);
  return res.json({ message: "Deleted" });
}

module.exports = {
  getPublicPosts, getPublicPost, getPublicPostBySlug, getRelatedPosts, searchPosts, incrementView,
  getAllPosts, createPost, updatePost, uploadInlineImage,
  setStatus, reorderPosts, likePost, deletePost,
};
