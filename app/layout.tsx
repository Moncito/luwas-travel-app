import { Montserrat } from 'next/font/google';
import './globals.css';
import LayoutWithLoader from './components/LayoutWithLoader';

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
        <LayoutWithLoader>{children}</LayoutWithLoader>
      </body>
    </html>
  );
}
