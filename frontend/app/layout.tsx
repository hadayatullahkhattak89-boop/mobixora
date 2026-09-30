import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mobixora — Smart Tech. Better Life. | Smartphones & Mobile Accessories',
  description:
    'Mobixora is Pakistan’s leading online technology store for PTA-approved smartphones, Apple iPhones, Samsung flagships, GaN fast chargers, wireless earbuds, and premium mobile accessories with fast delivery nationwide.',
  keywords: [
    'Mobixora',
    'Smartphones Pakistan',
    'iPhones Pakistan',
    'Samsung Galaxy Pakistan',
    'GaN Fast Chargers',
    'Wireless Earbuds',
    'AirPods Pro',
    'Power Banks',
    'Spigen Mobile Covers',
    'PTA Approved Mobile Store',
    'Cash on Delivery Pakistan',
  ],
  authors: [{ name: 'Mobixora Technologies' }],
  openGraph: {
    title: 'Mobixora — Smart Tech. Better Life.',
    description:
      'Discover the latest smartphones and premium mobile accessories at great prices. Authentic PTA-approved flagships with fast nationwide delivery in Pakistan.',
    siteName: 'Mobixora',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-cyan-500 selection:text-white">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
