'use client';

import { useEffect } from 'react';

export default function PWALifecycle() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('controllerchange', () => {
          if (window.confirm('New version available! Reload to update?')) {
            window.location.reload();
          }
        });
      });
    }
  }, []);

  return null;
}
