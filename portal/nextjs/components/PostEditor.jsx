"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { createPost, updatePost, uploadInlineImage, imgUrl } from "@/lib/api";
import Logo from "./Logo";
import ImageCropper from "./ImageCropper";
import GalleryUpload from "./GalleryUpload";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "link", "image"],
  ["clean"],
];

export default function PostEditor({ token, post, onSaved, onCancel }) {
  const isEdit = !!post;
  const [title, setTitle] = useState(post?.title || "");
  const [companyName, setCompanyName] = useState(post?.companyName || "");
  const [location, setLocation] = useState(
    post?.lat ? { lat: post.lat, lng: post.lng, address: post.address || "" } : null
  );
  const [phone, setPhone] = useState(post?.phone || "");
  const [email, setEmail] = useState(post?.email || "");
  const [website, setWebsite] = useState(post?.website || "");
  const [workingHours, setWorkingHours] = useState(post?.workingHours || "");
  const [specialties, setSpecialties] = useState((post?.specialties || []).join(", "));
  const [content, setContent] = useState(post?.content || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(post?.imageUrl ? imgUrl(post.imageUrl) : null);
  const [cropSrc, setCropSrc] = useState(null);
  const [galleryExisting, setGalleryExisting] = useState(post?.gallery || []);
  const [galleryNew, setGalleryNew] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const quillRef = useRef();
  const quillInstanceRef = useRef(null); // raw Quill instance, set via callback ref

  function handleImageChange(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
  }

  function handleCropDone({ blob, url }) {
    setImageFile(new File([blob], "image.jpg", { type: "image/jpeg" }));
    setPreview(url);
    setCropSrc(null);
  }

  const imageHandler = useCallback(() => {
    const editor = quillInstanceRef.current;
    if (!editor) return;
    // Save cursor position BEFORE file dialog steals focus from editor
    const range = editor.getSelection() || { index: editor.getLength() - 1 };
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const { url } = await uploadInlineImage(token, file);
        editor.insertEmbed(range.index, "image", imgUrl(url));
        editor.setSelection(range.index + 1);
      } catch (err) {
        alert("Image upload error: " + err.message);
      }
    };
  }, [token]);

  // Memoize modules — prevents Quill from reinitializing on every render
  const modules = useMemo(() => ({
    toolbar: { container: TOOLBAR, handlers: { image: imageHandler } },
  }), [imageHandler]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title || !companyName || !content.replace(/<[^>]+>/g, "").trim()) {
      setError("Title, clinic name, and content are required");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("companyName", companyName);
      fd.append("address", location?.address || "");
      if (location?.lat) fd.append("lat", location.lat);
      if (location?.lng) fd.append("lng", location.lng);
      fd.append("phone", phone);
      fd.append("email", email);
      fd.append("website", website);
      fd.append("workingHours", workingHours);
      fd.append("specialties", specialties);
      fd.append("content", content);
      if (imageFile) fd.append("image", imageFile);
      galleryExisting.forEach((url) => fd.append("keepGallery", url));
      galleryNew.forEach((file) => fd.append("gallery", file));

      const saved = isEdit
        ? await updatePost(token, post._id, fd)
        : await createPost(token, fd);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {cropSrc && <ImageCropper imageSrc={cropSrc} onDone={handleCropDone} onCancel={() => setCropSrc(null)} />}

      <div className="editor-page">
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Logo size="sm" white />
            <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>
              {isEdit ? "Edit Post" : "New Post"}
            </span>
          </div>
          <button className="btn-outline" onClick={onCancel}>← Back</button>
        </header>

        <main className="editor-main">
          <form className="editor-form" onSubmit={handleSubmit}>
            <div className="editor-row">
              <div className="editor-field">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
              </div>
              <div className="editor-field">
                <label>Clinic Name</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. City Medical Center" />
              </div>
            </div>

            <div className="editor-field">
              <label>Cover Image</label>
              <div className="image-upload-area" onClick={() => fileRef.current.click()}>
                {preview ? (
                  <>
                    <img src={preview} alt="preview" className="image-preview" />
                    <div className="image-change-overlay">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Change image
                    </div>
                  </>
                ) : (
                  <div className="image-upload-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>Click to upload image</span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Omjer 4:3</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
            </div>

            <div className="editor-row">
              <div className="editor-field">
                <label>Phone <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +1 555 123 4567" />
              </div>
              <div className="editor-field">
                <label>Email <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. info@clinic.com" type="email" />
              </div>
            </div>

            <div className="editor-row">
              <div className="editor-field">
                <label>Website <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. https://clinic.com" type="url" />
              </div>
              <div className="editor-field">
                <label>Working Hours <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                <input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="e.g. Mon–Fri: 8AM–5PM, Sat: 9AM–1PM" />
              </div>
            </div>

            <div className="editor-field">
              <label>Specialties <span style={{ color: "#94a3b8", fontWeight: 400 }}>(comma-separated)</span></label>
              <input
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="e.g. Cardiology, Pediatrics, Dermatology"
              />
            </div>

            <div className="editor-field">
              <label>Content</label>
              <ReactQuill
                ref={(el) => {
                  quillRef.current = el;
                  if (el && !quillInstanceRef.current) {
                    quillInstanceRef.current = el.getEditor();
                  }
                }}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="quill-editor"
              />
            </div>

            <div className="editor-field">
              <label>Photo Gallery</label>
              <GalleryUpload
                images={galleryExisting}
                newFiles={galleryNew}
                onAdd={(files) => setGalleryNew((prev) => [...prev, ...files])}
                onRemoveExisting={(i) => setGalleryExisting((prev) => prev.filter((_, idx) => idx !== i))}
                onRemoveNew={(i) => setGalleryNew((prev) => prev.filter((_, idx) => idx !== i))}
              />
            </div>

            <div className="editor-field">
              <label>Clinic Location</label>
              <MapPicker value={location} onChange={setLocation} />
            </div>

            {error && <p className="error">{error}</p>}

            <div className="editor-submit-row">
              <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Post"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
