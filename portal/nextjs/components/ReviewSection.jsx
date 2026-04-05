"use client";
import { useState, useEffect } from "react";
import { getReviews, submitReview } from "@/lib/api";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker">
      {[1,2,3,4,5].map((i) => (
        <button
          key={i}
          type="button"
          className="star-pick-btn"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24"
            fill={i <= (hover || value) ? "#f59e0b" : "none"}
            stroke="#f59e0b" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }) {
  const stars = Math.round(rating);
  return (
    <span className="star-display">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= stars ? "#f59e0b" : "none"}
          stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso) {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function ReviewSection({ postId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getReviews(postId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    setError("");
    setSubmitting(true);
    try {
      const review = await submitReview(postId, { rating, author: author.trim(), comment: comment.trim() });
      setReviews((prev) => [review, ...prev]);
      setSubmitted(true);
      setRating(0);
      setAuthor("");
      setComment("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="review-section">
      <h3 className="review-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        Patient Reviews
      </h3>

      {!submitted ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-row">
            <div className="review-form-field">
              <label>Your rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div className="review-form-field" style={{ flex: 1 }}>
              <label>Your name <span className="opt">(optional)</span></label>
              <input
                className="review-input"
                placeholder="Anonymous"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>
          <div className="review-form-field">
            <label>Comment <span className="opt">(optional)</span></label>
            <textarea
              className="review-textarea"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
            />
          </div>
          {error && <p className="review-error">{error}</p>}
          <button type="submit" className="review-submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="review-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Thank you for your review!
          <button className="review-another" onClick={() => setSubmitted(false)}>Write another</button>
        </div>
      )}

      <div className="reviews-list">
        {loading && <p className="review-muted">Loading reviews...</p>}
        {!loading && reviews.length === 0 && (
          <p className="review-muted">No reviews yet. Be the first!</p>
        )}
        {reviews.map((r) => (
          <div key={r._id} className="review-item">
            <div className="review-item-header">
              <span className="review-author">{r.author || "Anonymous"}</span>
              <StarDisplay rating={r.rating} />
              <span className="review-date">{fmtDate(r.createdAt)}</span>
            </div>
            {r.comment && <p className="review-comment">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
