// File: app/layout.tsx
import { Montserrat } from "next/font/google";
import "./globals.css";
import LayoutWithLoader from "./components/LayoutWithLoader";
import ChatWidgetWrapper from "@/components/ChatWidgetWrapper";
import PromoPopup from "@/components/PromoPopup";

const montserrat = Montserrat({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Luwas Travel & Tours | Discover the Philippines with Ease",
  description:
    "Luwas Travel & Tours helps you discover and plan unforgettable trips across the Philippines — from Palawan to Baguio. Book tours, manage itineraries, and explore with confidence.",
  keywords: [
    "Philippine travel agency",
    "Luwas Travel",
    "tour packages Philippines",
    "book travel online",
    "Philippine tours",
    "island hopping",
    "Filipino travel planner",
    "vacation packages Philippines",
  ],
  authors: [{ name: "Luwas Travel & Tours", url: "https://luwas-travel.tours" }],
  creator: "Luwas Travel & Tours",
  publisher: "Luwas Travel & Tours",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
  metadataBase: new URL("https://luwas-travel.tours"),
  alternates: {
    canonical: "https://luwas-travel.tours",
  },
  openGraph: {
    title: "Luwas Travel & Tours",
    description:
      "Discover, plan, and travel with ease through Luwas — your trusted Filipino travel agency.",
    url: "https://luwas-travel.tours",
    siteName: "Luwas Travel & Tours",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Luwas Travel & Tours — Explore the Philippines",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@luwas_travel",
    creator: "@luwas_travel",
    title: "Luwas Travel & Tours — Discover the Philippines",
    description:
      "Travel smarter with Luwas. Plan your trips, manage bookings, and explore the best of the Philippines.",
    images: ["/og-image.png"],
  },
  themeColor: "#0A84FF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        {/* ✅ Structured Data for Google Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Luwas Travel & Tours",
              url: "https://luwas-travel.tours",
              logo: "https://luwas-travel.tours/logo.ico",
              sameAs: [
                "https://facebook.com/luwastravel",
                "https://instagram.com/luwas.travel",
                "https://twitter.com/luwas_travel",
              ],
              description:
                "Luwas Travel & Tours offers Filipino travelers easy online booking, curated itineraries, and reliable support for exploring the Philippines.",
              address: {
                "@type": "PostalAddress",
                addressCountry: "PH",
              },
            }),
          }}
        />
      </head>
      <body className={`${montserrat.className} antialiased pattern`}>
        <LayoutWithLoader>{children}</LayoutWithLoader>

        {/* Global widgets */}
        <ChatWidgetWrapper />
        <PromoPopup
          images={["/images/back1.png", "/images/back2.png"]}
          link="/promos"
        />
      </body>
    </html>
  );
}
