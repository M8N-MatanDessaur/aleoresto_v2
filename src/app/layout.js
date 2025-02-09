import "./globals.css";
import Script from 'next/script';
import PWALifecycle from '@/components/PWALifecycle';

export const metadata = {
  metadataBase: new URL('https://www.aleoresto.ca'),
  title: {
    default: 'aléoresto - Discover the most quirky restaurants in town!',
    template: '%s | aléoresto'
  },
  description: 'Discover the quirkiest and most appetizing restaurants in town with aléoresto, the app that will make your taste buds dance with joy!',
  keywords: [
    'quirky restaurants',
    'aléoresto',
    'taste buds',
    'restaurants',
    'culinary discoveries',
    'food finder',
    'restaurant discovery',
    'local eats'
  ],
  authors: [{ name: 'Matan Dessaur' }],
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'aléoresto',
    title: 'aléoresto',
    description: 'Discover the quirkiest and most appetizing restaurants in town with aléoresto, the app that will make your taste buds dance with joy!',
    url: 'https://www.aleoresto.ca',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'aléoresto Logo',
      },
    ],
  },
  icons: {
    icon: '/logo.ico',
    apple: [
      { url: '/logo.svg' },
    ],
  },
  other: {
    'google': 'notranslate',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black',
    'apple-mobile-web-app-title': 'aléoresto',
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <PWALifecycle />
        {children}
      </body>
    </html>
  );
}
