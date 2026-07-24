// services/successTrackingService.js - TRACKING SUCCÈS TECHNIQUES
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUCCESS_RATES_KEY = 'technique_success_rates';
const HISTORY_KEY = 'technique_history';

class SuccessTrackingService {
  
  /**
   * 📊 Récupérer taux succès user
   */
  async getSuccessRates(userId) {
    try {
      const stored = await AsyncStorage.getItem(`${SUCCESS_RATES_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Erreur lecture success rates:', error);
      return {};
    }
  }

  /**
   * 💾 Sauvegarder taux succès
   */
  async saveSuccessRates(userId, rates) {
    try {
      await AsyncStorage.setItem(`${SUCCESS_RATES_KEY}_${userId}`, JSON.stringify(rates));
    } catch (error) {
      console.error('Erreur sauvegarde success rates:', error);
    }
  }

  /**
   * ✅ Enregistrer complétion technique
   * @param {string} userId
   * @param {string} techniqueId
   * @param {object} data - { moodBefore, moodAfter, completed, duration }
   */
  async trackCompletion(userId, techniqueId, data) {
    try {
      // 1. Charger rates actuels
      const rates = await this.getSuccessRates(userId);
      
      if (!rates[techniqueId]) {
        rates[techniqueId] = {
          completions: 0,
          successes: 0,
          lastUsed: null,
          avgMoodImprovement: 0
        };
      }
      
      // 2. Incrémenter compteurs
      rates[techniqueId].completions++;
      rates[techniqueId].lastUsed = new Date().toISOString();
      
      // 3. Déterminer si succès
      const isSuccess = this.isSuccessfulCompletion(data);
      
      if (isSuccess) {
        rates[techniqueId].successes++;
      }
      
      // 4. Calculer amélioration mood
      if (data.moodBefore && data.moodAfter) {
        const improvement = this.moodToValue(data.moodAfter) - this.moodToValue(data.moodBefore);
        
        // Moyenne mobile
        const currentAvg = rates[techniqueId].avgMoodImprovement || 0;
        const count = rates[techniqueId].completions;
        rates[techniqueId].avgMoodImprovement = 
          (currentAvg * (count - 1) + improvement) / count;
      }
      
      // 5. Sauvegarder
      await this.saveSuccessRates(userId, rates);
      
      // 6. Logger événement
      await this.logEvent(userId, techniqueId, data, isSuccess);
      
      console.log(`✅ Tracked: ${techniqueId} - Success: ${isSuccess}`);
      
      return rates[techniqueId];
      
    } catch (error) {
      console.error('Erreur tracking completion:', error);
      return null;
    }
  }

  /**
   * 🎯 Déterminer si complétion = succès
   */
  isSuccessfulCompletion(data) {
    // Critères de succès :
    // 1. Technique complétée (pas abandonnée)
    // 2. Mood amélioré OU stable si déjà bon
    // 3. Durée >= 80% de la durée prévue
    
    const completed = data.completed !== false;
    
    const moodImproved = data.moodAfter && data.moodBefore &&
                         this.moodToValue(data.moodAfter) >= this.moodToValue(data.moodBefore);
    
    // Si mood déjà excellent avant, considérer comme succès si maintenu
    const wasAlreadyGood = data.moodBefore === 'Bien' || data.moodBefore === 'Excellent';
    const stayedGood = data.moodAfter === 'Bien' || data.moodAfter === 'Excellent';
    
    return completed && (moodImproved || (wasAlreadyGood && stayedGood));
  }

  /**
   * 📈 Obtenir statistiques globales
   */
  async getGlobalStats(userId) {
    const rates = await this.getSuccessRates(userId);
    
    if (Object.keys(rates).length === 0) {
      return {
        totalCompletions: 0,
        totalSuccesses: 0,
        overallSuccessRate: 0,
        topTechniques: [],
        improvingTechniques: []
      };
    }
    
    const totalCompletions = Object.values(rates).reduce((sum, r) => sum + r.completions, 0);
    const totalSuccesses = Object.values(rates).reduce((sum, r) => sum + r.successes, 0);
    
    // Top techniques (par taux succès)
    const topTechniques = Object.entries(rates)
      .filter(([_, r]) => r.completions >= 3) // Minimum 3 essais
      .sort((a, b) => (b[1].successes / b[1].completions) - (a[1].successes / a[1].completions))
      .slice(0, 5)
      .map(([id, data]) => ({
        techniqueId: id,
        successRate: (data.successes / data.completions * 100).toFixed(0),
        completions: data.completions
      }));
    
    // Techniques en amélioration (mood improvement positif)
    const improvingTechniques = Object.entries(rates)
      .filter(([_, r]) => r.avgMoodImprovement > 0.5)
      .sort((a, b) => b[1].avgMoodImprovement - a[1].avgMoodImprovement)
      .slice(0, 3)
      .map(([id, data]) => ({
        techniqueId: id,
        avgImprovement: data.avgMoodImprovement.toFixed(1)
      }));
    
    return {
      totalCompletions,
      totalSuccesses,
      overallSuccessRate: totalCompletions > 0 ? (totalSuccesses / totalCompletions * 100).toFixed(0) : 0,
      topTechniques,
      improvingTechniques
    };
  }

  /**
   * 🔄 Réinitialiser données (pour tests)
   */
  async resetData(userId) {
    try {
      await AsyncStorage.removeItem(`${SUCCESS_RATES_KEY}_${userId}`);
      await AsyncStorage.removeItem(`${HISTORY_KEY}_${userId}`);
      console.log('✅ Données tracking réinitialisées');
    } catch (error) {
      console.error('Erreur reset:', error);
    }
  }

  /**
   * 📝 Logger événement (analytics)
   */
  async logEvent(userId, techniqueId, data, isSuccess) {
    try {
      const event = {
        userId,
        techniqueId,
        timestamp: new Date().toISOString(),
        isSuccess,
        moodBefore: data.moodBefore,
        moodAfter: data.moodAfter,
        duration: data.duration,
        completed: data.completed !== false
      };
      
      // Stocker historique (limité aux 100 derniers)
      const historyKey = `${HISTORY_KEY}_${userId}`;
      const storedHistory = await AsyncStorage.getItem(historyKey);
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      
      history.push(event);
      
      const recent = history.slice(-100);
      await AsyncStorage.setItem(historyKey, JSON.stringify(recent));
      
    } catch (error) {
      console.error('Erreur log event:', error);
    }
  }

  /**
   * 🎨 Mood → Valeur numérique
   */
  moodToValue(mood) {
    const map = {
      'Pas top': 1,
      'Neutre': 2,
      'Bien': 3,
      'Excellent': 4
    };
    return map[mood] || 2;
  }

  /**
   * 📊 Obtenir insights (pour dashboard)
   */
  async getInsights(userId) {
    const rates = await this.getSuccessRates(userId);
    const insights = [];
    
    // Insight 1: Technique champion
    const champion = Object.entries(rates)
      .filter(([_, r]) => r.completions >= 5)
      .sort((a, b) => (b[1].successes / b[1].completions) - (a[1].successes / a[1].completions))[0];
    
    if (champion) {
      const rate = (champion[1].successes / champion[1].completions * 100).toFixed(0);
      insights.push({
        type: 'champion',
        techniqueId: champion[0],
        message: `🏆 Ta technique la plus efficace (${rate}% de succès)`,
        data: champion[1]
      });
    }
    
    // Insight 2: Technique à revoir
    const struggling = Object.entries(rates)
      .filter(([_, r]) => r.completions >= 3)
      .sort((a, b) => (a[1].successes / a[1].completions) - (b[1].successes / b[1].completions))[0];
    
    if (struggling && (struggling[1].successes / struggling[1].completions) < 0.5) {
      insights.push({
        type: 'struggling',
        techniqueId: struggling[0],
        message: `💡 Cette technique ne te correspond peut-être pas`,
        data: struggling[1]
      });
    }
    
    // Insight 3: Progression récente
    const recentTechniques = Object.entries(rates)
      .filter(([_, r]) => {
        if (!r.lastUsed) return false;
        const daysSince = (Date.now() - new Date(r.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
    
    if (recentTechniques.length >= 3) {
      insights.push({
        type: 'consistency',
        message: `🔥 ${recentTechniques.length} techniques utilisées cette semaine !`,
        data: { count: recentTechniques.length }
      });
    }
    
    return insights;
  }
}

export default new SuccessTrackingService();