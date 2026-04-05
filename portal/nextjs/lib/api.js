// Server-side: use internal URL directly (bypasses nginx)
// Client-side: use public URL through nginx
const INTERNAL = process.env.API_INTERNAL_URL || "http://localhost:4001";
const BASE = (typeof window === "undefined"
  ? INTERNAL
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001")) + "/api";
export const MEDIA = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export function imgUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${MEDIA}${path}`;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// Posts — public (cache: no-store for always-fresh SSR)
export async function getPublicPosts() {
  const res = await fetch(`${BASE}/posts/public`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function getPublicPost(id) {
  const res = await fetch(`${BASE}/posts/public/${id}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function getPublicPostBySlug(slug) {
  const res = await fetch(`${BASE}/posts/public/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function getRelatedPosts(slug) {
  const res = await fetch(`${BASE}/posts/public/slug/${encodeURIComponent(slug)}/related`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function incrementView(id) {
  await fetch(`${BASE}/posts/public/${id}/view`, { method: "PATCH" });
}

export async function likePost(id) {
  const res = await fetch(`${BASE}/posts/public/${id}/like`, { method: "PATCH" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// Posts — admin
export async function getAdminPosts(token) {
  const res = await fetch(`${BASE}/posts`, { headers: authHeaders(token), cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function createPost(token, formData) {
  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function updatePost(token, id, formData) {
  const res = await fetch(`${BASE}/posts/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function setPostStatus(token, id, status) {
  const res = await fetch(`${BASE}/posts/${id}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function uploadInlineImage(token, file) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${BASE}/posts/upload-image`, {
    method: "POST",
    headers: authHeaders(token),
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function reorderPosts(token, items) {
  const res = await fetch(`${BASE}/posts/reorder/bulk`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function deletePost(token, id) {
  const res = await fetch(`${BASE}/posts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// Reviews
export async function getReviews(postId) {
  const res = await fetch(`${BASE}/posts/public/${postId}/reviews`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function submitReview(postId, payload) {
  const res = await fetch(`${BASE}/posts/public/${postId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// Appointment
export async function submitAppointment(postId, payload) {
  const res = await fetch(`${BASE}/posts/public/${postId}/appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}
