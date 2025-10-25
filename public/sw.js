// LifeSync Service Worker - Minimal PWA Support
const CACHE_NAME = 'lifesync-v1.0.3';
const ASSETS = ['/manifest.json', '/icon-192x192.png', '/icon-512x512.png'];

self.addEventListener('install', (e) => {
  console.log('[SW] Installing');
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Activating');
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;
  
  const url = new URL(e.request.url);
  
  // Skip webpack HMR
  if (url.pathname.startsWith('/_next/webpack') || url.pathname.includes('hot-update')) return;
  
  // Only cache manifest and icons
  if (url.pathname === '/manifest.json' || url.pathname.includes('icon-')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
    return;
  }
  
  // For all other requests, just fetch from network (no caching, no offline handling)
  // Let the browser handle it naturally
});