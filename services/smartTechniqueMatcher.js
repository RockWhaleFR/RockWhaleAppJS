// services/smartTechniqueMatcher.js - VERSION CORRIGÉE
import AsyncStorage from '@react-native-async-storage/async-storage';

class SmartTechniqueMatcher {
  
  /**
   * 🎯 TROUVE LA TECHNIQUE PARFAITE
   * Retourne 1-3 techniques avec RAISONS explicites
   */
  async matchTechniques(recommendation, allHabits, userContext) {
    const { type, priority } = recommendation;
    
    // 🔥 CRITÈRES enrichis
    const criteria = await this.buildEnhancedCriteria(recommendation, userContext);
    
    // 🔥 SCORE chaque technique
    const scoredTechniques = allHabits.map(habit => {
      const score = this.scoreHabitAdvanced(habit, criteria);
      const reasons = this.explainScore(habit, criteria, score);
      
      return {
        habit,
        score: score.total,
        breakdown: score.breakdown,
        reasons // 🔥 Explications
      };
    });
    
    // 🔥 TRI + variété intelligente
    let topTechniques = scoredTechniques
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 candidats
    
    // 🔥 Injection 20% "wildcard" pour exploration
    if (Math.random() < 0.2 && topTechniques.length > 3) {
      const wildcard = this.getWildcardTechnique(allHabits, criteria);
      if (wildcard) {
        topTechniques[2] = {
          ...wildcard,
          reasons: ['🎲 Suggestion créative - Élargis ton répertoire !']
        };
      }
    }
    
    // Garde top 3
    topTechniques = topTechniques.slice(0, 3);
    
    console.log(`🎯 Matched ${topTechniques.length} techniques for ${type}`);
    topTechniques.forEach((t, i) => {
      console.log(`  ${i+1}. ${t.habit.title} (score: ${t.score.toFixed(1)}) - ${t.reasons[0]}`);
    });
    
    return topTechniques;
  }
  
  /**
   * 🔥 CRITÈRES ENRICHIS (avec historique succès)
   */
  async buildEnhancedCriteria(recommendation, userContext) {
    const criteria = {
      // Contraintes temporelles
      maxDuration: this.getMaxDuration(recommendation.priority, userContext),
      timeAvailable: this.estimateTimeAvailable(userContext),
      
      // Type de besoin
      needType: this.mapRecommendationType(recommendation.type),
      
      // État physiologique
      hrvLevel: userContext.biometric?.hrv?.value || 50,
      hrvTrend: userContext.biometric?.hrvDual?.deviation?.percentage || 0,
      stressLevel: userContext.mental?.pss4 || 8,
      sleepDebt: userContext.biometric?.sleep?.debt || 0,
      
      // État mental actuel
      currentMood: userContext?.currentMood || 'neutral',
energyLevel: userContext?.energyLevel ?? userContext?.energy ?? 5,
      
      // Profil psychologique
      permaWeaknesses: this.identifyPermaWeaknesses(userContext.mental?.perma),
      chronotype: userContext.chronotype?.type || 'intermediate',
      
      // Historique personnel
      recentTechniques: userContext.history?.recent?.map(h => h.techniqueId || h.habit?.id).filter(Boolean) || [],
      successRates: await this.getUserSuccessRates(userContext.userId),
      
      // Préférences implicites
      preferredDurations: this.analyzePreferredDurations(userContext.history),
      preferredCategories: this.analyzePreferredCategories(userContext.history),
      
      // Contexte
      isWorkingHours: this.isWorkingHours(),
      hasPrivacy: userContext.hasPrivacy !== false,
      isPremium: userContext.isPremium || false
    };
    
    return criteria;
  }
  
  /**
   * 🔥 SCORING AVANCÉ
   */
  scoreHabitAdvanced(habit, criteria) {
    const breakdown = {};
    let totalScore = 0;
    
    // 1️⃣ DURÉE COMPATIBLE (25%)
    const durationScore = this.scoreDuration(habit, criteria);
    breakdown.duration = durationScore;
    totalScore += durationScore * 0.25;
    
    // 2️⃣ TYPE CORRESPONDANT (25%)
    const typeScore = this.scoreType(habit, criteria);
    breakdown.type = typeScore;
    totalScore += typeScore * 0.25;
    
    // 3️⃣ EFFICACITÉ CONTEXTUELLE (20%)
    const efficacyScore = this.scoreEfficacy(habit, criteria);
    breakdown.efficacy = efficacyScore;
    totalScore += efficacyScore * 0.20;
    
    // 4️⃣ SUCCÈS PASSÉS USER (15%)
    const personalSuccessScore = this.scorePersonalSuccess(habit, criteria);
    breakdown.personalSuccess = personalSuccessScore;
    totalScore += personalSuccessScore * 0.15;
    
    // 5️⃣ VARIÉTÉ (10%)
    const varietyScore = this.scoreVariety(habit, criteria);
    breakdown.variety = varietyScore;
    totalScore += varietyScore * 0.10;
    
    // 6️⃣ PERMA ALIGNMENT (5%)
    const permaScore = this.scorePerma(habit, criteria);
    breakdown.perma = permaScore;
    totalScore += permaScore * 0.05;
    
    // 🎁 BONUS CONTEXTUELS
    const bonuses = this.calculateBonuses(habit, criteria);
    breakdown.bonuses = bonuses;
    totalScore += bonuses;
    
    return {
      total: Math.max(0, Math.min(100, totalScore)),
      breakdown
    };
  }
  
  /**
   * 🔥 SCORE DURÉE
   */
  scoreDuration(habit, criteria) {
    const duration = this.parseDuration(habit.duration);
    const max = criteria.maxDuration;
    const time = criteria.timeAvailable;
    
    if (duration > time) return 0;
    if (duration > max) return Math.max(0, 50 - (duration - max) * 5);
    
    const sweetSpot = max * 0.8;
    const distance = Math.abs(duration - sweetSpot);
    
    return Math.max(0, 100 - distance * 5);
  }
  
  /**
   * 🔥 SCORE TYPE
   */
  scoreType(habit, criteria) {
    const habitTypes = this.extractHabitTypes(habit);
    const targetTypes = criteria.needType;
    
    const overlap = habitTypes.filter(t => targetTypes.includes(t)).length;
    const maxPossible = Math.max(habitTypes.length, targetTypes.length, 1);
    
    const baseScore = (overlap / maxPossible) * 100;
    
    if (targetTypes.some(t => habit.category?.toLowerCase().includes(t))) {
      return Math.min(100, baseScore + 20);
    }
    
    return baseScore;
  }
  
  /**
   * 🔥 SCORE EFFICACITÉ
   */
  scoreEfficacy(habit, criteria) {
    let score = 0;
    
    if (criteria.hrvLevel < 40) {
      if (this.isParasympatheticTechnique(habit)) score += 30;
    }
    
    if (criteria.hrvTrend < -15) {
      if (habit.tags?.includes('emergency') || this.parseDuration(habit.duration) <= 5) {
        score += 25;
      }
    }
    
    if (criteria.stressLevel > 10) {
      if (habit.tags?.includes('high-impact') && habit.efficacyRate > 85) {
        score += 20;
      }
    }
    
    if (criteria.sleepDebt >= 2) {
      if (this.isEnergizingTechnique(habit)) score += 20;
    }
    
    if (criteria.currentMood === 'bad' && criteria.energyLevel < 4) {
      if (habit.tags?.includes('energy') || habit.category === 'Énergie') {
        score += 15;
      }
    }
    
    if (criteria.isWorkingHours && !criteria.hasPrivacy) {
      if (this.parseDuration(habit.duration) <= 5 && 
          !habit.title.toLowerCase().includes('mouve')) {
        score += 10;
      }
    }
    
    return Math.min(100, score);
  }
  
  /**
   * 🔥 SCORE SUCCÈS PERSONNELS
   */
  scorePersonalSuccess(habit, criteria) {
    const successRates = criteria.successRates;
    if (!successRates || !successRates[habit.id]) return 50;
    
    const rate = successRates[habit.id];
    
    if (rate.completions < 3) return 50;
    
    const successPercent = (rate.successes / rate.completions) * 100;
    
    return Math.pow(successPercent / 100, 0.7) * 100;
  }
  
  /**
   * 🔥 SCORE VARIÉTÉ
   */
  scoreVariety(habit, criteria) {
    const recentIds = criteria.recentTechniques;
    
    if (!recentIds.includes(habit.id)) return 100;
    
    const lastUseIndex = recentIds.indexOf(habit.id);
    const recency = recentIds.length - lastUseIndex;
    
    return Math.max(0, 100 - recency * 15);
  }
  
  /**
   * 🔥 SCORE PERMA
   */
  scorePerma(habit, criteria) {
    if (!criteria.permaWeaknesses || criteria.permaWeaknesses.length === 0) {
      return 50;
    }
    
    const habitPermaImpact = this.extractPermaImpact(habit);
    const overlap = habitPermaImpact.filter(p => 
      criteria.permaWeaknesses.includes(p)
    ).length;
    
    return overlap * 50;
  }
  
  /**
   * 🎁 BONUS CONTEXTUELS
   */
  calculateBonuses(habit, criteria) {
    let bonuses = 0;
    
    const currentHour = new Date().getHours();
    if (this.isChronotypeOptimal(currentHour, criteria.chronotype, habit)) {
      bonuses += 10;
    }
    
    const duration = this.parseDuration(habit.duration);
    if (criteria.preferredDurations.includes(Math.round(duration / 5) * 5)) {
      bonuses += 5;
    }
    
    if (criteria.preferredCategories.includes(habit.category)) {
      bonuses += 5;
    }
    
    if (!criteria.isPremium && !habit.isPremium) {
      bonuses += 5;
    }
    
    return bonuses;
  }
  
  /**
   * 💬 EXPLIQUER LE SCORE
   */
  explainScore(habit, criteria, score) {
    const reasons = [];
    const breakdown = score.breakdown;
    
    const topFactor = Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topFactor[0] === 'type' && topFactor[1] > 70) {
      reasons.push(`✅ Parfaite pour ton besoin actuel`);
    }
    
    if (topFactor[0] === 'personalSuccess' && topFactor[1] > 70) {
      reasons.push(`🎯 Tu as eu ${Math.round(breakdown.personalSuccess)}% de succès avec cette technique`);
    }
    
    if (topFactor[0] === 'efficacy' && topFactor[1] > 70) {
      if (criteria.hrvLevel < 40) {
        reasons.push(`💚 Optimale pour ton HRV actuelle (${criteria.hrvLevel}ms)`);
      } else if (criteria.stressLevel > 10) {
        reasons.push(`🧠 Efficacité scientifique prouvée pour ton niveau de stress`);
      }
    }
    
    if (breakdown.duration > 80) {
      reasons.push(`⏱️ Durée idéale (${habit.duration})`);
    }
    
    if (breakdown.variety === 100) {
      reasons.push(`✨ Nouvelle technique à découvrir`);
    }
    
    if (breakdown.bonuses >= 10) {
      if (this.isChronotypeOptimal(new Date().getHours(), criteria.chronotype, habit)) {
        reasons.push(`🕐 Moment optimal selon ton chronotype`);
      }
    }
    
    if (reasons.length === 0) {
      reasons.push(`Recommandée pour toi (score: ${Math.round(score.total)}/100)`);
    }
    
    return reasons;
  }
  
  /**
   * 🎲 WILDCARD TECHNIQUE
   */
  getWildcardTechnique(allHabits, criteria) {
    const recent = criteria.recentTechniques;
    const recentCategories = recent.map(id => {
      const h = allHabits.find(habit => habit.id === id);
      return h?.category;
    }).filter(Boolean);
    
    const wildcards = allHabits.filter(h => 
      !recent.includes(h.id) &&
      !recentCategories.includes(h.category) &&
      this.parseDuration(h.duration) <= criteria.timeAvailable
    );
    
    if (wildcards.length === 0) return null;
    
    const wildcard = wildcards[Math.floor(Math.random() * wildcards.length)];
    
    return {
      habit: wildcard,
      score: 70,
      breakdown: { wildcard: 100 },
      reasons: []
    };
  }
  
  /**
   * 📊 RÉCUPÉRER TAUX SUCCÈS USER - CORRIGÉ ✅
   */
  async getUserSuccessRates(userId) {
    try {
      // ✅ UTILISER AsyncStorage directement
      const stored = await AsyncStorage.getItem(`technique_success_rates_${userId}`);
      if (!stored) return {};
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erreur chargement success rates:', error);
      return {};
    }
  }
  
  /**
   * 📝 ANALYSER PRÉFÉRENCES DURÉES
   */
  analyzePreferredDurations(history) {
    if (!history || !Array.isArray(history) || history.length < 5) return [];
    
    const durations = history
      .filter(h => h.completed !== false && h.habit)
      .map(h => Math.round(this.parseDuration(h.habit.duration) / 5) * 5)
      .filter(Boolean);
    
    const counts = {};
    durations.forEach(d => counts[d] = (counts[d] || 0) + 1);
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(e => parseInt(e[0]));
  }
  
  /**
   * 📝 ANALYSER PRÉFÉRENCES CATÉGORIES
   */
  analyzePreferredCategories(history) {
    if (!history || !Array.isArray(history) || history.length < 5) return [];
    
    const categories = history
      .filter(h => h.completed !== false && h.habit?.category)
      .map(h => h.habit.category);
    
    const counts = {};
    categories.forEach(c => counts[c] = (counts[c] || 0) + 1);
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(e => e[0]);
  }
  
  moodToValue(mood) {
    const map = { 'Pas top': 1, 'Neutre': 2, 'Bien': 3, 'Excellent': 4 };
    return map[mood] || 2;
  }
  
  /**
   * 🕐 CHRONOTYPE OPTIMAL
   */
  isChronotypeOptimal(hour, chronotype, habit) {
    const optimalWindows = {
      'extreme-morning': { morning: [6, 10], evening: [20, 22] },
      'morning': { morning: [7, 11], evening: [21, 23] },
      'intermediate': { morning: [8, 12], evening: [21, 23] },
      'afternoon': { morning: [9, 13], evening: [22, 24] },
      'evening': { morning: [10, 14], evening: [22, 1] },
      'extreme-evening': { morning: [11, 15], evening: [23, 2] }
    };
    
    const windows = optimalWindows[chronotype] || optimalWindows['intermediate'];
    
    if (this.isEnergizingTechnique(habit)) {
      return hour >= windows.morning[0] && hour < windows.morning[1];
    }
    
    if (this.isRelaxingTechnique(habit)) {
      return hour >= windows.evening[0] || hour < windows.evening[1] % 24;
    }
    
    return true;
  }
  
  /**
   * ⚡ TECHNIQUES ÉNERGISANTES
   */
  isEnergizingTechnique(habit) {
    const text = (habit.title + ' ' + habit.description + ' ' + (habit.tags || []).join(' ')).toLowerCase();
    return text.includes('énerg') || text.includes('energy') || 
           text.includes('power') || text.includes('boost') ||
           habit.category === 'Énergie';
  }
  
  /**
   * 😌 TECHNIQUES RELAXANTES
   */
  isRelaxingTechnique(habit) {
    const text = (habit.title + ' ' + habit.description + ' ' + (habit.tags || []).join(' ')).toLowerCase();
    return text.includes('relax') || text.includes('calm') || text.includes('sommeil') ||
           text.includes('sleep') || text.includes('wind down') ||
           habit.category === 'Sommeil';
  }
  
  isParasympatheticTechnique(habit) {
    const keywords = ['respiration', 'breath', 'cohérence', 'nsdr', 'relaxation', 'yoga nidra'];
    const text = (habit.title + ' ' + (habit.description || '')).toLowerCase();
    return keywords.some(k => text.includes(k));
  }
  
  extractPermaImpact(habit) {
    const impacts = [];
    const text = (habit.title + ' ' + (habit.description || '') + ' ' + (habit.tags || []).join(' ')).toLowerCase();
    
    if (text.includes('gratitude') || text.includes('positif')) impacts.push('positive_emotions');
    if (text.includes('flow') || text.includes('focus')) impacts.push('engagement');
    if (text.includes('social') || text.includes('connect')) impacts.push('relationships');
    if (text.includes('meaning') || text.includes('purpose')) impacts.push('meaning');
    if (text.includes('goal') || text.includes('accomplishment')) impacts.push('accomplishment');
    
    return impacts;
  }
  
  identifyPermaWeaknesses(perma) {
    if (!perma) return [];
    
    const dimensions = [
      { name: 'positive_emotions', value: perma.positiveEmotions },
      { name: 'engagement', value: perma.engagement },
      { name: 'relationships', value: perma.relationships },
      { name: 'meaning', value: perma.meaning },
      { name: 'accomplishment', value: perma.accomplishment }
    ];
    
    return dimensions
      .filter(d => d.value < 3.5)
      .sort((a, b) => a.value - b.value)
      .slice(0, 2)
      .map(d => d.name);
  }
  
  extractHabitTypes(habit) {
    const types = [];
    if (habit.category) types.push(habit.category.toLowerCase());
    if (habit.tags) types.push(...habit.tags.map(t => t.toLowerCase()));
    
    const text = (habit.title + ' ' + (habit.description || '')).toLowerCase();
    if (text.includes('respir') || text.includes('breath')) types.push('respiration');
    if (text.includes('médit') || text.includes('mindful')) types.push('meditation');
    if (text.includes('gratitude')) types.push('gratitude');
    if (text.includes('journal')) types.push('journaling');
    if (text.includes('mouve') || text.includes('exercice')) types.push('movement');
    
    return [...new Set(types)];
  }
  
  parseDuration(durationStr) {
    if (!durationStr) return 15;
    const match = durationStr.match(/(\d+)(?:-(\d+))?/);
    if (!match) return 15;
    
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    return (min + max) / 2;
  }
  
  getMaxDuration(priority, context) {
    const base = priority === 'critical' ? 5 :
                 priority === 'high' ? 10 : 15;
    
    if (context.timeAvailable < base) return context.timeAvailable;
    return base;
  }
  
  estimateTimeAvailable(context) {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 9) return 5;
    if (hour >= 12 && hour < 14) return 10;
    if (hour >= 14 && hour < 18) return 15;
    if (hour >= 18) return 20;
    return 10;
  }
  
  isWorkingHours() {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  }
  
  mapRecommendationType(type) {
    const mapping = {
      'control_loss_somatic': ['respiration', 'grounding'],
      'acute_stress_detected': ['respiration', 'relaxation'],
      'social_isolation': ['social', 'gratitude'],
      'cognitive_reframe': ['meditation', 'journaling'],
      'achievement_stress': ['journaling', 'visualization'],
      'existential_fatigue': ['meditation', 'values_work'],
      'flow_optimization': ['focus', 'time_management'],
      'maintenance': ['meditation', 'gratitude', 'movement'],
      'morning_recovery': ['movement', 'breathing'],
      'evening_wind_down': ['relaxation', 'meditation']
    };
    return mapping[type] || ['respiration', 'meditation'];
  }
}

export default new SmartTechniqueMatcher();