// services/intelligentRecommendationsService.js - VERSION FINALE CORRIGÉE
import smartTechniqueMatcher from './smartTechniqueMatcher';

class IntelligentRecommendationsService {
  
  /**
   * 🧠 Générer recommandations avec fusion PSS-4 + PERMA + Biométrie
   */
  async generateSmartRecommendations(biometricData, context, userHistory, userProfile) {
    const recommendations = [];
    
    const stressProfile = userProfile?.stressProfile;
    const wellbeingProfile = userProfile?.wellbeingProfile;
    const chronotype = userProfile?.chronotype;
    
    console.log('🧠 Analyse fusion PSS-4 + PERMA + Biométrie...');
    console.log('📊 Données disponibles:', {
      hasStressProfile: !!stressProfile,
      hasWellbeingProfile: !!wellbeingProfile,
      hasChronotype: !!chronotype,
      hasBiometric: !!biometricData?.hrv,
      historyLength: userHistory?.length || 0
    });
    
    // 🔥 CAS 1 : HRV Critique + PSS-4 "Control" Élevé
    if (biometricData?.hrv?.value < 40 && stressProfile?.pssBreakdown?.control === 'high') {
      recommendations.push({
        priority: 'critical',
        type: 'control_loss_somatic',
        title: '🎯 Reprendre le Contrôle (Urgent)',
        reason: 'HRV critique (' + biometricData.hrv.value + 'ms) + Sentiment de perte de contrôle',
        timing: 'Maintenant',
        duration: '10-15 min',
        expectedImpact: { hrv: '+20-30% en 24h', timeframe: '24-48h' },
        scientificRationale: 'Contrôle perçu ↓ cortisol 35% (Bandura, 1997)'
      });
    }
    
    // 🔥 CAS 2 : Sommeil OK + PERMA "Relationships" Bas
    if (biometricData?.sleep?.quality === 'good' && wellbeingProfile?.relationships < 3) {
      recommendations.push({
        priority: 'high',
        type: 'social_isolation',
        title: '🤝 Renforcer les Connexions Sociales',
        reason: 'Ton corps récupère bien mais Relations faibles (' + wellbeingProfile.relationships + '/5)',
        timing: 'Aujourd\'hui',
        duration: '15-30 min',
        expectedImpact: { relationships: '+0.5-1.0 points', timeframe: '1 semaine' },
        scientificRationale: 'Soutien social = buffer stress (Cohen & Wills, 1985)'
      });
    }
    
    // 🔥 CAS 3 : HRV Normale + PSS-4 Élevé
    if (biometricData?.hrv?.value > 50 && stressProfile?.score > 10) {
      recommendations.push({
        priority: 'moderate',
        type: 'cognitive_reframe',
        title: '🧠 Recalibrer ta Perception',
        reason: 'HRV bonne (' + biometricData.hrv.value + 'ms) mais PSS-4 élevé (' + stressProfile.score + '/16)',
        timing: 'Aujourd\'hui',
        duration: '10-20 min',
        expectedImpact: { pss4: '-2-4 points', timeframe: '1-2 semaines' },
        scientificRationale: 'Reappraisal ↓ amygdale 50% (Ochsner, 2012)'
      });
    }
    
    // 🔥 CAS 4 : FC Élevée + PERMA "Accomplishment" Bas
    if (biometricData?.restingHR?.data?.value > 75 && wellbeingProfile?.accomplishment < 3) {
      recommendations.push({
        priority: 'high',
        type: 'achievement_stress',
        title: '🏆 Célébrer les Victoires',
        reason: 'FC élevée (' + biometricData.restingHR.data.value + ' bpm) + Accomplissement faible',
        timing: 'Chaque soir',
        duration: '5-10 min',
        expectedImpact: { accomplishment: '+1.0-1.5 points', hr: '-5-10 bpm', timeframe: '2-3 semaines' },
        scientificRationale: 'Progress Principle ↓ burnout 44% (Amabile, 2011)'
      });
    }
    
    // 🔥 CAS 5 : Dette Sommeil + PERMA "Meaning" Bas
    if (biometricData?.sleep?.quality === 'poor' && wellbeingProfile?.meaning < 3) {
      recommendations.push({
        priority: 'high',
        type: 'existential_fatigue',
        title: '🌟 Retrouver le Sens',
        reason: 'Dette sommeil (' + biometricData.sleep.duration + 'h) + Manque sens',
        timing: '2h avant coucher',
        duration: '20-30 min',
        expectedImpact: { sleep: '+1-2h', meaning: '+0.5-1.0', timeframe: '1-2 semaines' },
        scientificRationale: 'Purpose in Life ↓ insomnie 63% (Kim, 2015)'
      });
    }
    
    // 🔥 CAS 6 : PERMA "Engagement" Bas + Chronotype Evening
    if (wellbeingProfile?.engagement < 3 && chronotype?.type?.includes('evening')) {
      recommendations.push({
        priority: 'moderate',
        type: 'flow_optimization',
        title: '⚡ Optimiser tes Moments Flow',
        reason: 'Engagement faible (' + wellbeingProfile.engagement + '/5) + Hibou',
        timing: 'Pendant ton pic (' + (chronotype.optimalPerformanceWindow || 'soirée') + ')',
        duration: '90 min',
        expectedImpact: { engagement: '+1.0-1.5', productivity: '+40-60%', timeframe: '1-2 semaines' },
        scientificRationale: 'Chronotype alignment +56% flow (Roenneberg, 2012)'
      });
    }
    
    // 🔥 CAS 7 : HRV Morning-Current Gap Élevé
    if (biometricData?.hrvDual?.deviation?.percentage < -20) {
      recommendations.push({
        priority: 'critical',
        type: 'acute_stress_detected',
        title: '🚨 Pic de Stress Aigu',
        reason: 'HRV chute ' + Math.abs(biometricData.hrvDual.deviation.percentage) + '% vs matin',
        timing: 'MAINTENANT',
        duration: '5 min',
        expectedImpact: { hrv: '+10-15%', immediate: '<5 min', timeframe: 'Immédiat' },
        scientificRationale: 'Chute HRV >20% = stress aigu (Thayer, 2012)'
      });
    }
    
    // 🔥 CAS 8 : Tout va bien → Maintien
    const overallWellbeing = this.calculateOverallWellbeing(biometricData, stressProfile, wellbeingProfile);
    
    if (recommendations.length === 0 || overallWellbeing >= 75) {
      recommendations.push({
        priority: 'low',
        type: 'maintenance',
        title: overallWellbeing >= 75 ? '✨ Maintenir l\'Excellence' : '🎯 Commencer ta Routine',
        reason: overallWellbeing >= 75 
          ? `Score global ${overallWellbeing}/100 → Excellent état`
          : 'Construis des habitudes solides dès maintenant',
        timing: 'Quand tu veux',
        duration: '10-15 min',
        expectedImpact: { maintenance: overallWellbeing >= 75 ? 'Stabilité long-terme' : 'Construction habitudes' },
        scientificRationale: 'Maintien proactif > réactif (Seligman, 2011)'
      });
    }
    
    // 🔥 CAS 9 : Recommandations Temporelles
    const timeBasedRec = this.getTimeBasedRecommendation(new Date(), chronotype, biometricData);
    if (timeBasedRec) {
      recommendations.push(timeBasedRec);
    }
    
    console.log(`📋 ${recommendations.length} recommandations brutes générées`);
    
    // 🔥 PRIORISER
    const prioritized = this.prioritizeRecommendations(recommendations);
    
    console.log(`🎯 ${prioritized.length} recommandations après priorisation`);
    
    // 🔥 MATCHER TECHNIQUES pour chaque recommandation
    const enriched = await this.enrichRecommendationsWithTechniques(
      prioritized, 
      userProfile, 
      biometricData,
      context,
      userHistory
    );
    
    console.log(`✅ ${enriched.length} recommandations finales avec techniques`);
    
    return enriched;
  }

  /**
   * 🔥 Enrichir recommandations avec techniques matchées
   */
  async enrichRecommendationsWithTechniques(recommendations, userProfile, biometricData, context, userHistory) {
    // ✅ CHARGER TOUTES LES TECHNIQUES
    const allHabits = await this.loadAllHabits();
    
    if (!allHabits || allHabits.length === 0) {
      console.error('❌ Aucune technique chargée !');
      return recommendations.map(rec => ({ ...rec, techniques: [] }));
    }
    
    console.log(`📚 ${allHabits.length} techniques chargées pour matching`);
    
    const enriched = [];
    
    for (const rec of recommendations) {
      // Construire contexte user pour matcher
      const userContext = {
        userId: userProfile.id,
        biometric: biometricData,
        mental: {
          pss4: userProfile.stressProfile?.score,
          perma: userProfile.wellbeingProfile
        },
        chronotype: userProfile.chronotype,
        history: {
          recent: userHistory?.slice(-10) || []
        },
        currentMood: 'neutral',
        energyLevel: this.estimateEnergyLevel(biometricData),
        isPremium: userProfile.isPremium || false,
        hasPrivacy: true,
        timeAvailable: this.estimateTimeAvailable()
      };
      
      try {
        // 🔥 Matcher techniques avec RAISONS
        const matchedTechniques = await smartTechniqueMatcher.matchTechniques(
          rec,
          allHabits,
          userContext
        );
        
        enriched.push({
          ...rec,
          techniques: matchedTechniques.map(mt => ({
            ...mt.habit,
            matchScore: mt.score,
            reasons: mt.reasons
          }))
        });
      } catch (error) {
        console.error('⚠️ Erreur matching pour', rec.type, ':', error.message);
        enriched.push({
          ...rec,
          techniques: [] // Fallback sans techniques
        });
      }
    }
    
    return enriched;
  }

  /**
   * ✅ CHARGER TOUTES LES TECHNIQUES - CORRIGÉ
   */
  async loadAllHabits() {
    try {
      // ✅ Import direct depuis data/habits.js
      const habitsModule = require('../data/habits');
      const habits = habitsModule.default || habitsModule;
      
      if (!habits || !Array.isArray(habits)) {
        console.error('❌ Format habits invalide:', typeof habits);
        return [];
      }
      
      console.log(`✅ ${habits.length} techniques chargées depuis habits.js`);
      return habits;
    } catch (error) {
      console.error('❌ Erreur chargement techniques:', error.message);
      
      // 🔥 Fallback : essayer depuis useHabitsStore
      try {
        const useHabitsStore = require('../store/useHabitsStore').default;
        const { habits } = useHabitsStore.getState();
        
        if (habits && habits.length > 0) {
          console.log(`✅ ${habits.length} techniques depuis store (fallback)`);
          return habits;
        }
      } catch (storeError) {
        console.error('❌ Fallback store échoué:', storeError.message);
      }
      
      return [];
    }
  }

  /**
   * Calculer score global (0-100)
   */
  calculateOverallWellbeing(biometricData, stressProfile, wellbeingProfile) {
    let score = 0;
    let components = 0;
    
    if (biometricData?.stressScore?.recoveryScore) {
      score += biometricData.stressScore.recoveryScore * 0.4;
      components++;
    }
    
    if (stressProfile?.score !== undefined) {
      const pssNormalized = ((16 - stressProfile.score) / 16) * 100;
      score += pssNormalized * 0.3;
      components++;
    }
    
    if (wellbeingProfile?.overallScore) {
      const permaNormalized = (wellbeingProfile.overallScore / 5) * 100;
      score += permaNormalized * 0.3;
      components++;
    }
    
    return components > 0 ? Math.round(score) : null;
  }

  /**
   * Recommandations temporelles
   */
  getTimeBasedRecommendation(currentTime, chronotype, biometricData) {
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 10 && biometricData?.hrvDual?.morning) {
      if (biometricData.hrvDual.morning.value < 40) {
        return {
          priority: 'high',
          type: 'morning_recovery',
          title: '🌅 Récupération Matinale',
          reason: 'HRV réveil basse (' + biometricData.hrvDual.morning.value + 'ms)',
          timing: 'Avant le café',
          duration: '10 min',
          scientificRationale: 'NSDR morning → HRV 28% (Huberman, 2023)'
        };
      }
    }
    
    if (hour >= 14 && hour < 16) {
      return {
        priority: 'moderate',
        type: 'afternoon_dip',
        title: '☀️ Creux Circadien',
        reason: 'Baisse énergie naturelle 14h-16h',
        timing: 'Maintenant',
        duration: '20 min',
        scientificRationale: 'Nap 20min → performance 34% (Mednick, 2008)'
      };
    }
    
    if (hour >= 20 && hour < 23) {
      if (chronotype?.type?.includes('evening')) {
        return {
          priority: 'moderate',
          type: 'evening_peak',
          title: '🦉 Ton Pic Performance',
          reason: 'Hibou : C\'est TON moment optimal',
          timing: 'Maintenant',
          duration: '90 min',
          scientificRationale: 'Chronotype alignment +60% (Roenneberg, 2012)'
        };
      } else {
        return {
          priority: 'high',
          type: 'evening_wind_down',
          title: '🌙 Préparation Sommeil',
          reason: 'Optimise récupération nocturne',
          timing: 'Dans 2h',
          duration: '30 min',
          scientificRationale: 'Wind down → sommeil 42% (Irish, 2015)'
        };
      }
    }
    
    return null;
  }

  /**
   * Prioriser recommandations
   */
  prioritizeRecommendations(recommendations) {
    const priorityOrder = {
      'critical': 0,
      'high': 1,
      'moderate': 2,
      'low': 3
    };
    
    return recommendations
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 3); // Max 3 recommandations
  }

  /**
   * Helpers
   */
  estimateEnergyLevel(biometricData) {
    const hrv = biometricData?.hrv?.value || 50;
    const sleep = parseFloat(biometricData?.sleep?.duration) || 7;
    
    let energy = 5;
    
    if (hrv > 60) energy += 2;
    else if (hrv < 40) energy -= 2;
    
    if (sleep > 7.5) energy += 1;
    else if (sleep < 6) energy -= 2;
    
    return Math.max(1, Math.min(10, energy));
  }

  estimateTimeAvailable() {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 9) return 5;
    if (hour >= 12 && hour < 14) return 10;
    if (hour >= 14 && hour < 18) return 15;
    if (hour >= 18) return 20;
    return 10;
  }
}

export default new IntelligentRecommendationsService();