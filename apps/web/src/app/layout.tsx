import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Header, Footer } from '@/components/layout';
import './globals.css';

export const metadata: Metadata = {
  title: '4Event - Event Equipment Rental',
  description: 'Rent event equipment easily with 4Event',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
