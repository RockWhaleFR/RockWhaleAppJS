import theme from "../theme";


// Moteur d'adaptation intelligent
export default class AdaptiveRecommendationEngine {
  constructor(user, habits, allHabits) {
    this.user = user;
    this.habits = habits;
    this.allHabits = allHabits;
    this.currentHour = new Date().getHours();
    this.currentDay = new Date().getDay();
    this.weather = this.getWeatherContext(); // À connecter à une API météo
  }

  // Analyse du contexte temporel
  getTimeContext() {
    const hour = this.currentHour;
    if (hour < 9) return 'morning';
    if (hour < 12) return 'late-morning';  
    if (hour < 14) return 'lunch';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  }

  // Simulation météo (à remplacer par vraie API)
  getWeatherContext() {
    const conditions = ['sunny', 'rainy', 'cloudy', 'cold', 'hot'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  // Calcul du niveau de stress estimé
  getEstimatedStressLevel() {
    const baseStress = this.user.preferences?.stressLevel || 'medium';
    const timeContext = this.getTimeContext();
    const workingHours = this.user.preferences?.workingHours;
    
    // Ajustement selon l'heure et les horaires de travail
    let stressMultiplier = 1;
    if (timeContext === 'morning' && workingHours?.start <= 9) stressMultiplier = 1.2;
    if (timeContext === 'afternoon' && this.currentDay >= 1 && this.currentDay <= 5) stressMultiplier = 1.3;
    if (timeContext === 'evening' && baseStress === 'high') stressMultiplier = 0.8;
    
    return { level: baseStress, intensity: stressMultiplier };
  }

  // Recommandations adaptatives principales
  getAdaptiveRecommendations() {
    const timeContext = this.getTimeContext();
    const stressContext = this.getEstimatedStressLevel();
    const completedToday = this.getCompletedHabitsToday();

    const scoredHabits = this._getScoredHabits(timeContext, stressContext);
    const primary = scoredHabits[0];
    const secondary = scoredHabits.slice(1, 4);

    return {
      primary: primary ? {
        ...primary,
        reason: this.getRecommendationReason(primary, timeContext, stressContext),
        confidence: this.calculateConfidence(primary, timeContext, stressContext)
      } : null,
      secondary,
      contextual: this.getContextualInsights(timeContext, stressContext, completedToday)
    };
  }

  _getScoredHabits(timeContext, stressContext) {
    const preferences = this.user.preferences || {};
    let candidateHabits = [...this.habits];

    // Priorisation par durée disponible
    const timeAvailable = preferences.timeAvailable || '5min';
    candidateHabits = candidateHabits.filter(h => {
      const duration = parseInt(h.duration, 10) || 5;
      if (timeAvailable === '≤2min') return duration <= 2;
      if (timeAvailable === '5min') return duration <= 5;
      return duration <= 15;
    });

    // --- Notation de toutes les habitudes candidates ---
    let scoredHabits = candidateHabits.map(habit => {
      const { score, reasons } = this.calculateAdaptiveScore(habit, timeContext, stressContext);
      return {
        ...habit,
        adaptiveScore: score,
        adaptiveReasons: reasons,
      };
    });

    // --- Ajout d'un boost pour les habitudes à fort impact, surtout pour les nouveaux utilisateurs ---
    // Cela aide à prouver la valeur de l'app dès le début.
    if (this.user.history?.length < 5) {
      scoredHabits.forEach(habit => {
        if (habit.tags?.includes('high-impact')) {
          habit.adaptiveScore += 25; // Bonus pour un "wow effect"
        }
      });
    }

    // Trie les habitudes par score décroissant pour trouver la meilleure
    scoredHabits.sort((a, b) => b.adaptiveScore - a.adaptiveScore);
    return scoredHabits;
  }

  getContextualInsights(timeContext, stressContext, completedToday) {
    const insights = [];
    
    // Analyse de performance
    if (completedToday.length === 0 && this.currentHour > 10 && this.currentHour < 20) {
      insights.push({
        type: 'motivation',
        icon: '🚀',
        title: 'Lancez votre journée',
        message: 'Une petite habitude maintenant peut transformer votre journée',
        color: theme.wellness.energy
      });
    }

    // Analyse de stress
    if (stressContext.intensity > 1.2) {
      insights.push({
        type: 'stress',
        icon: '🧘',
        title: 'Moment de pause détecté',
        message: 'Votre rythme semble intense. Une pause vous ferait du bien.',
        color: theme.wellness.calm
      });
    }

    // Analyse météo
    if (this.weather === 'rainy') {
      insights.push({
        type: 'weather',
        icon: '🌧️',
        title: 'Journée cocooning',
        message: 'Parfait pour des activités relaxantes à l\'intérieur',
        color: theme.wellness.rest
      });
    }

    // Analyse de streak
    if (this.user.streak > 0 && this.user.streak % 7 === 0) {
      insights.push({
        type: 'achievement',
        icon: '🏆',
        title: `${this.user.streak} jours consécutifs !`,
        message: 'Vous construisez de solides habitudes. Continuez !',
        color: theme.wellness.balance
      });
    }

    return insights.slice(0, 2); // Maximum 2 insights pour éviter la surcharge
  }

  calculateAdaptiveScore(habit, timeContext, stressContext) {
    let score = 50;
    const reasons = [];

    // Bonus temporel
    if (timeContext === 'morning' && habit.category === 'Énergie') {
      score += 30;
      reasons.push({ text: 'Boost matinal', points: 30 });
    }
    if (timeContext === 'afternoon' && (habit.category === 'Humeur' || habit.category === 'Stress')) {
      score += 25;
      reasons.push({ text: 'Pause après-midi', points: 25 });
    }
    if (timeContext === 'evening' && habit.category === 'Sommeil') {
      score += 35;
      reasons.push({ text: 'Préparation au sommeil', points: 35 });
    }

    // Bonus stress
    if (stressContext.intensity > 1.2 && habit.category === 'Stress') {
      score += 40;
      reasons.push({ text: 'Anti-stress', points: 40 });
    }

    // Bonus préférences utilisateur
    const preferences = this.user.preferences || {};
    if (preferences.preferredBreak === 'meditation' && habit.tags?.includes('meditation')) {
      score += 20;
      reasons.push({ text: 'Votre type de pause', points: 20 });
    }
    if (preferences.preferredBreak === 'movement' && habit.tags?.includes('movement')) {
      score += 20;
      reasons.push({ text: 'Votre type de pause', points: 20 });
    }

    return { score, reasons };
  }

  calculateConfidence(habit, timeContext, stressContext) {
    // Calcul de confiance basé sur les données utilisateur
    let confidence = 60;
    
    if (habit.category === this.user.objectives?.[0]) confidence += 25;
    if (this.isOptimalTime(habit, timeContext)) confidence += 15;
    
    return Math.min(confidence, 95);
  }

  getRecommendationReason(habit, timeContext, stressContext) {
    if (habit.category === 'Stress' && stressContext.intensity > 1.2) {
      return 'Parfait pour une pause régénérante';
    }
    if (habit.category === 'Énergie' && timeContext === 'morning') {
      return 'Idéal pour démarrer votre journée avec énergie';
    }

    const reasons = {
      'afternoon': 'Boost pour votre après-midi',
      'evening': 'Excellent pour terminer la journée en douceur',
      'night': 'Préparez-vous pour une nuit réparatrice'
    };
    return reasons[timeContext] || 'Adapté à votre profil et objectifs';
  }

  isOptimalTime(habit, timeContext) {
    // Logique pour déterminer si c'est le moment optimal pour cette habitude
    const optimalTimes = {
      'Énergie': ['morning', 'late-morning'],
      'Focus': ['morning', 'afternoon'], 
      'Stress': ['afternoon', 'evening'],
      'Sommeil': ['evening', 'night']
    };
    
    return optimalTimes[habit.category]?.includes(timeContext) || false;
  }

  getCompletedHabitsToday() {
    // À implémenter : retourner les habitudes complétées aujourd'hui
    return []; // Placeholder
  }
}