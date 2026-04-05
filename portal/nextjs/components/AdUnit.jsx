"use client";
import { useEffect, useRef } from "react";

export default function AdUnit({ slot, format = "auto", style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    try {
      if (ref.current && ref.current.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {}
  }, []);

  return (
    <div ref={ref} style={{ overflow: "hidden", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-8214154345204394"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
