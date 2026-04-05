"use client";
import { useState, useEffect, useRef } from "react";
import { extractCity } from "@/lib/extractCity";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SearchDropdown({ onSelect, placeholder = "Search plumbers, services, cities…" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); setOpen(false); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/posts/public/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Zatvori dropdown kad se klikne van
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(post) {
    setQuery("");
    setOpen(false);
    setResults([]);
    if (onSelect) onSelect(post);
    else window.location.href = `/post/${post.slug || post._id}`;
  }

  return (
    <div className="search-dropdown-wrap" ref={wrapRef}>
      <div className="search-dropdown-input-wrap">
        <svg className="search-dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="search-dropdown-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && <span className="search-dropdown-spinner" />}
        {query && (
          <button className="search-dropdown-clear" onClick={() => { setQuery(""); setOpen(false); }}>✕</button>
        )}
      </div>

      {open && (
        <ul className="search-dropdown-list">
          {results.map((post) => {
            const city = extractCity(post.address);
            return (
              <li key={post._id} className="search-dropdown-item" onMouseDown={() => handleSelect(post)}>
                <span className="search-dropdown-name">{post.companyName}</span>
                {city && <span className="search-dropdown-city">{city}</span>}
                {(post.specialties || []).length > 0 && (
                  <span className="search-dropdown-spec">{post.specialties.slice(0, 2).join(", ")}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
