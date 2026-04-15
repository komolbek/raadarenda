import type { Metadata, Viewport } from 'next';
import { Lora, Playfair_Display } from 'next/font/google';
import { Providers } from './providers';
import { Header, Footer } from '@/components/layout';
import './globals.css';

// Body serif — refined, readable, full Cyrillic support
const bodySerif = Lora({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-body',
});

// Display serif — high-contrast, serious, with a strong italic cut used on headings
const displaySerif = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
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
      className={`${bodySerif.variable} ${displaySerif.variable}`}
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
