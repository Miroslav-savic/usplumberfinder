"use client";
import { useEffect } from "react";
import { incrementView } from "@/lib/api";

export default function ViewTracker({ id }) {
  useEffect(() => {
    const key = `viewed_${id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      incrementView(id);
    }
  }, [id]);

  return null;
}
