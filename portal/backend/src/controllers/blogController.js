const Blog = require("../models/blogModel");

// Public: list published posts (paginated)
exports.getPublicPosts = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const query = { status: "published" };
    if (req.query.tag) query.tags = req.query.tag;

    const [posts, total] = await Promise.all([
      Blog.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit)
          .select("title slug excerpt imageUrl author tags readTime publishedAt viewCount"),
      Blog.countDocuments(query),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Public: single post by slug
exports.getPublicPostBySlug = async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, status: "published" });
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Public: increment view
exports.incrementView = async (req, res) => {
  try {
    await Blog.updateOne({ _id: req.params.id }, { $inc: { viewCount: 1 } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Admin: list all
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Admin: create
exports.createPost = async (req, res) => {
  try {
    const { title, excerpt, content, imageUrl, author, tags, readTime, status, publishedAt } = req.body;
    const post = new Blog({ title, excerpt, content, imageUrl, author, tags, readTime, status,
      publishedAt: status === "published" ? (publishedAt || new Date()) : null });
    await post.save();
    res.status(201).json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Admin: update
exports.updatePost = async (req, res) => {
  try {
    const { title, excerpt, content, imageUrl, author, tags, readTime, status, publishedAt } = req.body;
    const update = { title, excerpt, content, imageUrl, author, tags, readTime, status };
    if (status === "published") update.publishedAt = publishedAt || new Date();
    const post = await Blog.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Admin: delete
exports.deletePost = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
