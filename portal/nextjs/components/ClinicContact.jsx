"use client";

function track(eventName, plumberName, city) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      event_category: "conversion",
      event_label: plumberName,
      plumber_name: plumberName,
      plumber_city: city || "",
    });
  }
}

function websiteHostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url.replace(/^https?:\/\/(www\.)?/, ""); }
}

export default function ClinicContact({ phone, email, website, workingHours, specialties, companyName, city }) {
  const hasContact = phone || email || website || workingHours || (specialties || []).length > 0;
  if (!hasContact) return null;

  return (
    <div className="detail-contact">
      {(specialties || []).length > 0 && (
        <div className="detail-contact-specialties">
          {specialties.map((s) => (
            <span key={s} className="detail-specialty">{s}</span>
          ))}
        </div>
      )}
      <div className="detail-contact-row">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="detail-contact-item"
            onClick={() => track("phone_click", companyName, city)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            {phone}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="detail-contact-item"
            onClick={() => track("email_click", companyName, city)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,12 2,6"/>
            </svg>
            {email}
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-contact-item"
            onClick={() => track("website_click", companyName, city)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            {websiteHostname(website)}
          </a>
        )}
        {workingHours && (
          <div className="detail-contact-item detail-hours">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {workingHours}
          </div>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="book-appointment-btn"
            onClick={() => track("book_appointment_click", companyName, city)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Book Appointment
          </a>
        )}
      </div>
    </div>
  );
}
