import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'RaadArenda - Event Equipment Rental',
  description: 'Event equipment rental in Tashkent. Furniture, decor, lighting, sound and more for weddings, corporate events and celebrations.',
  keywords: ['rental', 'event', 'wedding', 'furniture', 'Tashkent', 'party', 'equipment'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
