"use client";
import { useEffect } from "react";
import { incrementBlogView } from "@/lib/api";

export default function BlogViewTracker({ id }) {
  useEffect(() => {
    const key = `blog_viewed_${id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      incrementBlogView(id);
    }
  }, [id]);

  return null;
}
