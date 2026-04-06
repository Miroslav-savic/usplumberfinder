"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { extractCity } from "@/lib/extractCity";
import "./HeroSlider.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function IllustrationSearch() {
  const rowCount = 5;
  return (
    <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-illustration">
      <rect x="110" y="40" width="300" height="200" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="130" y="60" width="260" height="34" rx="17" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <circle cx="153" cy="77" r="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
      <line x1="159" y1="83" x2="162" y2="86" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="170" y="73" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.2)" />
      <rect x="130" y="106" width="55" height="20" rx="10" fill="rgba(16,185,129,0.3)" stroke="rgba(16,185,129,0.5)" strokeWidth="1" />
      <rect x="193" y="106" width="62" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
      <rect x="263" y="106" width="50" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
      {Array.from({ length: rowCount }).map((_, i) => (
        <g key={i}>
          <rect x="130" y={138 + i * 18} width="260" height="13" rx="3" fill="rgba(255,255,255,0.05)" />
          <circle cx="142" cy={144 + i * 18} r="4" fill={i === 0 ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.2)"} />
          <rect x="152" y={141 + i * 18} width={60 + i * 12} height="5" rx="2" fill="rgba(255,255,255,0.15)" />
          <rect x={355 - i * 5} y={141 + i * 18} width="28" height="5" rx="2" fill="rgba(255,255,255,0.08)" />
        </g>
      ))}
      <circle cx="60" cy="90" r="18" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
      <circle cx="60" cy="90" r="8" fill="rgba(16,185,129,0.2)" />
      <circle cx="460" cy="180" r="22" fill="rgba(2,132,199,0.1)" stroke="rgba(2,132,199,0.25)" strokeWidth="1" />
      <circle cx="460" cy="180" r="10" fill="rgba(2,132,199,0.2)" />
      {[[30,40],[490,50],[40,220],[500,220]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="rgba(255,255,255,0.5)" />
      ))}
    </svg>
  );
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(mi) {
  if (mi < 0.1) return `${(mi * 5280).toFixed(0)} ft`;
  return `${mi.toFixed(1)} mi`;
}

export default function HeroSlider() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const skipRef = useRef(0);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);
  const dropdownRef = useRef(null);
  const sentinelRef = useRef(null);
  const router = useRouter();

  function handleNearMe() {
    if (userLoc) { setUserLoc(null); return; }
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "near_me_click", {
        event_category: "engagement",
        event_label: "hero",
      });
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocLoading(false); },
      () => setLocLoading(false)
    );
  }

  async function fetchResults(q, skip = 0) {
    let url = `${API}/api/posts/public/search?q=${encodeURIComponent(q)}&skip=${skip}`;
    if (userLoc) url += `&lat=${userLoc.lat}&lng=${userLoc.lng}`;
    const res = await fetch(url);
    return res.json();
  }


  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); setOpen(false); setHasMore(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      skipRef.current = 0;
      try {
        const data = await fetchResults(q, 0);
        setResults(data);
        setHasMore(data.length === 10);
        setOpen(data.length > 0);
        skipRef.current = data.length;
      } catch {
        setResults([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, userLoc]);

  // IntersectionObserver za infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting || loadingMore || !hasMore) return;
      const q = query.trim();
      if (q.length < 2) return;
      setLoadingMore(true);
      try {
        const data = await fetchResults(q, skipRef.current);
        setResults((prev) => [...prev, ...data]);
        setHasMore(data.length === 10);
        skipRef.current += data.length;
      } catch {}
      finally { setLoadingMore(false); }
    }, { threshold: 1.0 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, query]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    setOpen(false);
    const q = query.trim();
    if (q) router.push(`/?q=${encodeURIComponent(q)}`);
    else document.getElementById("clinic-list")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleSelect(post) {
    setOpen(false);
    setQuery("");
    window.location.href = `/post/${post.slug || post._id}`;
  }

  return (
    <div className="hero-slider" style={{ background: "linear-gradient(135deg, #0c1b33 0%, #1e3a8a 55%, #1d4ed8 100%)" }}>
      <div className="hero-illustration-wrap">
        <IllustrationSearch />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-tag">10,000+ Plumbers Listed</span>
        <h2 className="hero-title">Find Trusted Plumbers Near You in Seconds</h2>
        <p className="hero-subtitle">Compare prices, reviews, and availability across the US. Licensed professionals, fast response.</p>
        <div className="hero-social-proof">
          <div className="hero-stars">
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          <span className="hero-proof-text">Trusted by homeowners across 20+ cities</span>
        </div>
        <form className="hero-search-form" onSubmit={handleSearch}>
          <div className="hero-search-inner" ref={wrapRef} style={{ position: "relative" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hero-search-icon">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="hero-search-input"
              type="text"
              placeholder="Quick search — plumber, service or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              autoComplete="off"
            />
            {loading && <span className="hero-search-spinner" />}

            {open && (
              <ul className="hero-search-dropdown" ref={dropdownRef}>
                {results.map((post) => {
                  const city = extractCity(post.address);
                  const specs = (post.specialties || []).slice(0, 2).join(", ");
                  return (
                    <li key={post._id} className="hero-search-item" onMouseDown={() => handleSelect(post)}>
                      <div className="hero-search-item-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                      </div>
                      <div className="hero-search-item-body">
                        <div className="hero-search-item-name">{post.companyName}</div>
                        <div className="hero-search-item-meta">
                          {city && <span>{city}</span>}
                          {city && specs && <span className="hero-search-item-dot">·</span>}
                          {specs && <span className="hero-search-item-specialty">{specs}</span>}
                        </div>
                      </div>
                      {userLoc && post.lat && post.lng
                        ? <span className="hero-search-item-dist">{formatDist(haversine(userLoc.lat, userLoc.lng, post.lat, post.lng))}</span>
                        : <span className="hero-search-item-arrow">›</span>
                      }
                    </li>
                  );
                })}
                <li ref={sentinelRef} style={{ padding: 0, height: 1 }} />
                {loadingMore && (
                  <li className="hero-search-load-more">
                    <span className="hero-search-spinner-inline" />
                    Loading...
                  </li>
                )}
              </ul>
            )}
          </div>
          <button
            type="button"
            className={`hero-near-me-btn ${userLoc ? "hero-near-me-btn--active" : ""}`}
            onClick={handleNearMe}
            title={userLoc ? "Clear location" : "Find plumbers near me"}
          >
            {locLoading ? (
              <span className="hero-search-spinner-inline" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            )}
            {userLoc ? "Near Me ✓" : "Near Me"}
          </button>
        </form>
      </div>
    </div>
  );
}
