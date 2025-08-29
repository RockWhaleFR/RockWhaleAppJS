// utils/share.js
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export async function shareStreakText(streak) {
  const content = `Je tiens ${streak} jours de micro-habitudes avec RockWhale 🐋💪`;
  const path = FileSystem.cacheDirectory + 'streak.txt';
  await FileSystem.writeAsStringAsync(path, content);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path);
  }
}
