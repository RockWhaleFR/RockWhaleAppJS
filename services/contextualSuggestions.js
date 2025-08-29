// services/contextualSuggestions.js
import dayjs from 'dayjs';
import allHabits from '../data/habits';
import useUserStore from '../store/useUserStore';

export class ContextualSuggestionEngine {
  static getCurrentContext() {
    const now = dayjs();
    const hour = now.hour();
    const dayOfWeek = now.day();
    const { user } = useUserStore.getState();
    
    return {
      currentTime: hour,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isWorkingHours: this.isInWorkingHours(hour, user.preferences?.workingHours),
      stressLevel: user.preferences?.stressLevel || 'medium',
      environment: user.preferences?.environment || 'office',
      lastSuggestion: user.lastSuggestionTime ? dayjs(user.lastSuggestionTime) : null,
      recentCompletions: this.getRecentCompletions(user.history),
      preferredBreak: user.preferences?.preferredBreak || 'meditation'
    };
  }

  static isInWorkingHours(hour, workingHours) {
    if (!workingHours) return hour >= 9 && hour <= 17;
    
    const { start, end } = workingHours;
    
    // Gestion du travail de nuit (ex: 20h-6h)
    if (start > end) {
      return hour >= start || hour <= end;
    }
    
    return hour >= start && hour <= end;
  }

  static getRecentCompletions(history = []) {
    const today = dayjs().startOf('day');
    return history.filter(entry => 
      dayjs(entry.date).isAfter(today.subtract(3, 'day'))
    );
  }

  // COEUR DU SYSTÈME : Suggestions adaptatives intelligentes
  static getContextualSuggestions(limit = 3) {
    const context = this.getCurrentContext();
    const { user } = useUserStore.getState();
    
    // Éviter les suggestions trop fréquentes
    if (context.lastSuggestion && 
        dayjs().diff(context.lastSuggestion, 'minute') < 30) {
      return [];
    }

    let suggestions = [];

    // 1. SUGGESTIONS BASÉES SUR L'HEURE ET LE CONTEXTE
    if (context.currentTime >= 6 && context.currentTime <= 9) {
      // Matin : Énergie et démarrage
      suggestions = this.getMorningSuggestions(context, user);
      
    } else if (context.currentTime >= 10 && context.currentTime <= 12) {
      // Milieu de matinée : Focus et productivité
      suggestions = this.getMidMorningSuggestions(context, user);
      
    } else if (context.currentTime >= 13 && context.currentTime <= 14) {
      // Pause déjeuner : Récupération
      suggestions = this.getLunchBreakSuggestions(context, user);
      
    } else if (context.currentTime >= 15 && context.currentTime <= 17) {
      // Après-midi : Coup de boost
      suggestions = this.getAfternoonSuggestions(context, user);
      
    } else if (context.currentTime >= 18 && context.currentTime <= 22) {
      // Soirée : Décompression
      suggestions = this.getEveningSuggestions(context, user);
      
    } else {
      // Nuit : Sommeil et relaxation
      suggestions = this.getNightSuggestions(context, user);
    }

    // 2. FILTRAGE PAR PRÉFÉRENCES UTILISATEUR
    suggestions = this.filterByUserPreferences(suggestions, user);

    // 3. ÉVITER LES RÉPÉTITIONS RÉCENTES
    suggestions = this.avoidRecentDuplicates(suggestions, context.recentCompletions);

    // 4. ADAPTATION AU NIVEAU DE STRESS
    suggestions = this.adaptToStressLevel(suggestions, context.stressLevel);

    // 5. CLASSEMENT PAR PERTINENCE
    suggestions = this.rankBySuitability(suggestions, context, user);

    return suggestions.slice(0, limit);
  }

  static getMorningSuggestions(context, user) {
    const morningHabits = allHabits.filter(h => 
      h.tags?.includes('morning') || 
      h.category === 'Énergie' ||
      h.title.includes('eau') ||
      h.title.includes('étirement')
    );

    // Suggestions spéciales pour le réveil difficile
    if (context.currentTime <= 7) {
      return morningHabits.filter(h => 
        h.duration.includes('≤2min') || h.title.includes('eau')
      );
    }

    return morningHabits;
  }

  static getMidMorningSuggestions(context, user) {
    if (!context.isWorkingHours) {
      return allHabits.filter(h => h.category === 'Humeur');
    }

    // Suggestions pour maintenir le focus
    return allHabits.filter(h => 
      h.tags?.includes('focus') ||
      h.tags?.includes('posture') ||
      (h.category === 'Stress' && h.duration.includes('≤2min'))
    );
  }

  static getLunchBreakSuggestions(context, user) {
    // Pause déjeuner : récupération et digestion
    return allHabits.filter(h => 
      h.tags?.includes('digestion') ||
      h.tags?.includes('walk') ||
      h.category === 'Humeur' ||
      (h.category === 'Stress' && !h.title.includes('sommeil'))
    );
  }

  static getAfternoonSuggestions(context, user) {
    // Coup de mou de l'après-midi
    const stressLevel = context.stressLevel;
    
    if (stressLevel === 'high' || stressLevel === 'critical') {
      // Priorité à la décompression
      return allHabits.filter(h => 
        h.category === 'Stress' ||
        h.title.includes('respiration') ||
        h.title.includes('épaules')
      );
    }

    // Boost d'énergie classique
    return allHabits.filter(h => 
      h.category === 'Énergie' ||
      h.tags?.includes('movement') ||
      h.title.includes('squats') ||
      h.title.includes('eau')
    );
  }

  static getEveningSuggestions(context, user) {
    if (context.isWorkingHours) {
      // Encore au travail : micro-pauses
      return allHabits.filter(h => 
        h.duration.includes('≤2min') &&
        (h.category === 'Stress' || h.title.includes('yeux'))
      );
    }

    // Fin de journée : transition et décompression
    return allHabits.filter(h => 
      h.category === 'Stress' ||
      h.tags?.includes('evening') ||
      h.title.includes('gratitude') ||
      h.title.includes('téléphone')
    );
  }

  static getNightSuggestions(context, user) {
    return allHabits.filter(h => 
      h.category === 'Sommeil' ||
      h.tags?.includes('sleep') ||
      h.title.includes('4-7-8') ||
      h.title.includes('réveil')
    );
  }

  static filterByUserPreferences(suggestions, user) {
    const preferences = user.preferences || {};
    const timeAvailable = user.timeAvailable || '≤2min';
    const preferredBreak = preferences.preferredBreak;

    // Filtrage par temps disponible
    let filtered = suggestions.filter(h => {
      if (timeAvailable === '≤2min') {
        return h.duration.includes('≤2min') || h.duration.includes('60 s');
      }
      if (timeAvailable === '5min') {
        return !h.duration.includes('15min');
      }
      return true;
    });

    // Filtrage par type de pause préférée
    if (preferredBreak) {
      const preferred = filtered.filter(h => {
        switch(preferredBreak) {
          case 'meditation': 
            return h.category === 'Stress' || h.tags?.includes('meditation');
          case 'movement': 
            return h.category === 'Énergie' || h.tags?.includes('movement');
          case 'social': 
            return h.tags?.includes('social') || h.title.includes('sourire');
          case 'nature': 
            return h.tags?.includes('nature') || h.title.includes('regard loin');
          default: 
            return true;
        }
      });

      // Si on a des suggestions préférées, on les privilégie, sinon on garde toutes
      if (preferred.length > 0) {
        filtered = [...preferred, ...filtered.filter(h => !preferred.includes(h))];
      }
    }

    return filtered;
  }

  static avoidRecentDuplicates(suggestions, recentCompletions) {
    if (recentCompletions.length === 0) return suggestions;

    const recentTitles = new Set(
      recentCompletions.map(completion => 
        typeof completion.habit === 'object' 
          ? completion.habit.title 
          : completion.habit
      )
    );

    // Garder les habitudes non récentes en priorité
    const notRecent = suggestions.filter(h => !recentTitles.has(h.title));
    const recent = suggestions.filter(h => recentTitles.has(h.title));

    // Mélanger pour éviter la monotonie, mais privilégier les non récentes
    return [...notRecent, ...recent.slice(0, 1)];
  }

  static adaptToStressLevel(suggestions, stressLevel) {
    switch(stressLevel) {
      case 'critical':
      case 'high':
        // Privilégier les activités de décompression
        return suggestions.sort((a, b) => {
          const aIsStress = a.category === 'Stress' || a.title.includes('respiration');
          const bIsStress = b.category === 'Stress' || b.title.includes('respiration');
          return bIsStress - aIsStress;
        });
        
      case 'low':
        // Privilégier l'énergie et la productivité
        return suggestions.sort((a, b) => {
          const aIsEnergy = a.category === 'Énergie' || a.tags?.includes('movement');
          const bIsEnergy = b.category === 'Énergie' || b.tags?.includes('movement');
          return bIsEnergy - aIsEnergy;
        });
        
      case 'medium':
      default:
        // Équilibre naturel
        return suggestions;
    }
  }

  static rankBySuitability(suggestions, context, user) {
    return suggestions.map(suggestion => ({
      ...suggestion,
      suitabilityScore: this.calculateSuitabilityScore(suggestion, context, user)
    }))
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .map(({ suitabilityScore, ...suggestion }) => suggestion);
  }

  static calculateSuitabilityScore(habit, context, user) {
    let score = 5; // Score de base

    // Bonus pour les préférences utilisateur
    if (user.behaviorData?.preferredActivities?.[habit.title] > 0) {
      score += 3;
    }

    // Bonus pour le timing approprié
    const hour = context.currentTime;
    if (hour >= 6 && hour <= 9 && habit.tags?.includes('morning')) score += 2;
    if (hour >= 18 && hour <= 22 && habit.tags?.includes('evening')) score += 2;
    if (hour >= 13 && hour <= 14 && habit.tags?.includes('lunch')) score += 2;

    // Bonus environnement
    if (context.environment === 'office' && habit.tags?.includes('discrete')) score += 1;
    if (context.environment === 'home' && habit.tags?.includes('home')) score += 1;

    // Malus pour les répétitions récentes
    if (context.recentCompletions.some(c => 
      (typeof c.habit === 'object' ? c.habit.title : c.habit) === habit.title
    )) {
      score -= 1;
    }

    // Bonus pour l'adéquation au niveau de stress
    if (context.stressLevel === 'high' && habit.category === 'Stress') score += 2;
    if (context.stressLevel === 'low' && habit.category === 'Énergie') score += 2;

    return Math.max(score, 0);
  }

  // MÉTHODES POUR L'APPRENTISSAGE DE L'IA
  static async recordUserFeedback(habitTitle, accepted, context) {
    const { user, recordSuggestionFeedback } = useUserStore.getState();
    
    await recordSuggestionFeedback(habitTitle, accepted, {
      timeOfDay: context.currentTime,
      stressLevel: context.stressLevel,
      environment: context.environment,
      isWorkingHours: context.isWorkingHours
    });
  }

  // SUGGESTIONS PUSH INTELLIGENTES
  static shouldTriggerProactiveSuggestion() {
    const context = this.getCurrentContext();
    const { user } = useUserStore.getState();
    
    // Pas de suggestions si désactivées
    if (!user.preferences?.notifications?.contextual) return false;
    
    // Éviter le spam
    if (context.lastSuggestion && 
        dayjs().diff(context.lastSuggestion, 'minute') < 45) {
      return false;
    }

    // Déclencheurs intelligents
    const triggers = [
      // Début de journée de travail
      context.currentTime === 9 && context.isWorkingHours,
      // Pause déjeuner
      context.currentTime === 13,
      // Coup de mou de l'après-midi
      context.currentTime === 15 && context.isWorkingHours,
      // Fin de journée
      context.currentTime === 18 && context.isWorkingHours,
      // Stress élevé + habitudes récentes faibles
      context.stressLevel === 'high' && context.recentCompletions.length < 2
    ];

    return triggers.some(Boolean);
  }

  static getProactiveSuggestion() {
    if (!this.shouldTriggerProactiveSuggestion()) return null;
    
    const suggestions = this.getContextualSuggestions(1);
    return suggestions[0] || null;
  }

  // ANALYTICS ET INSIGHTS
  static getUserInsights() {
    const { user } = useUserStore.getState();
    const history = user.history || [];
    
    if (history.length < 5) return null;

    const insights = {
      mostActiveTimeOfDay: this.getMostActiveTime(history),
      bestMoodActivities: this.getBestMoodActivities(history),
      streakBreakingPattern: this.getStreakBreakingPattern(history),
      stressImprovementTrend: this.getStressImprovementTrend(history)
    };

    return insights;
  }

  static getMostActiveTime(history) {
    const hourCounts = {};
    
    history.forEach(entry => {
      const hour = dayjs(entry.date).hour();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostActiveHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];

    return mostActiveHour ? {
      hour: parseInt(mostActiveHour[0]),
      count: mostActiveHour[1],
      label: this.getTimeLabel(parseInt(mostActiveHour[0]))
    } : null;
  }

  static getBestMoodActivities(history) {
    const activityMoods = {};
    
    history.forEach(entry => {
      const title = typeof entry.habit === 'object' ? entry.habit.title : entry.habit;
      if (!activityMoods[title]) {
        activityMoods[title] = { good: 0, neutral: 0, bad: 0, total: 0 };
      }
      
      activityMoods[title].total++;
      if (entry.mood === 'Bien') activityMoods[title].good++;
      else if (entry.mood === 'Neutre') activityMoods[title].neutral++;
      else activityMoods[title].bad++;
    });

    return Object.entries(activityMoods)
      .filter(([_, data]) => data.total >= 3) // Au moins 3 occurrences
      .map(([title, data]) => ({
        title,
        goodRatio: data.good / data.total,
        total: data.total
      }))
      .sort((a, b) => b.goodRatio - a.goodRatio)
      .slice(0, 3);
  }

  static getTimeLabel(hour) {
    if (hour >= 6 && hour < 12) return 'Matinée';
    if (hour >= 12 && hour < 18) return 'Après-midi';
    if (hour >= 18 && hour < 22) return 'Soirée';
    return 'Nuit';
  }
}

// HOOK POUR L'UTILISATION DANS LES COMPOSANTS
export const useContextualSuggestions = () => {
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const refreshSuggestions = React.useCallback(async () => {
    setLoading(true);
    try {
      const newSuggestions = ContextualSuggestionEngine.getContextualSuggestions(3);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error getting contextual suggestions:', error);
    }
    setLoading(false);
  }, []);

  const acceptSuggestion = React.useCallback(async (habit) => {
    const context = ContextualSuggestionEngine.getCurrentContext();
    await ContextualSuggestionEngine.recordUserFeedback(habit.title, true, context);
    refreshSuggestions();
  }, [refreshSuggestions]);

  const rejectSuggestion = React.useCallback(async (habit) => {
    const context = ContextualSuggestionEngine.getCurrentContext();
    await ContextualSuggestionEngine.recordUserFeedback(habit.title, false, context);
    refreshSuggestions();
  }, [refreshSuggestions]);

  return {
    suggestions,
    loading,
    refreshSuggestions,
    acceptSuggestion,
    rejectSuggestion
  };
};

export default ContextualSuggestionEngine;