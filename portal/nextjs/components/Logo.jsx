export default function Logo({ size = "md", white = false }) {
  const sizes = { sm: 30, md: 38, lg: 52 };
  const h = sizes[size];
  const wordColor = white ? "#fff" : "#0f172a";
  const subColor = white ? "rgba(255,255,255,0.55)" : "#94a3b8";
  const accentColor = "#f97316";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: h * 0.3 + "px", userSelect: "none" }}>
      <svg width={h} height={h} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pf-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#pf-bg)" />
        <g transform="translate(8,8)">
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            fill="rgba(255,255,255,0.92)"
          />
          <circle cx="5" cy="19" r="1.2" fill="#f97316" />
        </g>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1px" }}>
          <span style={{ fontSize: h * 0.42 + "px", fontWeight: 400, color: wordColor, letterSpacing: "-0.01em" }}>plumber</span>
          <span style={{ fontSize: h * 0.42 + "px", fontWeight: 800, color: accentColor, letterSpacing: "-0.02em" }}>Finder</span>
        </div>
        {size !== "sm" && (
          <span style={{ fontSize: h * 0.19 + "px", fontWeight: 500, color: subColor, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>
            find plumbers near you
          </span>
        )}
      </div>
    </div>
  );
}
