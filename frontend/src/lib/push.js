import { savePushSubscription, deletePushSubscription } from './db.js';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getPushPermission() {
  return isPushSupported() ? Notification.permission : 'unsupported';
}

// atob-based base64url decode, needed because PushManager.subscribe wants
// the VAPID key as a Uint8Array, not the base64url string Web Push APIs use.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/** Requests Notification permission (must be called from a user gesture),
 * subscribes this device to Web Push, and saves the subscription for
 * `childId` so the daily streak-reminder function can reach it. */
export async function enablePushForChild(childId) {
  if (!isPushSupported()) throw new Error('Push notifications are not supported in this browser.');
  if (!VAPID_PUBLIC_KEY) throw new Error('Push notifications are not configured yet.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  await savePushSubscription(childId, subscription.toJSON());
  return subscription;
}

export async function disablePushForChild(childId) {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await deletePushSubscription(childId, subscription.endpoint);
  await subscription.unsubscribe();
}
