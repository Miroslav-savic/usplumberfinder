"use client";
import { useRef } from "react";
import { imgUrl } from "@/lib/api";
import "./GalleryUpload.css";

export default function GalleryUpload({ images, newFiles, onAdd, onRemoveExisting, onRemoveNew }) {
  const fileRef = useRef();

  function handleFiles(e) {
    const files = Array.from(e.target.files);
    e.target.value = "";
    onAdd(files);
  }

  return (
    <div className="gallery-upload">
      {images.map((src, i) => (
        <div key={`ex-${i}`} className="gallery-thumb-wrap">
          <img src={imgUrl(src)} alt="" className="gallery-thumb" />
          <button type="button" className="gallery-remove" onClick={() => onRemoveExisting(i)} title="Remove">✕</button>
        </div>
      ))}
      {newFiles.map((file, i) => (
        <div key={`new-${i}`} className="gallery-thumb-wrap">
          <img src={URL.createObjectURL(file)} alt="" className="gallery-thumb" />
          <button type="button" className="gallery-remove" onClick={() => onRemoveNew(i)} title="Remove">✕</button>
          <span className="gallery-new-badge">new</span>
        </div>
      ))}
      <button type="button" className="gallery-add-btn" onClick={() => fileRef.current.click()}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
        <span>Add images</span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />
    </div>
  );
}
