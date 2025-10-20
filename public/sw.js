// Service Worker for Samsung Lead Generation Tool
const CACHE_NAME = 'samsung-leads-v1';
const STATIC_CACHE = 'samsung-leads-static-v1';
const DYNAMIC_CACHE = 'samsung-leads-dynamic-v1';

// Assets to cache on install - only cache assets that exist
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
  // Remove icon paths that don't exist
];

// API routes to cache
const API_ROUTES = [
  '/api/officers',
  '/api/leads',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip server-side chunks completely - let Next.js handle them
  if (url.pathname.includes('/server/chunks/') || url.pathname.includes('[root-of-the-server]')) {
    return; // Don't intercept server chunks
  }
  
  // Handle client-side Next.js chunks with special strategy
  if (url.pathname.includes('/_next/static/chunks/') || url.pathname.includes('/_next/static/js/')) {
    event.respondWith(handleChunkRequest(request));
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Default to network-first for everything else
  event.respondWith(networkFirstStrategy(request));
});

// Network-first strategy (good for dynamic content)
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a navigation request and no cache, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// Cache-first strategy (good for static assets)
async function cacheFirstStrategy(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Cache miss, try network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch:', request.url);
    throw error;
  }
}

// Special handling for Next.js chunks
async function handleChunkRequest(request) {
  try {
    // Always try network first for chunks to ensure latest version
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful chunk responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Chunk network failed, trying cache for:', request.url);
    
    // Fallback to cache only if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache and it's a chunk, don't throw - let the app handle it
    console.error('Chunk loading failed completely:', request.url);
    throw error;
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-leads') {
    console.log('Background sync triggered for leads');
    event.waitUntil(syncLeads());
  }
});

// Sync offline leads when connection is restored
async function syncLeads() {
  try {
    // Get offline leads from IndexedDB or localStorage
    // This would integrate with your offline storage implementation
    console.log('Syncing offline leads...');
    
    // Implementation would depend on your offline storage strategy
    // For now, just log that sync was attempted
    
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to sync leads:', error);
    throw error;
  }
}

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});