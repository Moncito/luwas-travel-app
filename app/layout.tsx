// File: app/layout.tsx
import { Montserrat } from "next/font/google";
import "./globals.css";
import LayoutWithLoader from "./components/LayoutWithLoader";
import ChatWidgetWrapper from "@/components/ChatWidgetWrapper";
import PromoPopup from "@/components/PromoPopup"; // ✅ import popup

const montserrat = Montserrat({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Luwas Travel & Tours",
  description: "Traveling beyond borders — your trusted Filipino travel agency.",
  icons: {
    icon: "/logo.ico",
  },
  openGraph: {
    title: "Luwas Travel & Tours",
    description: "Discover, plan, and travel with ease through Luwas.",
    url: "https://luwas-travel.tours",
    siteName: "Luwas Travel & Tours",
    images: [
      {
        url: "/og-image.png", // ✅ Place this file inside /public
        width: 1200,
        height: 630,
        alt: "Luwas Travel & Tours Preview",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luwas Travel & Tours",
    description: "Traveling beyond borders with Luwas.",
    images: ["/og-image.png"], // ✅ same image for Twitter preview
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
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
