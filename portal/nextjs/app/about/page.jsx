import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "About Us",
  description: "Learn about Plumber Finder — a free directory helping customers find licensed plumbers, plumbing contractors, and emergency plumbing services across the United States.",
  alternates: { canonical: "https://usplumberfinder.com/about" },
};

export default function AboutPage() {
  return (
    <div className="static-page">
      <nav className="detail-nav">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size="sm" />
        </Link>
      </nav>

      <main className="static-container">
        <h1>About Plumber Finder</h1>

        <p>
          Plumber Finder is a free online directory designed to help customers across the United States quickly find licensed plumbers, plumbing contractors, and emergency plumbing services near them.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe that finding a reliable plumber should be simple. Our goal is to provide accurate, up-to-date information about plumbing professionals — including location, contact details, services offered, and hours of operation — so customers can make informed decisions fast.
        </p>

        <h2>What We Offer</h2>
        <ul>
          <li>A searchable directory of plumbers across the United States</li>
          <li>Filter by city, service type, or distance from your location</li>
          <li>Plumber details including address, phone, website, and hours</li>
          <li>Customer reviews and ratings</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          Have a question, want to list your plumbing business, or found incorrect information? Reach out at{" "}
          <a href="mailto:business.smartdev@gmail.com">business.smartdev@gmail.com</a>.
        </p>

        <p className="static-back">
          <Link href="/">← Back to Plumber Finder</Link>
        </p>
      </main>
    </div>
  );
}
