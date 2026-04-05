const mongoose = require("mongoose");

const BCSMAP = { š:"s", đ:"d", č:"c", ć:"c", ž:"z", Š:"s", Đ:"d", Č:"c", Ć:"c", Ž:"z" };
function slugify(str) {
  return str
    .replace(/[šđčćžŠĐČĆŽ]/g, (m) => BCSMAP[m] || m)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const postSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    content:     { type: String, required: true },
    imageUrl:    { type: String, default: "" },
    gallery:     { type: [String], default: [] },
    companyName: { type: String, required: true },
    slug:        { type: String, unique: true, sparse: true },
    address:     { type: String, default: "" },
    lat:         { type: Number, default: null },
    lng:         { type: Number, default: null },
    phone:        { type: String, default: "" },
    email:        { type: String, default: "" },
    website:      { type: String, default: "" },
    workingHours: { type: String, default: "" },
    specialties:  { type: [String], default: [] },
    status:      { type: String, enum: ["active", "paused"], default: "paused" },
    viewCount:   { type: Number, default: 0 },
    likes:       { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.pre("save", async function (next) {
  if (this.slug && !this.isModified("companyName")) return next();
  const base = slugify(this.companyName);
  let slug = base;
  let n = 1;
  while (await mongoose.model("Post").exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${++n}`;
  }
  this.slug = slug;
  next();
});

postSchema.index(
  { companyName: "text", title: "text", address: "text", specialties: "text" },
  { weights: { companyName: 10, title: 8, specialties: 5, address: 3 }, name: "search_text" }
);

module.exports = mongoose.model("Post", postSchema);
