import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'RaadArenda - Tadbirlar uchun ijara',
  description: 'Toshkentda tadbirlar uchun jihozlar ijarasi. Mebel, dekor, yorug\'lik, ovoz va boshqalar.',
  keywords: ['ijara', 'arenda', 'tadbir', 'to\'y', 'mebel', 'Toshkent'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
