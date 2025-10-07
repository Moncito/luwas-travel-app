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
  title: "Luwas",
  description: "Travel Agency for Filipinos",
  icons: {
    icon: '/logo.ico',
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
