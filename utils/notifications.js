// Fichier “no-op” pour Expo Go. On réactivera en dev build.
export function setupNotifications() {
  // rien à faire pour éviter les warnings Expo Go SDK 53
}

export async function requestPermissions() {
  return true; // simule OK
}

export async function scheduleNotification(title, body, hour) {
  // no-op sous Expo Go
  return;
}
