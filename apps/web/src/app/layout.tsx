import type { Metadata, Viewport } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import { Providers } from './providers';
import { Header, Footer } from '@/components/layout';
import './globals.css';

// Body font — modern humanist sans with full Cyrillic support
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

// Display font for headings — distinctive geometric, full Cyrillic
const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-unbounded',
});

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
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${manrope.variable} ${unbounded.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('theme-storage');
                  if (raw) {
                    var parsed = JSON.parse(raw);
                    var theme = parsed.state && parsed.state.theme;
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (theme === 'system') {
                      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                      }
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
