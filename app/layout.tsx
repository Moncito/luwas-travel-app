// app/layout.tsx
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
// import Navbar from "@/components/Navbar"

const montserrat = Montserrat({
  weight: '400', // Specify the desired font weight
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'Luwas',
  description: 'Travel Agency for Filipinos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className={`${montserrat.className} antialiased pattern`}>
        {/* <Navbar/> */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
