const express = require("express");
const {
  getPublicPosts, getPublicPost, getPublicPostBySlug, getRelatedPosts, searchPosts, incrementView,
  getAllPosts, createPost, updatePost, uploadInlineImage,
  setStatus, reorderPosts, likePost, deletePost,
} = require("../controllers/postController");
const { getReviews, submitReview } = require("../controllers/reviewController");
const { submitAppointment } = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const postFields = upload.fields([
  { name: "image",   maxCount: 1  },
  { name: "gallery", maxCount: 20 },
]);

// Public
router.get("/public/search",           searchPosts);
router.get("/public",                  getPublicPosts);
router.get("/public/slug/:slug",       getPublicPostBySlug);
router.get("/public/slug/:slug/related", getRelatedPosts);
router.get("/public/:id",              getPublicPost);
router.patch("/public/:id/view",       incrementView);
router.patch("/public/:id/like",       likePost);

// Reviews
router.get("/public/:id/reviews",      getReviews);
router.post("/public/:id/reviews",     submitReview);

// Appointment
router.post("/public/:id/appointment", submitAppointment);

// Admin
router.get("/",                          authMiddleware, getAllPosts);
router.post("/",                         authMiddleware, postFields, createPost);
router.put("/:id",                       authMiddleware, postFields, updatePost);
router.post("/upload-image",             authMiddleware, upload.single("image"), uploadInlineImage);
router.patch("/:id/status",              authMiddleware, setStatus);
router.patch("/reorder/bulk",            authMiddleware, reorderPosts);
router.delete("/:id",                    authMiddleware, deletePost);

module.exports = router;
