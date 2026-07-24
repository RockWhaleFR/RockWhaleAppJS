// store/useUserStore.js - AVEC PROFILS STRESS/PERMA
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayKey, isYesterday } from '../utils/date';
import { getBadgeForStreak } from '../utils/badges';

const USER_KEY = 'user';

const defaultUser = {
  // Profil de base
  name: null,
  objective: null,
  timeAvailable: null,
  intensity: null,
  chronotype: null,
  
  // 🔥 PROFILS STRESS & BIEN-ÊTRE (ajoutés)
  stressProfile: null, // { score, level, pssBreakdown: { control, confidence, ... }, completedAt }
  wellbeingProfile: null, // { positiveEmotions, engagement, relationships, meaning, accomplishment, overallScore }
  
  // Gamification
  streak: 0,
  lastCompletionDate: null,
  history: [],
  habits: [],
  
  // Onboarding & Monetisation
  hasOnboarded: false,
  isPremium: false, // 🔥 Ajouté
  subscriptionPlan: 'free',
  usedFreeTrial: false,
  subscriptionExpiry: null,
  purchaseHistory: [],
  
  // Préférences
  preferences: {
    reminderTime: { hour: 9, minute: 0 },
    workingHours: { start: 9, end: 18 },
    breakPreferences: ['meditation', 'walk', 'stretch'],
    stressLevel: 'medium',
    environment: 'office',
    notifications: {
      contextual: true,
      frequency: 'smart'
    },
    notificationsEnabled: true,
    hapticsEnabled: true,
    soundEnabled: true,
  },
  
  // État des notifications
  notificationsScheduled: false,
  lastSuggestionTime: null,
  
  // Analytics pour l'IA
  behaviorData: {
    mostActiveHours: [],
    preferredActivities: {},
    completionRate: 0,
    stressPatterns: []
  }
};

const useUserStore = create((set, get) => ({
  user: defaultUser,
  isLoading: false,
  error: null,

  // 🔥 NOUVEAU : Sauvegarder profil stress (PSS-4)
  saveStressProfile: async (profile) => {
    const updatedUser = {
      ...get().user,
      stressProfile: {
        ...profile,
        completedAt: new Date().toISOString()
      }
    };
    set({ user: updatedUser });
    await persistUser(updatedUser);
    console.log('✅ Profil stress sauvegardé');
  },

  // 🔥 NOUVEAU : Sauvegarder profil bien-être (PERMA)
  saveWellbeingProfile: async (profile) => {
    const updatedUser = {
      ...get().user,
      wellbeingProfile: {
        ...profile,
        completedAt: new Date().toISOString()
      }
    };
    set({ user: updatedUser });
    await persistUser(updatedUser);
    console.log('✅ Profil bien-être sauvegardé');
  },

  // Met à jour un paramètre spécifique
  updateSetting: async (key, value) => {
    const { user } = get();
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, [key]: value },
    };
    set({ user: updatedUser });
    await persistUser(updatedUser);
  },
  
  // Met à jour les préférences utilisateur
  updatePreferences: async (preferences) => {
    const updatedUser = { 
      ...get().user, 
      preferences: { ...get().user.preferences, ...preferences }
    };
    set({ user: updatedUser });
    await persistUser(updatedUser);
  },

  // Enregistre une suggestion acceptée/refusée pour l'apprentissage
  recordSuggestionFeedback: async (suggestionType, accepted, context = {}) => {
    const { user } = get();
    const updatedBehaviorData = {
      ...user.behaviorData,
      preferredActivities: {
        ...user.behaviorData.preferredActivities,
        [suggestionType]: (user.behaviorData.preferredActivities[suggestionType] || 0) + (accepted ? 1 : -1)
      }
    };
    
    const updatedUser = {
      ...user,
      behaviorData: updatedBehaviorData,
      lastSuggestionTime: new Date().toISOString()
    };
    
    set({ user: updatedUser });
    await persistUser(updatedUser);
  },

  // Met à jour le niveau de stress pour des suggestions adaptées
  updateStressLevel: async (level) => {
    const updatedUser = {
      ...get().user,
      preferences: {
        ...get().user.preferences,
        stressLevel: level
      }
    };
    set({ user: updatedUser });
    await persistUser(updatedUser);
  },

  // Met à jour l'utilisateur (version optimisée)
  updateUser: async (updates) => {
    const updatedUser = { ...get().user, ...updates };
    set({ user: updatedUser, error: null });
    await persistUser(updatedUser);
  },

  setUser: async (updates) => {
    const updatedUser = { ...get().user, ...updates };
    set({ user: updatedUser, error: null });
    await persistUser(updatedUser);
  },

  // Charge les données persistées avec loading state
  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const saved = await AsyncStorage.getItem(USER_KEY);
      if (saved) {
        const userData = JSON.parse(saved);
        const migratedUser = migrateUserData(userData);
        set({ user: migratedUser, isLoading: false });
        console.log('✅ User chargé:', {
          hasStressProfile: !!migratedUser.stressProfile,
          hasWellbeingProfile: !!migratedUser.wellbeingProfile
        });
      } else {
        set({ user: defaultUser, isLoading: false });
      }
    } catch (e) {
      console.warn('Failed to load user', e);
      set({ error: e.message, isLoading: false, user: defaultUser });
    }
  },

  // Incrémente la série avec optimisation
  incrementStreak: async () => {
    const today = todayKey();
    const { user } = get();
    
    if (user.lastCompletionDate === today) {
      return { success: false, reason: 'already_completed' };
    }
    
    let newStreak = user.streak;
    if (user.lastCompletionDate && isYesterday(user.lastCompletionDate, today)) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    
    const totalDays = user.history.length;
    const completionRate = totalDays > 0 ? newStreak / (totalDays + 1) : 1;
    
    const oldBadge = getBadgeForStreak(user.streak);
    const newBadge = getBadgeForStreak(newStreak);
    
    const updated = { 
      ...user, 
      streak: newStreak,
      lastCompletionDate: today,
      behaviorData: {
        ...user.behaviorData,
        completionRate
      }
    };
    
    set({ user: updated });
    
    try {
      await persistUser(updated);
      
      if ((!oldBadge && newBadge) || (oldBadge && newBadge && oldBadge.name !== newBadge.name)) {
        const { scheduleBadgeNotification } = require('../services/notifications');
        scheduleBadgeNotification(newBadge.name, newBadge.icon);
      }
      
      return { success: true, newStreak, newBadge };
    } catch (e) {
      console.warn('Failed to persist streak', e);
      return { success: false, reason: 'persistence_error' };
    }
  },

  resetStreak: async () => {
    const updated = { ...get().user, streak: 0, lastCompletionDate: null };
    set({ user: updated });
    await persistUser(updated);
  },

  addHistory: async (entry) => {
    const updatedHistory = [...get().user.history, entry];
    const updatedUser = { 
      ...get().user, 
      history: updatedHistory.map(e => ({
        ...e, 
        habit: typeof e.habit === 'object' ? e.habit.id : e.habit
      })) 
    };
    set({ user: updatedUser });
    await persistUser(updatedUser);
  },

  resetUser: async () => {
    set({ user: defaultUser });
    await persistUser(defaultUser);
  },

  resetOnboarding: async () => {
    const resetUser = { 
      ...defaultUser, 
      hasOnboarded: false,
      streak: 0,
      history: [],
      lastCompletionDate: null,
    };
    set({ user: resetUser });
    await persistUser(resetUser);
  },

  updateSubscription: async (planId, expiryDate = null) => {
    const updated = { 
      ...get().user, 
      subscriptionPlan: planId,
      subscriptionExpiry: expiryDate,
      isPremium: planId !== 'free'
    };
    set({ user: updated });
    await persistUser(updated);
  },

  setFreeTrialUsed: async () => {
    const updated = { ...get().user, usedFreeTrial: true };
    set({ user: updated });
    await persistUser(updated);
  },

  getContextualData: () => {
    const { user } = get();
    return {
      currentStressLevel: user.preferences.stressLevel,
      preferredActivities: user.behaviorData.preferredActivities,
      workingHours: user.preferences.workingHours,
      environment: user.preferences.environment,
      streak: user.streak,
      completionRate: user.behaviorData.completionRate
    };
  }
}));

// Fonction centralisée de persistence avec retry
const persistUser = async (userData, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return;
    } catch (e) {
      console.warn(`Failed to persist user (attempt ${i + 1})`, e);
      if (i === retries - 1) throw e;
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
    }
  }
};

// Migration des anciennes données vers le nouveau format
const migrateUserData = (userData) => {
  if (userData.preferences && userData.behaviorData) {
    return {
      ...defaultUser,
      ...userData
    };
  }
  
  return {
    ...defaultUser,
    ...userData,
    preferences: {
      ...defaultUser.preferences,
      ...(userData.preferences || {})
    },
    behaviorData: {
      ...defaultUser.behaviorData,
      ...(userData.behaviorData || {})
    }
  };
};

export default useUserStore;