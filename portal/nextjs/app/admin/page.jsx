"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getAdminPosts, setPostStatus, deletePost, reorderPosts, imgUrl } from "@/lib/api";
import PostEditor from "@/components/PostEditor";
import Logo from "@/components/Logo";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function SortableRow({ post, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    background: isDragging ? "#f0f7ff" : undefined,
  };
  return (
    <tr ref={setNodeRef} style={style}>
      <td className="drag-handle-cell">
        <span className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">⠿</span>
      </td>
      <td>
        {post.imageUrl
          ? <img src={imgUrl(post.imageUrl)} alt="" className="admin-thumb" />
          : <div className="admin-thumb-empty" />}
      </td>
      <td className="admin-post-title">{post.title}</td>
      <td>{post.companyName}</td>
      <td>{formatDate(post.createdAt)}</td>
      <td>{post.viewCount}</td>
      <td>
        <span className={`badge badge-${post.status}`}>
          {post.status === "active" ? "Active" : "Paused"}
        </span>
      </td>
      <td className="admin-actions">
        <button className={post.status === "active" ? "btn-warn" : "btn-success"} onClick={() => onToggle(post)}>
          {post.status === "active" ? "Pause" : "Activate"}
        </button>
        <button className="btn-secondary" onClick={() => onEdit(post)}>Edit</button>
        <button className="btn-danger" onClick={() => onDelete(post._id)}>Delete</button>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const t = sessionStorage.getItem("token");
    if (!t) { router.replace("/admin/login"); return; }
    setToken(t);
    loadPosts(t);
  }, []);

  async function loadPosts(t) {
    setLoading(true);
    try { setPosts(await getAdminPosts(t)); }
    finally { setLoading(false); }
  }

  async function toggleStatus(post) {
    const next = post.status === "active" ? "paused" : "active";
    const updated = await setPostStatus(token, post._id, next);
    setPosts((p) => p.map((x) => (x._id === updated._id ? updated : x)));
  }

  async function handleDelete(id) {
    if (!confirm("Delete this post?")) return;
    await deletePost(token, id);
    setPosts((p) => p.filter((x) => x._id !== id));
  }

  function handleSaved(post) {
    setPosts((p) => {
      const exists = p.find((x) => x._id === post._id);
      return exists ? p.map((x) => (x._id === post._id ? post : x)) : [post, ...p];
    });
    setEditing(null);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = posts.findIndex((p) => p._id === active.id);
    const newIndex = posts.findIndex((p) => p._id === over.id);
    const reordered = arrayMove(posts, oldIndex, newIndex);
    setPosts(reordered);
    await reorderPosts(token, reordered.map((p, i) => ({ id: p._id, order: i })));
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    router.push("/admin/login");
  }

  const filtered = search.trim()
    ? posts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.companyName.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  if (editing !== null) {
    return (
      <PostEditor
        token={token}
        post={editing === "new" ? null : editing}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Logo size="sm" white />
          <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>Admin Panel</span>
        </div>
        <div className="admin-header-actions">
          <button className="btn-primary" onClick={() => setEditing("new")}>+ New Post</button>
          <button className="btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-toolbar">
          <div className="search-wrap" style={{ maxWidth: 320 }}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by title or clinic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <span className="section-count">{filtered.length} posts</span>
        </div>

        {loading && <p className="portal-muted">Loading...</p>}
        {!loading && posts.length === 0 && <p className="portal-muted">No posts yet. Create the first one!</p>}
        {!loading && posts.length > 0 && filtered.length === 0 && <p className="portal-muted">No results for "{search}".</p>}

        {filtered.length > 0 && (
          <div className="admin-table-wrap">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map((p) => p._id)} strategy={verticalListSortingStrategy}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="drag-col"></th>
                      <th>Image</th><th>Title</th><th>Clinic</th>
                      <th>Date</th><th>Views</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((post) => (
                      <SortableRow key={post._id} post={post} onToggle={toggleStatus} onEdit={setEditing} onDelete={handleDelete} />
                    ))}
                  </tbody>
                </table>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </main>
    </div>
  );
}
