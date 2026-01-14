/* eslint-disable no-restricted-globals */
self.addEventListener("install", () => {
  // Keep default behavior: new worker waits until old one is gone.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
