"use client";
import { useState } from "react";
import { submitAppointment } from "@/lib/api";

export default function AppointmentForm({ postId, clinicName }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError("Name and email are required."); return; }
    setError("");
    setLoading(true);
    try {
      await submitAppointment(postId, { name: name.trim(), email: email.trim(), phone, date, message });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-clinic-section">
      <div className="contact-clinic-header">
        <div className="contact-clinic-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <div>
          <h3 className="contact-clinic-title">Contact {clinicName}</h3>
          <p className="contact-clinic-sub">Send a message and the clinic will get back to you shortly.</p>
        </div>
      </div>

      {sent ? (
        <div className="contact-clinic-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Message sent! The clinic will reach out to you soon.
        </div>
      ) : (
        <form className="contact-clinic-form" onSubmit={handleSubmit}>
          <div className="appt-row">
            <div className="appt-field">
              <label>Your Name <span className="req">*</span></label>
              <input className="appt-input" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            </div>
            <div className="appt-field">
              <label>Email <span className="req">*</span></label>
              <input className="appt-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
            </div>
          </div>
          <div className="appt-row">
            <div className="appt-field">
              <label>Phone <span className="opt">(optional)</span></label>
              <input className="appt-input" type="tel" placeholder="+1 555 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
            </div>
            <div className="appt-field">
              <label>Preferred Date <span className="opt">(optional)</span></label>
              <input className="appt-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="appt-field">
            <label>Message <span className="opt">(optional)</span></label>
            <textarea className="appt-textarea" placeholder="How can this clinic help you? Describe your concern..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={1000} />
          </div>
          {error && <p className="appt-error">{error}</p>}
          <button type="submit" className="appt-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
