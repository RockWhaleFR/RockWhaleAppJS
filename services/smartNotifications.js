// services/smartNotifications.js - AVEC DÉCLENCHEURS INTELLIGENTS
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import biometricService from './biometricService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class SmartNotificationService {
  constructor() {
    this.isInitialized = false;
    this.monitoringInterval = null;
    this.lastHRVCheck = null;
    this.lastCircadianCheck = null;
    
    this.notificationTypes = {
      STRESS_ALERT: 'stress_alert',
      STRESS_WARNING: 'stress_warning',
      CIRCADIAN_DIP: 'circadian_dip',
      SLEEP_DEBT: 'sleep_debt',
      STREAK_REMINDER: 'streak_reminder',
      PRE_MEETING: 'pre_meeting',
      ROUTINE: 'routine',
      PROGRESS: 'progress',
      UPSELL: 'upsell'
    };

    this.triggers = {
      HRV_CRITICAL_DROP: { threshold: -20, checked: false },
      HRV_WARNING_DROP: { threshold: -10, checked: false },
      CIRCADIAN_DIP: { hours: [14, 15, 16], checked: false },
      SLEEP_DEBT: { threshold: 2, checked: false },
      STREAK_MAINTENANCE: { hour: 21, checked: false }
    };
  }

  async initialize() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('critical', {
          name: 'Alertes Critiques',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#EF4444',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('routine', {
          name: 'Rappels Routine',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 150, 150, 150],
          lightColor: '#3B82F6',
        });

        await Notifications.setNotificationChannelAsync('achievement', {
          name: 'Célébrations',
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: '#10B981',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Permissions notifications refusées');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ Notifications initialisées');
      
      this.setupNotificationListener();
      await this.scheduleInitialRoutines();
      this.startMonitoring();
      
      return true;
    } catch (error) {
      console.error('❌ Erreur init notifications:', error);
      return false;
    }
  }

  /**
   * 🔥 MONITORING EN FOREGROUND (toutes les 5 minutes)
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log('🔄 Démarrage monitoring notifications...');
    
    // Check immédiat
    this.checkAllTriggers();
    
    // Puis toutes les 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.checkAllTriggers();
    }, 5 * 60 * 1000);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏸️ Monitoring arrêté');
    }
  }

  /**
   * 🎯 VÉRIFICATION DE TOUS LES DÉCLENCHEURS
   */
  async checkAllTriggers() {
    if (!this.isInitialized) return;

    try {
      console.log('🔍 Vérification déclencheurs...');
      
      // Reset flags si nouvelle heure
      const currentHour = new Date().getHours();
      if (this.lastHRVCheck !== currentHour) {
        this.triggers.HRV_CRITICAL_DROP.checked = false;
        this.triggers.HRV_WARNING_DROP.checked = false;
        this.triggers.CIRCADIAN_DIP.checked = false;
        this.lastHRVCheck = currentHour;
      }

      // 1. HRV MONITORING
      await this.checkHRVTriggers();

      // 2. CIRCADIAN DIP
      await this.checkCircadianDip();

      // 3. SLEEP DEBT (1× matin)
      await this.checkSleepDebt();

      // 4. STREAK REMINDER (1× soir)
      await this.checkStreakReminder();

    } catch (error) {
      console.error('❌ Erreur check triggers:', error);
    }
  }

  /**
   * 🚨 DÉCLENCHEUR HRV - CHUTE DÉTECTÉE
   */
  async checkHRVTriggers() {
    try {
      const status = await biometricService.checkStatus();
      if (!status.isConnected) return;

      const hrvDual = await biometricService.getHRVDual();
      
      if (!hrvDual.morning || !hrvDual.current || !hrvDual.deviation) return;

      const deviation = hrvDual.deviation.percentage;
      console.log(`💓 HRV Déviation: ${deviation}%`);

      // CRITIQUE: Chute > 20%
      if (deviation <= -20 && !this.triggers.HRV_CRITICAL_DROP.checked) {
        await this.sendHRVCriticalAlert(hrvDual);
        this.triggers.HRV_CRITICAL_DROP.checked = true;
      }
      // VIGILANCE: Chute 10-20%
      else if (deviation <= -10 && deviation > -20 && !this.triggers.HRV_WARNING_DROP.checked) {
        await this.sendHRVWarningAlert(hrvDual);
        this.triggers.HRV_WARNING_DROP.checked = true;
      }

    } catch (error) {
      console.warn('⚠️ Erreur check HRV:', error.message);
    }
  }

  async sendHRVCriticalAlert(hrvDual) {
    const technique = this.getEmergencyTechnique();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Stress Aigu Détecté',
        body: `HRV: ${hrvDual.deviation.percentage}% ⬇️ - Prends 5 min: "${technique.title}"`,
        data: {
          type: this.notificationTypes.STRESS_ALERT,
          action: 'open_technique',
          techniqueId: technique.id,
          priority: 'critical',
          hrvData: {
            morning: hrvDual.morning.value,
            current: hrvDual.current.value,
            deviation: hrvDual.deviation.percentage
          }
        },
        sound: 'default',
        categoryIdentifier: 'stress_alert',
      },
      trigger: null,
    });

    await this.logNotification('hrv_critical', { 
      deviation: hrvDual.deviation.percentage,
      technique: technique.id 
    });

    console.log('🚨 ALERTE CRITIQUE envoyée:', technique.title);
  }

  async sendHRVWarningAlert(hrvDual) {
    const technique = this.getPreventiveTechnique();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Stress en Hausse',
        body: `HRV: ${hrvDual.deviation.percentage}% - Préviens l'escalade: "${technique.title}"`,
        data: {
          type: this.notificationTypes.STRESS_WARNING,
          action: 'open_technique',
          techniqueId: technique.id,
          priority: 'high',
        },
      },
      trigger: null,
    });

    await this.logNotification('hrv_warning', { 
      deviation: hrvDual.deviation.percentage,
      technique: technique.id 
    });

    console.log('⚠️ ALERTE VIGILANCE envoyée');
  }

  /**
   * 🕐 DÉCLENCHEUR CIRCADIEN - CREUX 14h-16h
   */
  async checkCircadianDip() {
    const hour = new Date().getHours();
    
    if (this.triggers.CIRCADIAN_DIP.hours.includes(hour) && !this.triggers.CIRCADIAN_DIP.checked) {
      const technique = this.getCircadianBoostTechnique();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Creux Circadien Détecté',
          body: `C'est le moment d'un boost: "${technique.title}" (${technique.duration})`,
          data: {
            type: this.notificationTypes.CIRCADIAN_DIP,
            action: 'open_technique',
            techniqueId: technique.id,
            timeOfDay: 'afternoon_dip'
          },
        },
        trigger: null,
      });

      this.triggers.CIRCADIAN_DIP.checked = true;
      await this.logNotification('circadian_dip', { hour, technique: technique.id });
      
      console.log('🌅 Notification creux circadien envoyée');
    }
  }

  /**
   * 😴 DÉCLENCHEUR DETTE SOMMEIL - 1× MATIN
   */
  async checkSleepDebt() {
    const hour = new Date().getHours();
    if (hour !== 8 || this.triggers.SLEEP_DEBT.checked) return;

    try {
      const status = await biometricService.checkStatus();
      if (!status.isConnected) return;

      const sleepData = await biometricService.getSleepData();
      if (!sleepData.success) return;

      const sleepHours = sleepData.totalMinutes / 60;
      const sleepDebt = 8 - sleepHours; // Assume 8h objectif

      if (sleepDebt >= this.triggers.SLEEP_DEBT.threshold) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '😴 Dette de Sommeil Détectée',
            body: `Tu as dormi ${sleepHours.toFixed(1)}h. Priorité: récupération aujourd'hui`,
            data: {
              type: this.notificationTypes.SLEEP_DEBT,
              action: 'open_sleep_tips',
              sleepHours: sleepHours,
              debt: sleepDebt
            },
          },
          trigger: null,
        });

        this.triggers.SLEEP_DEBT.checked = true;
        await this.logNotification('sleep_debt', { sleepHours, debt: sleepDebt });
        
        console.log('😴 Alerte dette sommeil envoyée');
      }
    } catch (error) {
      console.warn('⚠️ Erreur check sleep debt:', error.message);
    }
  }

  /**
   * 🔥 DÉCLENCHEUR STREAK - 1× SOIR 21h
   */
  async checkStreakReminder() {
    const hour = new Date().getHours();
    if (hour !== 21 || this.triggers.STREAK_MAINTENANCE.checked) return;

    try {
      const user = await AsyncStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      const todayActivities = userData.history?.filter(h => {
        const activityDate = new Date(h.timestamp).toDateString();
        return activityDate === new Date().toDateString();
      }) || [];

      if (todayActivities.length === 0) {
        const technique = this.getEveningTechnique();
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔥 Maintiens ta Série !',
            body: `Une petite session avant de dormir ? "${technique.title}"`,
            data: {
              type: this.notificationTypes.STREAK_REMINDER,
              action: 'open_technique',
              techniqueId: technique.id,
              streak: userData.streak || 0
            },
          },
          trigger: null,
        });

        this.triggers.STREAK_MAINTENANCE.checked = true;
        await this.logNotification('streak_reminder', { streak: userData.streak });
        
        console.log('🔥 Rappel streak envoyé');
      }
    } catch (error) {
      console.warn('⚠️ Erreur check streak:', error.message);
    }
  }

  /**
   * 🎯 SÉLECTION TECHNIQUES CONTEXTUELLES
   */
  getEmergencyTechnique() {
    return {
      id: 'physiological-sigh',
      title: 'Soupir Physiologique',
      duration: '1 min'
    };
  }

  getPreventiveTechnique() {
    return {
      id: 'box-breathing',
      title: 'Respiration Carrée',
      duration: '3 min'
    };
  }

  getCircadianBoostTechnique() {
    const techniques = [
      { id: 'cold-water-face', title: 'Eau Froide Visage', duration: '30 sec' },
      { id: 'power-posing', title: 'Power Posing', duration: '2 min' },
      { id: 'light-exposure', title: 'Exposition Lumière', duration: '5 min' }
    ];
    
    return techniques[new Date().getDate() % techniques.length];
  }

  getEveningTechnique() {
    const techniques = [
      { id: '4-7-8-breathing', title: 'Respiration 4-7-8', duration: '2 min' },
      { id: 'body-scan', title: 'Scan Corporel', duration: '5 min' }
    ];
    
    return techniques[new Date().getDay() % techniques.length];
  }

  /**
   * 📥 LISTENER NOTIFICATIONS
   */
  setupNotificationListener() {
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data.action && data.techniqueId) {
        this.handleNotificationAction(data);
      }
    });
  }

  handleNotificationAction(data) {
    console.log('🎯 Action notification:', data);
    // Navigation gérée par App.js via navigationRef
  }

  /**
   * 📅 RAPPEL PRÉ-RÉUNION
   */
  async scheduleMeetingPrep(meeting, recommendedTechnique) {
    if (!this.isInitialized) return;

    const meetingTime = new Date(meeting.start);
    const prepTime = new Date(meetingTime.getTime() - 30 * 60000);

    if (prepTime > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Réunion dans 30 min',
          body: `Prépare-toi avec: ${recommendedTechnique.title} (${recommendedTechnique.duration})`,
          data: {
            type: this.notificationTypes.PRE_MEETING,
            action: 'open_technique',
            techniqueId: recommendedTechnique.id,
            meetingTitle: meeting.title
          },
        },
        trigger: {
          date: prepTime,
        },
      });

      console.log('📅 Rappel programmé:', meeting.title);
    }
  }

  /**
   * ⏰ ROUTINES PERSONNALISÉES
   */
  async scheduleInitialRoutines() {
    try {
      const userPrefs = await AsyncStorage.getItem('user_preferences');
      const prefs = userPrefs ? JSON.parse(userPrefs) : {};
      
      const chronotype = prefs.chronotype || 'intermediate';
      
      await Notifications.cancelAllScheduledNotificationsAsync();

      // ROUTINE MATINALE
      const morningTime = this.getMorningTime(chronotype);
      const morningTechnique = this.getMorningTechnique(chronotype);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Bonjour ! Démarre ta journée',
          body: `Lance "${morningTechnique.title}" pour booster ton énergie`,
          data: {
            type: this.notificationTypes.ROUTINE,
            action: 'open_technique',
            techniqueId: morningTechnique.id,
            timeOfDay: 'morning'
          },
        },
        trigger: {
          hour: morningTime.hour,
          minute: morningTime.minute,
          repeats: true,
        },
      });

      // ROUTINE SOIRÉE
      const eveningTime = this.getEveningTime(chronotype);
      const eveningTechnique = this.getEveningTechnique();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Prépare ton sommeil',
          body: `Détends-toi avec: ${eveningTechnique.title}`,
          data: {
            type: this.notificationTypes.ROUTINE,
            action: 'open_technique',
            techniqueId: eveningTechnique.id,
            timeOfDay: 'evening'
          },
        },
        trigger: {
          hour: eveningTime.hour,
          minute: eveningTime.minute,
          repeats: true,
        },
      });

      console.log('✅ Routines programmées');
    } catch (error) {
      console.error('❌ Erreur routines:', error);
    }
  }

  getMorningTechnique(chronotype) {
    const techniques = {
      'early': { id: 'sun-exposure', title: 'Exposition Solaire', duration: '10 min' },
      'intermediate': { id: 'power-posing', title: 'Power Posing', duration: '2 min' },
      'evening': { id: 'box-breathing-energizing', title: 'Respiration Énergisante', duration: '3 min' }
    };
    
    return techniques[chronotype] || techniques['intermediate'];
  }

  /**
   * 🔥 CÉLÉBRATION STREAK
   */
  async celebrateStreak(streak) {
    if (!this.isInitialized) return;

    const milestones = [3, 7, 14, 30, 60, 100];
    
    if (milestones.includes(streak)) {
      const emoji = this.getStreakEmoji(streak);
      const reward = this.getStreakReward(streak);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${emoji} Série de ${streak} jours !`,
          body: reward,
          data: {
            type: this.notificationTypes.STREAK,
            streak,
            reward,
            action: 'open_profile'
          },
        },
        trigger: { seconds: 2 },
      });

      await this.logNotification('streak', { streak });
    }
  }

  /**
   * 📈 PROGRÈS DÉTECTÉ
   */
  async notifyProgress(progressData) {
    if (!this.isInitialized) return;

    const { metric, improvement, timeframe } = progressData;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Progrès Impressionnant !',
        body: `Ton ${metric} s'est amélioré de ${improvement}% en ${timeframe}`,
        data: {
          type: this.notificationTypes.PROGRESS,
          metric,
          improvement,
          action: 'open_biometric_details'
        },
      },
      trigger: { seconds: 2 },
    });
  }

  /**
   * 💎 UPSELL CONTEXTUEL
   */
  async showUpsellNotification(trigger) {
    if (!this.isInitialized) return;

    const isPremium = await this.checkPremiumStatus();
    if (isPremium) return;

    const messages = {
      'techniques_limit': {
        title: '🔓 Débloquer Plus de Techniques',
        body: 'Tu as utilisé tes 3 techniques gratuites. Accès illimité avec Premium !'
      },
      'hrv_advanced': {
        title: '💎 Analyse HRV Avancée',
        body: 'Vois ton HRV matin vs actuelle avec Premium'
      }
    };

    const message = messages[trigger];
    if (!message) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        data: {
          type: this.notificationTypes.UPSELL,
          trigger,
          action: 'open_paywall'
        },
      },
      trigger: { seconds: 5 },
    });

    await this.logNotification('upsell', { trigger });
  }

  /**
   * 🛠️ HELPERS
   */
  getMorningTime(chronotype) {
    const times = {
      'early': { hour: 6, minute: 30 },
      'intermediate': { hour: 7, minute: 30 },
      'evening': { hour: 9, minute: 0 }
    };
    return times[chronotype] || times['intermediate'];
  }

  getEveningTime(chronotype) {
    const times = {
      'early': { hour: 21, minute: 0 },
      'intermediate': { hour: 22, minute: 0 },
      'evening': { hour: 23, minute: 0 }
    };
    return times[chronotype] || times['intermediate'];
  }

  getStreakEmoji(streak) {
    if (streak >= 100) return '🏆';
    if (streak >= 30) return '👑';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '🔥';
    return '⭐';
  }

  getStreakReward(streak) {
    const rewards = {
      3: 'Excellent début ! Continue comme ça 💪',
      7: 'Une semaine complète ! Tu construis une vraie habitude 🎯',
      14: 'Deux semaines ! Tu es sur la bonne voie 🎁',
      30: '1 mois ! Tu es maintenant un expert 🥇',
      60: '2 mois ! Performance exceptionnelle 🎉',
      100: 'LÉGENDE ! 100 jours consécutifs 👑'
    };
    return rewards[streak] || 'Bravo !';
  }

  async checkPremiumStatus() {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user).isPremium : false;
    } catch {
      return false;
    }
  }

  async logNotification(type, data = {}) {
    try {
      const log = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      
      const logs = await AsyncStorage.getItem('notification_logs');
      const parsed = logs ? JSON.parse(logs) : [];
      parsed.push(log);
      
      const recent = parsed.slice(-100);
      await AsyncStorage.setItem('notification_logs', JSON.stringify(recent));
    } catch (error) {
      console.error('Erreur log notification:', error);
    }
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🧹 Toutes les notifications annulées');
  }

  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

export default new SmartNotificationService();