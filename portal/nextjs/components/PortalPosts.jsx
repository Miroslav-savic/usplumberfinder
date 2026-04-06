"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { imgUrl } from "@/lib/api";


const PER_PAGE = 10;
const SPECIALTIES = [
  "Drain Cleaning","Pipe Repair","Water Heater","Emergency","Leak Detection",
  "Sewer Line","Bathroom","Kitchen","Gas Line","Repiping",
  "Backflow","Sump Pump","Toilet Repair","Faucet & Fixture","Water Softener",
];


const NYC_NEIGHBORHOODS = new Set([
  "jamaica","flushing","astoria","ridgewood","bayside","forest hills",
  "jackson heights","corona","elmhurst","woodside","sunnyside","long island city",
  "ozone park","richmond hill","south richmond hill","rosedale","springfield gardens",
  "howard beach","hollis","queens village","cambria heights","laurelton","st. albans",
  "st albans","fresh meadows","briarwood","kew gardens","woodhaven","maspeth",
  "middle village","glendale","rego park","whitestone","college point","little neck",
  "douglaston","glen oaks","floral park","bellerose","rockaway park","far rockaway",
  "belle harbor","arverne","edgemere","neponsit","breezy point",
  // Bronx neighborhoods
  "mott haven","hunts point","melrose","morrisania","highbridge","concourse",
  "university heights","fordham","tremont","belmont","east tremont","west farms",
  "longwood","soundview","castle hill","parkchester","unionport","van nest",
  "morris park","pelham bay","country club","city island","co-op city","baychester",
  "wakefield","williamsbridge","woodlawn","kingsbridge","riverdale","spuyten duyvil",
  "marble hill","inwood","norwood","bedford park","allerton","laconia",
  // Brooklyn neighborhoods
  "bushwick","brownsville","east new york","canarsie","flatlands","mill basin",
  "bergen beach","marine park","flatbush","east flatbush","crown heights",
  "prospect heights","park slope","gowanus","red hook","sunset park","bay ridge",
  "dyker heights","bensonhurst","bath beach","borough park","kensington",
  "windsor terrace","ditmas park","midwood","gravesend","sheepshead bay",
  "brighton beach","coney island","sea gate","gerritsen beach","manhattan beach",
  "cobble hill","boerum hill","dumbo","downtown brooklyn","fort greene",
  "clinton hill","bed-stuy","bedford-stuyvesant","williamsburg","greenpoint",
  "greenpoint","cypress hills","highland park","new lots","starrett city",
  // Staten Island neighborhoods
  "st. george","tompkinsville","stapleton","clifton","rosebank","port richmond",
  "west brighton","new brighton","snug harbor","graniteville","mariners harbor",
  "port ivory","elm park","westerleigh","castleton corners","new springville",
  "bulls head","heartland village","chelsea","travis","richmond valley",
  "tottenville","great kills","huguenot","rossville","woodrow","arden heights",
  "annadale","eltingville","bay terrace","dongan hills","midland beach",
  "south beach","arrochar","grasmere","oakwood","new dorp","richmond town",
]);

function normalizeNYC(city) {
  const lc = city.toLowerCase();
  if (NYC_NEIGHBORHOODS.has(lc)) return "New York";
  if (lc === "brooklyn") return "Brooklyn";
  if (lc === "bronx" || lc === "the bronx") return "The Bronx";
  if (lc === "staten island") return "Staten Island";
  if (lc === "queens") return "Queens";
  return city;
}

function extractCity(address) {
  if (!address) return "";
  // Strip ", USA" suffix added by Google Places
  const cleaned = address.replace(/,?\s*USA\s*$/, "").trim();
  const parts = cleaned.split(",").map((p) => p.trim());
  const last = parts[parts.length - 1];
  // US format: last part is "CA 90048" or "CA"
  let city;
  if (/^[A-Z]{2}(\s+\d{5})?$/.test(last) && parts.length >= 2) {
    city = parts[parts.length - 2];
  } else {
    city = last.replace(/^\d{5}\s*/, "").trim();
  }
  return normalizeNYC(city);
}

function stripHtml(text) {
  return text.toLowerCase();
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function StarRating({ rating, count }) {
  if (!rating) return null;
  const stars = Math.round(rating);
  return (
    <span className="star-rating">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= stars ? "#f59e0b" : "none"}
          stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="star-count">{rating.toFixed(1)} ({count})</span>
    </span>
  );
}


function SpecialtyToggle({ specialty, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="specialty-toggle-wrap" ref={ref}>
      <button className={`city-browse-toggle ${specialty ? "city-browse-toggle-active" : ""}`} onClick={() => setOpen((v) => !v)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
        </svg>
        <span className="specialty-toggle-label">{specialty || "Service"}</span>
        <span className="specialty-toggle-label-short">{specialty ? specialty.split(" ")[0] : "Specialty"}</span>
        <svg className={`city-browse-chevron ${open ? "city-browse-chevron-open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="specialty-dropdown">
          {specialty && (
            <button className="city-browse-link city-browse-link-active" onClick={() => { onSelect(""); setOpen(false); }}>
              ✕ Clear
            </button>
          )}
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              className={`city-browse-link ${specialty === s ? "city-browse-link-active" : ""}`}
              onClick={() => { onSelect(s === specialty ? "" : s); setOpen(false); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export default function PortalPosts({ initialPosts }) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [page, setPage] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const cachedLocRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [mapPost, setMapPost] = useState(null);

  function handleCopy(e, phone, id) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleMapOpen(e, post) {
    e.preventDefault();
    e.stopPropagation();
    setMapPost(post);
  }

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearch(q);
      setPage(1);
      setTimeout(() => document.getElementById("plumber-list")?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [searchParams]);

  const cities = useMemo(() => {
    const set = new Set(posts.map((p) => extractCity(p.address)).filter(Boolean));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = posts;

    if (city) result = result.filter((p) => extractCity(p.address) === city);
    if (specialty) result = result.filter((p) => (p.specialties || []).some(
      (s) => s.toLowerCase() === specialty.toLowerCase()
    ));

    if (q) {
      const withScore = result.map((p) => {
        const inTitle = p.title.toLowerCase().includes(q);
        const inCompany = p.companyName.toLowerCase().includes(q);
        const inAddress = p.address.toLowerCase().includes(q);
        const inContent = stripHtml(p.content).includes(q);
        const inSpecialty = (p.specialties || []).some((s) => s.toLowerCase().includes(q));
        const matches = inTitle || inCompany || inAddress || inContent || inSpecialty;
        const score = inTitle ? 3 : (inCompany ? 2 : (inSpecialty ? 1 : 0));
        return { p, matches, score };
      });
      result = withScore
        .filter((x) => x.matches)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p);
    }

    // Sort by distance if user location is set
    if (userLocation) {
      result = [...result].sort((a, b) => {
        const da = (a.lat && a.lng) ? haversine(userLocation.lat, userLocation.lng, a.lat, a.lng) : 99999;
        const db = (b.lat && b.lng) ? haversine(userLocation.lat, userLocation.lng, b.lat, b.lng) : 99999;
        return da - db;
      });
    }

    return result;
  }, [posts, search, city, specialty, userLocation]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function handleSearch(e) { setSearch(e.target.value); setPage(1); }
  function handleCity(e) { setCity(e.target.value); setPage(1); }

  const handleNearMe = useCallback((location = "search") => {
    if (userLocation) { setUserLocation(null); setPage(1); return; }
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "near_me_click", {
        event_category: "engagement",
        event_label: location,
      });
    }
    if (!navigator.geolocation) return;
    const cached = cachedLocRef.current;
    if (cached && Date.now() - cached.ts < 10 * 60 * 1000) {
      setUserLocation({ lat: cached.lat, lng: cached.lng });
      setPage(1);
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() };
        cachedLocRef.current = loc;
        setUserLocation({ lat: loc.lat, lng: loc.lng });
        setLocLoading(false);
        setPage(1);
      },
      () => setLocLoading(false)
    );
  }, [userLocation]);

  return (
    <>
      {/* Map Modal */}
      {mapPost && (
        <div className="map-modal-overlay" onClick={() => setMapPost(null)}>
          <div className="map-modal" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal-header">
              <div>
                <div className="map-modal-name">{mapPost.companyName}</div>
                {mapPost.address && <div className="map-modal-address">{mapPost.address.replace(", USA", "")}</div>}
              </div>
              <button className="map-modal-close" onClick={() => setMapPost(null)}>✕</button>
            </div>
            <div className="map-modal-body">
              {mapPost.lat && mapPost.lng ? (
                <iframe
                  title={mapPost.companyName}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${mapPost.lat},${mapPost.lng}&z=15&output=embed`}
                />
              ) : (
                <iframe
                  title={mapPost.companyName}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapPost.address || mapPost.companyName)}&output=embed`}
                />
              )}
            </div>
            <div className="map-modal-footer">
              <a
                href={mapPost.lat && mapPost.lng
                  ? `https://www.google.com/maps/search/?api=1&query=${mapPost.lat},${mapPost.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapPost.address || mapPost.companyName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-modal-directions"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="posts-toolbar">
        {/* Red 1: Search + Near Me */}
        <div className="toolbar-search-grp">
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search plumber, service or city..."
              value={search}
              onChange={handleSearch}
              autoComplete="off"
            />
            {search && (
              <button className="search-clear" onClick={() => { setSearch(""); setPage(1); }}>✕</button>
            )}
          </div>
          <button
            className={`near-me-btn ${userLocation ? "near-me-btn-active" : ""}`}
            onClick={() => handleNearMe("search")}
            title={userLocation ? "Clear location filter" : "Sort plumbers by distance from you"}
          >
            {locLoading ? (
              <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            )}
            {locLoading ? "Locating..." : userLocation ? "Near Me ✓" : "Near Me"}
          </button>
        </div>

        {/* Red 2: All cities + All specialties */}
        <div className="toolbar-filter-grp">
          <select className="city-select" value={city} onChange={handleCity}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <SpecialtyToggle specialty={specialty} onSelect={(s) => { setSpecialty(s); setPage(1); }} />
          <span className="section-count">
            {filtered.length} {filtered.length === 1 ? "plumber" : "plumbers"}
          </span>
        </div>
      </div>


      {filtered.length === 0 && (
        <p className="portal-muted">
          {search ? `No results for "${search}".` : "No plumbers found."}
        </p>
      )}

      <div className="posts-grid" id="plumber-list">
        {paginated.map((post) => {
          const dist = userLocation && post.lat && post.lng
            ? haversine(userLocation.lat, userLocation.lng, post.lat, post.lng)
            : null;
          return (
            <div key={post._id} className="post-card">
              <a href={`/post/${post.slug || post._id}`} className="post-card-link">
                <div className="post-card-img-wrap">
                  {post.imageUrl && (
                    <img src={imgUrl(post.imageUrl)} alt={post.title} className="post-card-img" />
                  )}
                  {dist !== null && (
                    <span className="distance-badge">{dist < 1 ? `${(dist * 5280).toFixed(0)} ft` : `${dist.toFixed(1)} mi`}</span>
                  )}
                </div>
                <div className="post-card-body">
                  <span className="post-company">{post.companyName}</span>
                  <h2 className="post-card-title">{post.title}</h2>
                  <p className="post-card-excerpt">
                    {post.content.slice(0, 250).replace(/\s\S*$/, "") + "…"}
                  </p>
                  <div className="post-card-actions">
                    {post.phone ? (
                      <div className="post-card-phone-row">
                        <span
                          className="post-card-call-btn"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${post.phone}`; }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          <span className="call-now-label">Call Now!</span>
                          <span className="post-card-phone-num">{post.phone}</span>
                        </span>
                        <button
                          className={`post-card-action-btn ${copiedId === post._id ? "post-card-action-btn--copied" : ""}`}
                          onClick={(e) => handleCopy(e, post.phone, post._id)}
                          title="Copy phone number"
                        >
                          {copiedId === post._id ? (
                            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                          )}
                        </button>
                        {(post.lat || post.address) && (
                          <button className="post-card-action-btn post-card-action-btn--map" onClick={(e) => handleMapOpen(e, post)} title="Show on map">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (post.lat || post.address) ? (
                      <button className="post-card-action-btn post-card-action-btn--map" onClick={(e) => handleMapOpen(e, post)} title="Show on map">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      </button>
                    ) : null}
                  </div>
                  <div className="post-card-meta">
                    <div className="post-meta-left">
                      {post.rating && (
                        <StarRating rating={post.rating} count={post.reviewCount} />
                      )}
                      {extractCity(post.address) && (
                        <span className="post-city">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {extractCity(post.address)}
                        </span>
                      )}
                    </div>
                    <div className="post-meta-right">
                      <span className="post-views">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {post.viewCount}
                      </span>
                      <span className="post-card-read-more">Click for details →</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
          {(() => {
            const MAX = 4;
            let start = Math.max(1, currentPage - Math.floor(MAX / 2));
            let end = Math.min(totalPages, start + MAX - 1);
            if (end - start + 1 < MAX) start = Math.max(1, end - MAX + 1);
            return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((n) => (
              <button key={n} className={`page-btn ${n === currentPage ? "page-btn-active" : ""}`} onClick={() => setPage(n)}>{n}</button>
            ));
          })()}
          {Math.min(totalPages, Math.max(1, currentPage - Math.floor(4 / 2)) + 4 - 1) < totalPages && (
            <span className="page-ellipsis">… {totalPages}</span>
          )}
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
        </div>
      )}
    </>
  );
}
