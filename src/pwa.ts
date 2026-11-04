import { registerSW } from 'virtual:pwa-register';

let update: ((reload?: boolean) => Promise<void>) | undefined;
let registration: ServiceWorkerRegistration | undefined;

/** Register the service worker and keep checking for a new version. */
export function initPwa() {
  if (!('serviceWorker' in navigator)) return;
  update = registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      registration = reg;
      const check = () => { reg?.update().catch(() => {}); };
      setInterval(check, 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    },
  });
}

/** Ask the browser for a new version. Resolves to a short message. */
export async function checkForUpdate(): Promise<string> {
  if (!registration) return 'Updates are not available in this browser.';
  if (!navigator.onLine) return 'You are offline. Try again when you have a connection.';
  try {
    await registration.update();
    if (registration.installing || registration.waiting) { await update?.(true); return 'Updating...'; }
    return 'You have the latest version.';
  } catch {
    return 'Could not check for updates.';
  }
}