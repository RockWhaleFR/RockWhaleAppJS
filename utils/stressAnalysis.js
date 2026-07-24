// utils/stressAnalysis.js - VERSION SIMPLIFIÉE COMPATIBLE
import habitsSeed from '../data/habits';

// FONCTION PRINCIPALE : Génération de techniques personnalisées
export const getPersonalizedTechniques = async (stressScore, contextData = {}) => {
  // Simulation d'analyse IA
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { permaProfile, chronotype, sleepDebt, environment = 'work' } = contextData;
  
  // Combiner toutes les techniques disponibles
  let allTechniques = [
    ...habitsSeed,
    
  ];
  
  // Dédupliquer par ID
  const uniqueTechniquesMap = new Map();
  allTechniques.forEach(tech => {
    if (tech && tech.id && !uniqueTechniquesMap.has(tech.id)) {
      uniqueTechniquesMap.set(tech.id, tech);
    }
  });
  
  let selectedTechniques = Array.from(uniqueTechniquesMap.values());
  
  // Filtrage par niveau de stress
  if (stressScore >= 12) {
    // Stress critique : techniques intensives
    selectedTechniques = selectedTechniques.filter(t => 
      t.tags?.includes('high-impact') || t.category === 'Stress'
    );
  } else if (stressScore >= 8) {
    // Stress élevé : mix
    selectedTechniques = selectedTechniques.filter(t => 
      t.category === 'Stress' || t.category === 'Énergie'
    );
  }
  
  // Adaptation selon chronotype
  if (chronotype === 'extreme-morning' || chronotype === 'morning') {
    selectedTechniques = selectedTechniques.sort((a, b) => {
      const aMorning = a.tags?.includes('morning') ? -1 : 0;
      const bMorning = b.tags?.includes('morning') ? -1 : 0;
      return aMorning - bMorning;
    });
  }
  
  // Si dette de sommeil élevée, prioriser techniques sommeil
  if (sleepDebt >= 2) {
    const sleepTechniques = selectedTechniques.filter(t => 
      t.category === 'Sommeil' || t.title?.includes('sieste')
    );
    selectedTechniques = [...sleepTechniques, ...selectedTechniques.filter(t => 
      !sleepTechniques.includes(t)
    )];
  }
  
  // Diviser gratuit/premium
  const freeTechniquesFiltered = selectedTechniques.filter(t => !t.isPremium).slice(0, 8);
  const premiumTechniquesFiltered = selectedTechniques.filter(t => t.isPremium).slice(0, 5);
  
  // Technique recommandée en premier
  const recommendedFirst = freeTechniquesFiltered[0] || selectedTechniques[0] || habitsSeed[0];
  
  return {
    freeTechniques: freeTechniquesFiltered,
    premiumTechniques: premiumTechniquesFiltered,
    recommendedFirst,
    efficacyRate: Math.round(85 + Math.random() * 10),
    reasoning: `Sélection basée sur stress ${stressScore}/16, chronotype ${chronotype || 'inconnu'}`
  };
};

export const calculateStressLevel = (score) => {
  if (score <= 4) return 'low';
  if (score <= 8) return 'moderate';
  if (score <= 12) return 'high';
  return 'critical';
};

// CLASSE D'ANALYSE (pour insights premium)
export class StressAnalyzer {
  constructor(userProfile, historyData) {
    this.userProfile = userProfile;
    this.history = historyData || [];
  }

  generateCompleteAnalysis() {
    const basicInsights = this.getBasicInsights();
    
    return {
      summary: this.generateSummary(),
      insights: basicInsights,
      recommendations: this.getSmartRecommendations(),
    };
  }

  getBasicInsights() {
    const insights = [];
    
    if (this.history.length >= 7) {
      const weeklyMoodAvg = this.calculateWeeklyMoodAverage();
      insights.push({
        type: 'mood_trend',
        title: 'Tendance d\'humeur hebdomadaire',
        description: `Votre humeur moyenne cette semaine: ${weeklyMoodAvg.label}`,
        value: weeklyMoodAvg.score,
        trend: weeklyMoodAvg.trend,
        isPremium: false
      });
    }

    return insights;
  }

  calculateWeeklyMoodAverage() {
    const lastWeek = this.history.slice(-7);
    const moodValues = {
      'Excellent': 4,
      'Bien': 3,
      'Neutre': 2,
      'Pas top': 1
    };

    const average = lastWeek.reduce((sum, entry) => 
      sum + (moodValues[entry.mood] || 2), 0) / lastWeek.length;

    return {
      score: Math.round(average * 10) / 10,
      label: Object.keys(moodValues)[Math.round(average) - 1] || 'Neutre',
      trend: 'stable'
    };
  }

  getSmartRecommendations() {
    return [
      {
        type: 'timing_optimization',
        title: 'Optimisez vos horaires',
        description: 'Pratiquez aux moments où vous êtes le plus réceptif',
        impact: 'medium',
        effort: 'low'
      }
    ];
  }

  generateSummary() {
    const daysActive = new Set(this.history.map(entry => 
      new Date(entry.date).toDateString())).size;

    return {
      daysActive,
      totalSessions: this.history.length,
      predominantMood: 'Neutre',
      currentStreak: 0,
    };
  }
}

export const generatePersonalizedInsights = (userProfile, historyData, isPremium = false) => {
  const analyzer = new StressAnalyzer(userProfile, historyData);
  return analyzer.generateCompleteAnalysis();
};