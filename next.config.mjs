import NextPWA from 'next-pwa';

const withPWA = NextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/www\.aleoresto\.ca\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'aleoresto-dynamic',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(js|css)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'aleoresto-static',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'aleoresto-images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    }
  ],
  buildExcludes: [/middleware-manifest\.json$/],
  precachePages: ['/'],
  fallbacks: {
    document: '/_offline'
  }
});

const config = {
  // your existing config
};

export default withPWA(config);