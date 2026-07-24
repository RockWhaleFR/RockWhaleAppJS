import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Doit être appelé à la racine de l'application (dans App.js)
// Configure le comportement des notifications lorsque l'application est ouverte.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Initialise les notifications en demandant les permissions nécessaires.
 * @returns {Promise<boolean>} - True si les permissions sont accordées, sinon false.
 */
export async function initNotifications() {
  // Crée un "canal" de notification pour Android, obligatoire depuis Android 8.0
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Demande la permission si elle n'a pas déjà été accordée
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permissions de notification non accordées !');
    // Vous pouvez afficher une alerte pour informer l'utilisateur
    // alert('Pour recevoir des rappels, veuillez activer les notifications dans les paramètres de votre téléphone.');
    return false;
  }
  
  console.log('Permissions de notification accordées.');
  return true;
}

/**
 * Programme un rappel quotidien.
 * @param {number} hour - L'heure du rappel (0-23).
 * @param {number} minute - La minute du rappel (0-59).
 */
export async function scheduleDailyReminder(hour, minute) {
  try {
    // Annule les rappels précédents pour éviter les doublons
    await Notifications.cancelAllScheduledNotificationsAsync();

    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🐳 C'est l'heure de votre micro-habitude !",
        body: 'Un petit pas pour vous, un grand pas pour votre bien-être.',
        sound: 'default',
      },
      trigger,
    });
    console.log(`Rappel quotidien programmé (ID: ${notificationId}) pour ${hour}:${minute}.`);
  } catch (error) {
    console.error("Erreur lors de la programmation du rappel quotidien:", error);
  }
}

/**
 * Programme une notification pour célébrer une nouvelle série.
 * @param {number} streak - Le nombre de jours de la série.
 */
export async function scheduleStreakNotification(streak) {
    if (streak <= 0) return;
    
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🔥 Nouvelle série !',
                body: `Félicitations ! Vous êtes sur une série de ${streak} jours !`,
                sound: 'default',
            },
            trigger: { seconds: 2 }, // Délai court pour un retour immédiat
        });
    } catch (error) {
        console.error("Erreur lors de la programmation de la notification de série:", error);
    }
}

/**
 * Programme une notification pour un nouveau badge.
 * @param {string} badgeName - Le nom du badge.
 * @param {string} badgeIcon - L'icône du badge.
 */
export async function scheduleBadgeNotification(badgeName, badgeIcon) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🏆 Nouveau badge débloqué !',
                body: `Vous avez obtenu le badge : ${badgeIcon} ${badgeName}`,
                sound: 'default',
            },
            trigger: { seconds: 2 },
        });
    } catch (error) {
        console.error("Erreur lors de la programmation de la notification de badge:", error);
    }
}