"use client";
import { useState } from "react";
import Lightbox from "./Lightbox";

export default function PostGallery({ images }) {
  const [lbIndex, setLbIndex] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="detail-gallery">
        <h3 className="detail-gallery-title">Galerija</h3>
        <div className="detail-gallery-grid">
          {images.map((src, i) => (
            <div key={i} className="detail-gallery-item" onClick={() => setLbIndex(i)}>
              <img src={src} alt={`Galerija ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {lbIndex !== null && (
        <Lightbox images={images} index={lbIndex} onClose={() => setLbIndex(null)} onNav={setLbIndex} />
      )}
    </>
  );
}
