import './globals.css';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Telugu, Noto_Serif_Display } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BottomNav } from '@/components/bottom-nav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const telugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  variable: '--font-telugu',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const display = Noto_Serif_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Evergreen Ayurveda — Ancient Wisdom. Modern Understanding.',
    template: '%s | Evergreen Ayurveda',
  },
  description:
    'Explore timeless Indian wellness traditions through beautifully designed ebooks, guides and educational resources in Telugu and English.',
  keywords: [
    'Ayurveda',
    'Telugu Ayurveda',
    'Ayurvedic ebooks',
    'Indian herbs',
    'wellness',
    'traditional medicine',
    'yoga',
    'meditation',
    'Dinacharya',
    'doshas',
  ],
  openGraph: {
    type: 'website',
    title: 'Evergreen Ayurveda — Ancient Wisdom. Modern Understanding.',
    description:
      'Explore Ayurveda, herbs, traditional wellness knowledge and beautifully crafted ebooks in Telugu and English.',
    siteName: 'Evergreen Ayurveda',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evergreen Ayurveda',
    description:
      'Explore Ayurveda, herbs, traditional wellness knowledge and beautifully crafted ebooks in Telugu and English.',
  },
  alternates: {
    languages: {
      en: '/',
      te: '/',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${telugu.variable} ${display.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16 pb-20 lg:pb-0">{children}</main>
            <Footer />
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
