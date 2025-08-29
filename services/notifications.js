// services/notifications.js (ADAPTÉ sans expo-device)
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getTimeBasedGreeting } from '../utils/messages';

// Configuration de base pour Expo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Fonction pour assurer le canal Android
async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Général',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: true,
        vibrationPattern: [250, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (error) {
      console.log('Erreur création canal Android:', error);
    }
  }
}

// Vérification simplifiée sans expo-device
const isPhysicalDevice = () => {
  return Platform.OS !== 'web';
};

// Initialisation des notifications
export async function initNotifications() {
  try {
    await ensureAndroidChannel();
    
    if (!isPhysicalDevice()) {
      console.log('Notifications simulées (émulateur)');
      return true;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('Erreur initialisation notifications:', error);
    return false;
  }
}

// Messages de notification personnalisés
const notificationMessages = [
  "Ta mini-habitude t'attend 🚀",
  "Prends 2 minutes pour toi aujourd'hui 🌟",
  "Un petit geste pour un grand changement 💫",
  "N'oublie pas de prendre soin de toi aujourd'hui 🌈",
  "Ta routine bien-être t'attend 🌿",
  "C'est le moment de recharger tes batteries 🔋",
  "Un instant pour toi peut changer ta journée 🌞"
];

// Planification rappel quotidien
export async function scheduleDailyReminder(
  hour = 9,
  minute = 0,
  { cancelExisting = true } = {}
) {
  try {
    await ensureAndroidChannel();

    if (cancelExisting) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    const randomMessage = notificationMessages[
      Math.floor(Math.random() * notificationMessages.length)
    ];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rockwhale',
        body: `${getTimeBasedGreeting()} ${randomMessage}`,
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: 'default',
      },
    });
    
    console.log('Rappel quotidien programmé:', hour, minute);
  } catch (error) {
    console.log('Erreur programmation rappel:', error);
  }
}

// Notification de félicitations pour streak
export async function scheduleStreakNotification(streak) {
  try {
    await ensureAndroidChannel();
    
    let body = '';
    if (streak === 3) {
      body = '🔥 3 jours de suite ! Tu es sur la bonne voie.';
    } else if (streak === 7) {
      body = '🎉 Une semaine complète ! Ton engagement paie.';
    } else if (streak === 21) {
      body = '🚀 21 jours ! Une habitude est en train de se former.';
    } else if (streak === 30) {
      body = '🏆 30 jours ! Tu as officialisé cette habitude.';
    } else if (streak > 0 && streak % 10 === 0) {
      body = `⭐ ${streak} jours de suite ! Exceptionnel.`;
    }
    
    if (body) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rockwhale',
          body,
          data: { type: 'streak_congrats' },
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: false,
        },
      });
      
      console.log('Notification streak programmée:', body);
    }
  } catch (error) {
    console.log('Erreur programmation notification streak:', error);
  }
}

// Notification pour badges
export async function scheduleBadgeNotification(badgeName, badgeIcon) {
  try {
    await ensureAndroidChannel();
    
    const messages = [
      `Félicitations ! Vous avez débloqué le badge ${badgeIcon} ${badgeName}`,
      `Nouveau succès ! ${badgeIcon} Badge ${badgeName} débloqué`,
      `🎉 Bravo ! Vous avez obtenu le badge ${badgeName} ${badgeIcon}`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rockwhale - Nouveau Badge',
        body: randomMessage,
        data: { type: 'badge_unlocked' },
      },
      trigger: {
        hour: 19,
        minute: 30,
        repeats: false,
      },
    });
    
    console.log('Notification badge programmée:', badgeName);
  } catch (error) {
    console.log('Erreur programmation notification badge:', error);
  }
}

// Annuler toutes les notifications
export async function cancelAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Toutes les notifications annulées');
  } catch (error) {
    console.log('Erreur annulation notifications:', error);
  }
}

// Obtenir les notifications programmées
export async function getScheduledReminders() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Erreur récupération notifications:', error);
    return [];
  }
}

// Setup de base
export function setupNotifications() {
  console.log('Setup notifications');
}

export async function requestPermissions() {
  return await initNotifications();
}

// Debug
export const debugNotifications = async () => {
  console.log('=== DEBUG NOTIFICATIONS ===');
  const { status } = await Notifications.getPermissionsAsync();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  
  return {
    permissions: status,
    scheduledCount: scheduled.length,
    platform: Platform.OS
  };
};