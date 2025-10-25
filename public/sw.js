// LifeSync Service Worker with AI Integration
const CACHE_NAME = 'lifesync-v1.0.0';
const STATIC_CACHE = 'lifesync-static-v1';
const DYNAMIC_CACHE = 'lifesync-dynamic-v1';
const API_CACHE = 'lifesync-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline'
  // Note: Pages and Next.js assets will be cached on first visit
];

// API endpoints that can be cached
const CACHEABLE_APIS = [
  '/api/ai/categorize',
  '/api/ai/suggestions',
  '/api/sync/status'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      // Cache assets one by one to handle failures gracefully
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(new Request(url, { credentials: 'same-origin' }))
            .catch(err => console.log('[SW] Failed to cache:', url, err))
        )
      );
    }).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    }).catch(err => {
      console.error('[SW] Installation failed:', err);
      return self.skipWaiting(); // Continue anyway
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete');
    })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStaticAssets(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // Check if this API endpoint should be cached
  const shouldCache = CACHEABLE_APIs.some(api => url.pathname.startsWith(api));

  if (shouldCache) {
    return cacheFirstStrategy(request, API_CACHE);
  } else {
    return networkFirstStrategy(request, API_CACHE);
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  return cacheFirstStrategy(request, STATIC_CACHE);
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  return networkFirstStrategy(request, DYNAMIC_CACHE);
}

// Cache-first strategy (good for static assets)
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[SW] Serving from cache:', request.url);
      return cached;
    }

    console.log('[SW] Fetching and caching:', request.url);
    const response = await fetch(request);

    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    return getOfflineResponse(request);
  }
}

// Network-first strategy (good for dynamic content)
async function networkFirstStrategy(request, cacheName) {
  try {
    console.log('[SW] Network first for:', request.url);
    const response = await fetch(request);

    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    return getOfflineResponse(request);
  }
}

// Generate offline response
function getOfflineResponse(request) {
  const url = new URL(request.url);

  // For API requests, return structured offline response
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This feature requires internet connection',
      offline: true,
      timestamp: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }

  // For page requests, redirect to offline page
  return caches.match('/offline').then(response => {
    return response || new Response('Offline', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  });
}

// Background sync for data synchronization
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  switch (event.tag) {
    case 'sync-expenses':
      event.waitUntil(syncExpenses());
      break;
    case 'sync-todos':
      event.waitUntil(syncTodos());
      break;
    case 'sync-notes':
      event.waitUntil(syncNotes());
      break;
    case 'ai-process-queue':
      event.waitUntil(processAIQueue());
      break;
  }
});

// Sync functions for different data types
async function syncExpenses() {
  try {
    const pendingExpenses = await getFromIndexedDB('pending_expenses');
    if (pendingExpenses.length > 0) {
      await fetch('/api/expenses/sync', {
        method: 'POST',
        body: JSON.stringify(pendingExpenses),
        headers: { 'Content-Type': 'application/json' }
      });
      await clearFromIndexedDB('pending_expenses');
    }
  } catch (error) {
    console.error('[SW] Expense sync failed:', error);
  }
}

async function syncTodos() {
  try {
    const pendingTodos = await getFromIndexedDB('pending_todos');
    if (pendingTodos.length > 0) {
      await fetch('/api/todos/sync', {
        method: 'POST',
        body: JSON.stringify(pendingTodos),
        headers: { 'Content-Type': 'application/json' }
      });
      await clearFromIndexedDB('pending_todos');
    }
  } catch (error) {
    console.error('[SW] Todo sync failed:', error);
  }
}

async function syncNotes() {
  try {
    const pendingNotes = await getFromIndexedDB('pending_notes');
    if (pendingNotes.length > 0) {
      await fetch('/api/notes/sync', {
        method: 'POST',
        body: JSON.stringify(pendingNotes),
        headers: { 'Content-Type': 'application/json' }
      });
      await clearFromIndexedDB('pending_notes');
    }
  } catch (error) {
    console.error('[SW] Notes sync failed:', error);
  }
}

// Process AI queue for offline AI requests
async function processAIQueue() {
  try {
    const aiQueue = await getFromIndexedDB('ai_queue');
    if (aiQueue.length > 0) {
      for (const request of aiQueue) {
        try {
          const response = await fetch('/api/ai/process', {
            method: 'POST',
            body: JSON.stringify(request),
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            await removeFromIndexedDB('ai_queue', request.id);
          }
        } catch (error) {
          console.error('[SW] AI request failed:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] AI queue processing failed:', error);
  }
}

// Push notification handler for AI insights
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: 'You have new AI-powered insights available!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    actions: [
      {
        action: 'view',
        title: 'View Insights'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: '/?ai=insights'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.message || options.body;
      options.data = data;
    } catch (error) {
      console.error('[SW] Push data parsing failed:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('LifeSync AI Assistant', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Helper functions for IndexedDB operations
async function getFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lifesync-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onerror = () => reject(getAllRequest.error);
      getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function clearFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lifesync-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();

      clearRequest.onerror = () => reject(clearRequest.error);
      clearRequest.onsuccess = () => resolve();
    };
  });
}

async function removeFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lifesync-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    };
  });
}

console.log('[SW] Service Worker loaded successfully');