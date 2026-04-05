"use client";
import { useEffect, useCallback } from "react";
import "./Lightbox.css";

export default function Lightbox({ images, index, onClose, onNav }) {
  const total = images.length;
  const prev = useCallback(() => onNav((index - 1 + total) % total), [index, total, onNav]);
  const next = useCallback(() => onNav((index + 1) % total), [index, total, onNav]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>✕</button>
      {total > 1 && (
        <>
          <button className="lb-arrow lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <button className="lb-arrow lb-next" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </>
      )}
      <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()}>
        <img src={images[index]} alt={`Slika ${index + 1}`} className="lb-img" />
      </div>
      {total > 1 && <div className="lb-counter">{index + 1} / {total}</div>}
      {total > 1 && (
        <div className="lb-thumbs" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <img key={i} src={src} alt="" className={`lb-thumb ${i === index ? "lb-thumb-active" : ""}`} onClick={() => onNav(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
