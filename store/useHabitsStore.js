// store/useHabitsStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import habitsSeed from '../data/habits'; // ✅ Seule référence nécessaire

const HABITS_KEY = 'habits';

const useHabitsStore = create((set, get) => ({
  habits: habitsSeed,

  setHabits: async (newHabits) => {
    set({ habits: newHabits });
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(newHabits));
    } catch (e) {
      console.warn('Failed to save habits', e);
    }
  },

  loadHabits: async () => {
    try {
      const savedStr = await AsyncStorage.getItem(HABITS_KEY);
      if (!savedStr) {
        set({ habits: habitsSeed });
        return;
      }
      const saved = JSON.parse(savedStr);
      if (Array.isArray(saved) && saved.length > 0) {
        set({ habits: saved });
      } else {
        set({ habits: habitsSeed });
      }
    } catch (e) {
      console.warn('Failed to load habits, using seed', e);
      set({ habits: habitsSeed });
    }
  },

  toggleHabitDone: async (id) => {
    const updated = get().habits.map((h) =>
      h.id === id ? { ...h, done: !h.done } : h
    );
    set({ habits: updated });
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist habits', e);
    }
  },

  resetHabitsToSeed: async () => {
    set({ habits: habitsSeed });
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habitsSeed));
    } catch (e) {
      console.warn('Failed to reset habits', e);
    }
  },
}));

export default useHabitsStore;