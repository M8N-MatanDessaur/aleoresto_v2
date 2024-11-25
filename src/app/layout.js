import localFont from "next/font/local";
import "./globals.css";

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
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'aléoresto Logo',
      },
    ],
  },
  icons: {
    icon: '/logo.ico',
    apple: [
      { url: '/logo.png' },
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
      <body>
        {children}
      </body>
    </html>
  );
}
