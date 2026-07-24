// services/biometricService.js - VERSION CORRIGÉE
import GoogleFit, { Scopes } from 'react-native-google-fit';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BiometricService {
  constructor() {
    this.isInitialized = false;
    this.platform = 'mock';
  }

  async initialize() {
    try {
      console.log('🔄 Initialisation Google Fit...');

      const options = {
        scopes: [
          Scopes.FITNESS_ACTIVITY_READ,
          Scopes.FITNESS_HEART_RATE_READ,
          Scopes.FITNESS_SLEEP_READ,
        ],
      };

      const authResult = await GoogleFit.authorize(options);
      
      console.log('📊 Résultat autorisation:', authResult);
      
      if (authResult.success) {
        this.isInitialized = true;
        this.platform = 'GoogleFit';
        
        console.log('✅ Google Fit connecté');
        return { 
          success: true, 
          platform: 'GoogleFit',
          message: 'Données réelles connectées'
        };
      } else {
        console.warn('⚠️ Autorisation Google Fit refusée');
        this.platform = 'mock';
        return { 
          success: false, 
          platform: 'mock',
          message: 'Autorisation refusée'
        };
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Google Fit:', error);
      this.platform = 'mock';
      return { 
        success: false, 
        platform: 'mock',
        message: error.message
      };
    }
  }

  async checkStatus() {
    try {
      const isAuthorized = GoogleFit.isAuthorized;
      
      console.log('📊 Status Google Fit:', isAuthorized);
      
      if (isAuthorized) {
        this.isInitialized = true;
        this.platform = 'GoogleFit';
        return { 
          platform: 'GoogleFit', 
          status: 'Connecté',
          isConnected: true
        };
      }
      
      return { 
        platform: 'mock', 
        status: 'Déconnecté',
        isConnected: false
      };
    } catch (error) {
      console.error('❌ Erreur checkStatus:', error);
      return { 
        platform: 'mock', 
        status: 'Erreur: ' + error.message,
        isConnected: false
      };
    }
  }

  async saveHRVMorning(data) {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem('hrv_morning_cache', JSON.stringify({
        data,
        date: today
      }));
      console.log('💾 HRV Morning sauvegardé dans AsyncStorage');
    } catch (error) {
      console.error('Erreur sauvegarde HRV:', error);
    }
  }

  async loadHRVMorning() {
    try {
      const cached = await AsyncStorage.getItem('hrv_morning_cache');
      if (!cached) return null;
      
      const { data, date } = JSON.parse(cached);
      const today = new Date().toDateString();
      
      if (date === today) {
        console.log('✅ HRV Morning chargé depuis AsyncStorage');
        return data;
      } else {
        console.log('🔄 HRV Morning expiré (nouveau jour)');
        await AsyncStorage.removeItem('hrv_morning_cache');
        return null;
      }
    } catch (error) {
      console.error('Erreur chargement HRV:', error);
      return null;
    }
  }

  async getRestingHR() {
    if (this.platform === 'GoogleFit' && this.isInitialized) {
      try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);

        const options = {
          startDate: startDate.toISOString(),
          endDate: today.toISOString(),
        };

        const heartRateSamples = await GoogleFit.getHeartRateSamples(options);
        
        if (heartRateSamples && heartRateSamples.length > 0) {
          const allBPM = heartRateSamples
            .map(sample => sample.value)
            .filter(bpm => bpm > 40 && bpm < 100);

          if (allBPM.length > 0) {
            allBPM.sort((a, b) => a - b);
            
            const lowest10Percent = allBPM.slice(0, Math.ceil(allBPM.length * 0.1));
            const avgHR = Math.round(lowest10Percent.reduce((a, b) => a + b, 0) / lowest10Percent.length);
            
            const status = this.getHRStatus(avgHR);

            return {
              success: true,
              data: { value: avgHR, unit: 'bpm' },
              status,
              interpretation: this.getHRInterpretation(status),
              source: 'Google Fit',
              samplesUsed: lowest10Percent.length,
              samplesTotal: heartRateSamples.length
            };
          }
        }
      } catch (error) {
        console.warn('⚠️ Erreur lecture FC Google Fit:', error);
      }
    }

    // Fallback MOCK
    const randomHR = 55 + Math.floor(Math.random() * 20);
    const status = this.getHRStatus(randomHR);

    return {
      success: true,
      data: { value: randomHR, unit: 'bpm' },
      status,
      interpretation: this.getHRInterpretation(status),
      source: 'Simulation'
    };
  }

  async getHRVMorningBaseline() {
    try {
      const cached = await this.loadHRVMorning();
      if (cached) {
        return cached;
      }
      
      const today = new Date();
      today.setHours(6, 0, 0, 0);
      const morningEnd = new Date();
      morningEnd.setHours(10, 0, 0, 0);
      
      const now = new Date();
      if (now.getHours() < 10) {
        today.setDate(today.getDate() - 1);
        morningEnd.setDate(morningEnd.getDate() - 1);
      }
      
      const hrvMorning = await this.getHRVInTimeRange(today, morningEnd);
      
      if (hrvMorning && hrvMorning.value) {
        const result = {
          success: true,
          value: hrvMorning.value,
          timestamp: hrvMorning.timestamp,
          quality: this.getHRVQuality(hrvMorning.value),
          isBaseline: true,
          timeWindow: '6h-10h'
        };
        
        await this.saveHRVMorning(result);
        
        return result;
      }
      
      return { success: false };
      
    } catch (error) {
      console.error('❌ HRV morning:', error);
      return { success: false, error: error.message };
    }
  }

  async getHRVCurrent() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const currentHRV = await this.getHRVInTimeRange(oneHourAgo, now);
      
      if (currentHRV && currentHRV.value) {
        return {
          success: true,
          value: currentHRV.value,
          timestamp: currentHRV.timestamp,
          quality: this.getHRVQuality(currentHRV.value),
          isBaseline: false,
          recency: Math.round((now - new Date(currentHRV.timestamp)) / 60000)
        };
      }
      
      return { success: false };
      
    } catch (error) {
      console.error('❌ HRV current:', error);
      return { success: false, error: error.message };
    }
  }

  async getHRVDual() {
    try {
      const [morning, current] = await Promise.all([
        this.getHRVMorningBaseline(),
        this.getHRVCurrent()
      ]);
      
      const result = {
        morning: morning.success ? morning : null,
        current: current.success ? current : null,
        hasBaseline: morning.success,
        hasCurrent: current.success
      };
      
      if (morning.success && current.success) {
        const deviation = ((current.value - morning.value) / morning.value) * 100;
        
        result.deviation = {
          percentage: Math.round(deviation),
          absolute: current.value - morning.value,
          status: this.getDeviationStatus(deviation),
          // 🔥 FIX: Retourner SEULEMENT le message, pas l'objet complet
          interpretation: this.getDeviationInterpretation(deviation).message,
          // 🔥 NOUVEAU: Garder l'objet complet dans un champ séparé
          details: this.getDeviationInterpretation(deviation)
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ HRV dual:', error);
      return {
        morning: null,
        current: null,
        hasBaseline: false,
        hasCurrent: false
      };
    }
  }

  async getSleepData() {
    if (this.platform === 'GoogleFit' && this.isInitialized) {
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(18, 0, 0, 0);

        const options = {
          startDate: yesterday.toISOString(),
          endDate: today.toISOString(),
        };

        const sleepData = await GoogleFit.getSleepSamples(options);
        
        if (sleepData && sleepData.length > 0) {
          const uniqueSessions = this.mergeSleepSessions(sleepData);

          const totalMinutes = uniqueSessions.reduce((sum, session) => {
            const start = new Date(session.startDate);
            const end = new Date(session.endDate);
            const duration = (end - start) / 60000;
            
            if (duration > 720) {
              return sum;
            }
            
            return sum + duration;
          }, 0);

          const hours = totalMinutes / 60;
          const cappedHours = Math.min(hours, 12);
          const quality = this.getSleepQuality(cappedHours);
          
          return {
            success: true,
            duration: cappedHours.toFixed(1) + 'h',
            hours: cappedHours,
            totalMinutes: Math.round(cappedHours * 60),
            quality,
            recommendation: this.getSleepRecommendation(quality),
            source: 'Google Fit',
            sessionsCount: uniqueSessions.length
          };
        }
      } catch (error) {
        console.warn('⚠️ Erreur lecture sommeil Google Fit:', error);
      }
    }

    // Fallback MOCK
    const hours = 5 + Math.random() * 4;
    const quality = this.getSleepQuality(hours);
    
    return {
      success: true,
      duration: hours.toFixed(1) + 'h',
      hours: hours,
      totalMinutes: Math.round(hours * 60),
      quality,
      recommendation: this.getSleepRecommendation(quality),
      source: 'Simulation'
    };
  }

  mergeSleepSessions(sessions) {
    if (!sessions || sessions.length === 0) return [];
    
    const sorted = [...sessions].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );
    
    const merged = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];
      
      const lastEnd = new Date(last.endDate);
      const currentStart = new Date(current.startDate);
      
      if ((currentStart - lastEnd) / 60000 < 30) {
        last.endDate = new Date(Math.max(
          new Date(last.endDate),
          new Date(current.endDate)
        )).toISOString();
      } else {
        merged.push(current);
      }
    }
    
    return merged;
  }

  async calculateStressScore(sleepData, restingHR, hrvData = null) {
    let score = 0;
    const factors = [];
    const metrics = {};

    // Sommeil
    if (sleepData.quality === 'poor') {
      score += 25;
      factors.push({
        name: 'Sommeil insuffisant',
        impact: 'high',
        value: sleepData.duration
      });
    } else if (sleepData.quality === 'acceptable') {
      score += 12;
      factors.push({
        name: 'Sommeil limite',
        impact: 'moderate',
        value: sleepData.duration
      });
    }
    metrics.sleep = {
      duration: sleepData.duration,
      quality: sleepData.quality,
      score: sleepData.quality === 'poor' ? 25 : sleepData.quality === 'acceptable' ? 12 : 0
    };

    // FC
    if (restingHR.status === 'elevated-critical') {
      score += 30;
      factors.push({
        name: 'FC repos très élevée',
        impact: 'critical',
        value: `${restingHR.data.value} bpm`
      });
    } else if (restingHR.status === 'elevated') {
      score += 18;
      factors.push({
        name: 'FC légèrement haute',
        impact: 'moderate',
        value: `${restingHR.data.value} bpm`
      });
    }
    metrics.heartRate = {
      value: restingHR.data.value,
      status: restingHR.status,
      score: restingHR.status === 'elevated-critical' ? 30 : restingHR.status === 'elevated' ? 18 : 0
    };

    // HRV
    if (hrvData && hrvData.success) {
      score += hrvData.stressImpact;
      
      if (hrvData.stressImpact > 25) {
        factors.push({
          name: 'HRV critique - Épuisement',
          impact: 'critical',
          value: `${hrvData.value}ms`
        });
      } else if (hrvData.stressImpact > 15) {
        factors.push({
          name: 'HRV basse - Fatigue',
          impact: 'high',
          value: `${hrvData.value}ms`
        });
      } else if (hrvData.stressImpact > 5) {
        factors.push({
          name: 'HRV modérée',
          impact: 'moderate',
          value: `${hrvData.value}ms`
        });
      }

      metrics.hrv = {
        value: hrvData.value,
        status: hrvData.status,
        score: hrvData.stressImpact,
        confidence: hrvData.confidence,
        isProxy: hrvData.isProxy
      };
    }

    score = Math.max(0, Math.min(100, score));

    let level, urgency, recommendation;
    if (score >= 70) {
      level = 'critical';
      urgency = 'REPOS OBLIGATOIRE';
      recommendation = '🚨 Arrêtez toute activité intense. Repos complet nécessaire.';
    } else if (score >= 50) {
      level = 'high';
      urgency = 'Réduction charge recommandée';
      recommendation = '⚠️ Limitez vos efforts. Priorisez la récupération.';
    } else if (score >= 30) {
      level = 'moderate';
      urgency = 'Vigilance accrue';
      recommendation = 'ℹ️ Maintenez vigilance. Intégrez plus de pauses.';
    } else {
      level = 'low';
      urgency = null;
      recommendation = '✅ Excellent état. Continuez vos bonnes habitudes.';
    }

    return {
      score,
      level,
      urgency,
      recommendation,
      factors,
      metrics,
      recoveryDaysNeeded: Math.ceil(score / 20),
      recoveryScore: 100 - score,
      hasHRV: !!(hrvData && hrvData.success),
      lastUpdate: new Date().toISOString()
    };
  }

  // Helpers
  getHRVQuality(value) {
    if (value >= 60) return 'excellent';
    if (value >= 40) return 'good';
    if (value >= 25) return 'moderate';
    return 'low';
  }

  getDeviationStatus(deviation) {
    if (deviation < -20) return 'critical_drop';
    if (deviation < -10) return 'significant_drop';
    if (deviation < 0) return 'slight_drop';
    if (deviation < 10) return 'stable';
    if (deviation < 20) return 'slight_increase';
    return 'significant_increase';
  }

  // 🔥 FIX: Cette fonction retourne maintenant un objet complet
  // mais SmartHomeScreen utilisera seulement .message
  getDeviationInterpretation(deviation) {
    if (deviation < -20) {
      return {
        emoji: '🚨',
        title: 'Stress Aigu Détecté',
        message: 'HRV a chuté >20%. Pause immédiate.',
        priority: 'critical'
      };
    }
    
    if (deviation < -10) {
      return {
        emoji: '⚠️',
        title: 'Fatigue Accumulée',
        message: 'Système nerveux fatigué. Pause recommandée.',
        priority: 'high'
      };
    }
    
    if (deviation < 0) {
      return {
        emoji: '📉',
        title: 'Légère Baisse',
        message: 'Diminution normale en journée.',
        priority: 'moderate'
      };
    }
    
    if (deviation < 10) {
      return {
        emoji: '✅',
        title: 'Stable',
        message: 'HRV stable. Continue !',
        priority: 'low'
      };
    }
    
    return {
      emoji: '💪',
      title: 'Excellente Récupération',
      message: 'HRV meilleure qu\'au réveil !',
      priority: 'low'
    };
  }

  async getHRVInTimeRange(startDate, endDate) {
    try {
      return {
        value: Math.floor(Math.random() * 40) + 40,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return null;
    }
  }

  getHRStatus(hr) {
    if (hr > 80) return 'elevated-critical';
    if (hr > 70) return 'elevated';
    if (hr < 55) return 'improving';
    return 'normal';
  }

  getSleepQuality(hours) {
    if (hours >= 7.5) return 'optimal';
    if (hours >= 6) return 'acceptable';
    return 'poor';
  }

  getHRInterpretation(status) {
    const interpretations = {
      'elevated-critical': '🚨 FC repos très élevée - Surmenage détecté',
      'elevated': '⚠️ FC en hausse - Vigilance requise',
      'normal': '✅ FC stable - Récupération normale',
      'improving': '✅ FC en baisse - Amélioration cardiovasculaire'
    };
    return interpretations[status] || 'FC normale';
  }

  getSleepRecommendation(quality) {
    const recommendations = {
      'optimal': 'Continuez vos bonnes habitudes',
      'acceptable': 'Visez 30-60 min supplémentaires',
      'poor': 'Priorisez le repos - Dette de sommeil'
    };
    return recommendations[quality] || 'Maintenez routine';
  }

  async disconnect() {
    try {
      if (this.platform === 'GoogleFit') {
        await GoogleFit.disconnect();
      }
      this.isInitialized = false;
      this.platform = 'mock';
      console.log('✅ Google Fit déconnecté');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }

  isLiveMode() {
    return this.platform === 'GoogleFit' && this.isInitialized;
  }
}

export default new BiometricService();