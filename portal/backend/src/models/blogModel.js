const mongoose = require("mongoose");

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const blogSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    slug:        { type: String, unique: true, sparse: true },
    excerpt:     { type: String, default: "" },
    content:     { type: String, required: true },
    imageUrl:    { type: String, default: "" },
    author:      { type: String, default: "US Plumber Finder" },
    tags:        { type: [String], default: [] },
    readTime:    { type: Number, default: 5 },
    status:      { type: String, enum: ["published", "draft"], default: "draft" },
    publishedAt: { type: Date, default: null },
    viewCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.pre("save", async function (next) {
  if (this.slug && !this.isModified("title")) return next();
  const base = slugify(this.title);
  let slug = base;
  let n = 1;
  while (await mongoose.model("Blog").exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${++n}`;
  }
  this.slug = slug;
  next();
});

blogSchema.index({ title: "text", excerpt: "text", tags: "text" });

module.exports = mongoose.model("Blog", blogSchema);
