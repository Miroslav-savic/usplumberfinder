const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 1000 },
    author:  { type: String, default: "Anonymous", maxlength: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
