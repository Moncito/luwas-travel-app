// app/layout.tsx
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';

const montserrat = Montserrat({
  weight: '400',
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
        <ScrollToTop />
        <PageLoader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
