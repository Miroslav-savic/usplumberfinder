import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://usplumberfinder.com"),
  title: {
    default: "Plumber Finder — Find Plumbers Near You",
    template: "%s | Plumber Finder",
  },
  description: "Search and find licensed plumbers, plumbing services, and contractors near you across the United States. Contacts, locations, and service descriptions.",
  keywords: "find plumbers near me, plumber USA, plumbing service, emergency plumber, pipe repair, drain cleaning, water heater, plumber near me",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Plumber Finder",
    url: "https://usplumberfinder.com",
    title: "Plumber Finder — Find Plumbers Near You",
    description: "Search and find licensed plumbers and plumbing services across the United States.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Plumber Finder",
  alternateName: "Plumber Finder — Find Plumbers Near You",
  url: "https://usplumberfinder.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://usplumberfinder.com/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TPN5K3SNRM" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TPN5K3SNRM');
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
