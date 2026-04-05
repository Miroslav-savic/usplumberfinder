"use client";
import { useState } from "react";
import Link from "next/link";

function citySlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CityBrowse({ cities }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="city-browse-section">
      <button className="city-browse-toggle" onClick={() => setOpen((v) => !v)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        Browse plumbers by city
        <svg
          className={`city-browse-chevron ${open ? "city-browse-chevron-open" : ""}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="city-browse-grid">
          {cities.map((c) => (
            <Link key={c} href={`/plumbers/${citySlug(c)}`} className="city-browse-link">
              {c}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
