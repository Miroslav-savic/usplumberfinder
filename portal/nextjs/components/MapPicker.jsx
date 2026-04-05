"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPicker.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo([coords.lat, coords.lng], 15, { duration: 1 }); }, [coords, map]);
  return null;
}

async function geocode(query) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
}

async function reverseGeocode(lat, lng) {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { "Accept-Language": "bs,hr,sr,en" } });
  const data = await res.json();
  return data.display_name || "";
}

export default function MapPicker({ value, onChange }) {
  const [pin, setPin] = useState(value?.lat ? value : null);
  const [searchQuery, setSearchQuery] = useState(value?.address || "");
  const [searching, setSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState(value?.lat ? value : null);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true); setError("");
    const result = await geocode(searchQuery);
    setSearching(false);
    if (!result) { setError("Address not found."); return; }
    const next = { lat: result.lat, lng: result.lng, address: result.display };
    setPin(next); setFlyTarget(next); setSearchQuery(result.display); onChange(next);
  }

  async function handleMapClick(coords) {
    const address = await reverseGeocode(coords.lat, coords.lng);
    const next = { ...coords, address };
    setPin(next); setSearchQuery(address); setError(""); onChange(next);
  }

  function handleClear() { setPin(null); setSearchQuery(""); setError(""); onChange(null); }

  const center = pin ? [pin.lat, pin.lng] : [39.8283, -98.5795];

  return (
    <div className="map-picker">
      <form className="map-search-form" onSubmit={handleSearch}>
        <div className="map-search-wrap">
          <svg className="map-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input className="map-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search address or click on map..." />
          {pin && <button type="button" className="map-clear-btn" onClick={handleClear} title="Remove location">✕</button>}
        </div>
        <button type="submit" className="map-search-btn" disabled={searching}>{searching ? "..." : "Search"}</button>
      </form>
      {error && <p className="map-error-msg">{error}</p>}
      <div className="map-picker-container">
        <MapContainer center={center} zoom={pin ? 15 : 12} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={handleMapClick} />
          {flyTarget && <FlyTo coords={flyTarget} />}
          {pin && <Marker position={[pin.lat, pin.lng]} />}
        </MapContainer>
        <div className="map-hint">Click on map to set location</div>
      </div>
      {pin && (
        <div className="map-coords">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}
