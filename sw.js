// SecondBrain Service Worker - Push Notifications + Offline Caching
const CACHE_NAME = 'secondbrain-v1';
const ASSETS_TO_CACHE = [
  '/Sergio/',
  '/Sergio/index.html',
  '/Sergio/favicon.ico',
  '/Sergio/manifest.json',
];

// ── Install: Cache app shell ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ── Activate: Clean old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: Network-first with cache fallback ──
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('googleapis.com')) return;
  if (event.request.url.includes('gstatic.com')) return;
  if (event.request.url.includes('api.anthropic.com')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Push: Show notification when server sends a push ──
self.addEventListener('push', (event) => {
  let data = { title: 'SecondBrain Reminder', body: 'You have a reminder!' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/Sergio/favicon.ico',
    badge: '/Sergio/favicon.ico',
    tag: data.noteId || 'secondbrain-reminder',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      noteId: data.noteId,
      url: data.url || '/Sergio/',
    },
    actions: [
      { action: 'open', title: 'Open Note' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ── Notification Click: Open the app/note ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const noteId = event.notification.data?.noteId;
  const url = event.notification.data?.url || '/Sergio/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes('/Sergio/') && 'focus' in client) {
          client.focus();
          if (noteId) {
            client.postMessage({ type: 'OPEN_NOTE', noteId });
          }
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(noteId ? `${url}#note-${noteId}` : url);
    })
  );
});

// ── Message handler: Receive scheduled reminders from the app ──
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_REMINDER') {
    const { noteId, title, body, triggerTime } = event.data;
    const delay = triggerTime - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification('SecondBrain Reminder', {
          body: `${title}\n${body}`,
          icon: '/Sergio/favicon.ico',
          badge: '/Sergio/favicon.ico',
          tag: noteId,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: { noteId, url: '/Sergio/' },
          actions: [
            { action: 'open', title: 'Open Note' },
            { action: 'dismiss', title: 'Dismiss' },
          ],
        });
      }, delay);
    }
  }

  if (event.data?.type === 'SCHEDULE_ALL_REMINDERS') {
    const reminders = event.data.reminders || [];
    const now = Date.now();
    reminders.forEach(({ noteId, title, body, triggerTime }) => {
      const delay = triggerTime - now;
      if (delay > 0 && delay < 86400000) {
        setTimeout(() => {
          self.registration.showNotification('SecondBrain Reminder', {
            body: `${title}\n${body}`,
            icon: '/Sergio/favicon.ico',
            badge: '/Sergio/favicon.ico',
            tag: noteId,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: { noteId, url: '/Sergio/' },
            actions: [
              { action: 'open', title: 'Open Note' },
              { action: 'dismiss', title: 'Dismiss' },
            ],
          });
        }, delay);
      }
    });
  }
});
