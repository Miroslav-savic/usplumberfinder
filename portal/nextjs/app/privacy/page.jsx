import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Plumber Finder — how we collect, use, and protect your information.",
  alternates: { canonical: "https://usplumberfinder.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="static-page">
      <nav className="detail-nav">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size="sm" />
        </Link>
      </nav>

      <main className="static-container">
        <h1>Privacy Policy</h1>
        <p className="static-date">Last updated: April 2026</p>

        <p>
          This Privacy Policy describes how Plumber Finder ("we", "us", or "our") collects, uses, and shares information when you use our website at <strong>usplumberfinder.com</strong>.
        </p>

        <h2>Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li><strong>Usage data:</strong> Pages visited, time spent, browser type, and device information collected automatically via analytics tools.</li>
          <li><strong>Location data:</strong> If you use the "Near Me" feature, your browser shares your approximate location with us to show nearby plumbers. This data is not stored on our servers.</li>
          <li><strong>Contact information:</strong> If you contact us via email, we receive your email address and message content.</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To provide and improve our directory service</li>
          <li>To analyze usage patterns and improve user experience</li>
          <li>To respond to your inquiries</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p>We may use analytics services that collect anonymized usage data to help us improve the site. No personal data is sold to third parties.</p>

        <h2>Cookies</h2>
        <p>
          Our website may use cookies for analytics purposes. You can control cookie preferences through your browser settings.
        </p>

        <h2>Data Retention</h2>
        <p>
          We do not store personal data beyond what is necessary to operate the service.
        </p>

        <h2>Your Rights</h2>
        <p>
          You have the right to request access to, correction of, or deletion of any personal data we hold about you. Contact us at <a href="mailto:business.smartdev@gmail.com">business.smartdev@gmail.com</a>.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, contact us at <a href="mailto:business.smartdev@gmail.com">business.smartdev@gmail.com</a>.
        </p>

        <p className="static-back">
          <Link href="/">← Back to Plumber Finder</Link>
        </p>
      </main>
    </div>
  );
}
