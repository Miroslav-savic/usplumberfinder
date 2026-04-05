"use client";

export default function BookAppointmentBtn({ href, clinicName, city }) {
  function handleClick() {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "book_appointment_click", {
        event_category: "engagement",
        event_label: clinicName,
        clinic_name: clinicName,
        clinic_city: city || "",
      });
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="book-appointment-btn"
      onClick={handleClick}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
      Book Appointment
    </a>
  );
}
