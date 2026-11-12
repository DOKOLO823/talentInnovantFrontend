// Activation immédiate des nouvelles versions
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Réception d'une notification push
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }
  const { title = "Talent Innovant", ...options } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      ...options,
    })
  );
});

// Clic sur la notification : ouvre (ou met au premier plan) la bonne page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if ("focus" in c) {
          await c.focus();
          if ("navigate" in c) await c.navigate(url);
          return;
        }
      }
      await clients.openWindow(url);
    })()
  );
});