import NextPWA from 'next-pwa';

const withPWA = NextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  scope: '/',
  swDest: 'sw.js'
});

const config = {
  // your other config options
};

export default withPWA(config);