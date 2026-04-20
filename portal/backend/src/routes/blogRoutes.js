const express = require("express");
const {
  getPublicPosts, getPublicPostBySlug, incrementView,
  getAllPosts, createPost, updatePost, deletePost,
} = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/public",              getPublicPosts);
router.get("/public/:slug",        getPublicPostBySlug);
router.patch("/public/:id/view",   incrementView);

// Admin
router.get("/",        authMiddleware, getAllPosts);
router.post("/",       authMiddleware, createPost);
router.put("/:id",     authMiddleware, updatePost);
router.delete("/:id",  authMiddleware, deletePost);

module.exports = router;
