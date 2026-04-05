"use client";
import "./AddressMap.css";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export default function AddressMap({ lat, lng, address, companyName }) {
  if (!lat || !lng) return null;

  const src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=${lat},${lng}&zoom=15`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="address-map-wrap">
      <div className="address-map-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span>{address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}</span>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="address-map-directions">
          Get directions →
        </a>
      </div>
      <div className="address-map-container">
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={companyName}
        />
      </div>
    </div>
  );
}
