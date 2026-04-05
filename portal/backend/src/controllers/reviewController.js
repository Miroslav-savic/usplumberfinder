const Review = require("../models/reviewModel");
const Post   = require("../models/postModel");

async function getReviews(req, res) {
  const reviews = await Review.find({ postId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(50);
  return res.json(reviews);
}

async function submitReview(req, res) {
  const { rating, comment, author } = req.body;
  const r = parseInt(rating, 10);
  if (!r || r < 1 || r > 5) {
    return res.status(400).json({ message: "Rating must be 1–5" });
  }
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Clinic not found" });

  const review = await Review.create({
    postId: req.params.id,
    rating: r,
    comment: (comment || "").slice(0, 1000),
    author:  (author  || "Anonymous").slice(0, 100),
  });

  // Recalculate average rating
  const all = await Review.find({ postId: req.params.id });
  const avg = all.reduce((s, v) => s + v.rating, 0) / all.length;
  await Post.findByIdAndUpdate(req.params.id, {
    rating:      Math.round(avg * 10) / 10,
    reviewCount: all.length,
  });

  return res.status(201).json(review);
}

module.exports = { getReviews, submitReview };
