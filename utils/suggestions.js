// utils/suggestions.js
import allHabits from '../data/habits';

export const getDailySuggestion = (user, currentTime = new Date()) => {
  const hour = currentTime.getHours();
  const { objectives = [], history = [] } = user;
  
  // Déterminer le contexte de la journée
  let timeContext = '';
  if (hour >= 5 && hour < 12) timeContext = 'morning';
  else if (hour >= 12 && hour < 18) timeContext = 'afternoon';
  else timeContext = 'evening';

  // Filtrer les habitudes par objectifs utilisateur
  let filteredHabits = allHabits;
  if (objectives.length > 0) {
    const objectiveMapping = {
      'énergie': ['Énergie'],
      'mental': ['Humeur', 'Stress'],
      'productivité': ['Énergie', 'Humeur'],
      'sommeil': ['Sommeil']
    };
    
    const wantedCategories = new Set(
      objectives.flatMap(o => objectiveMapping[o] || [])
    );
    
    filteredHabits = allHabits.filter(h => wantedCategories.has(h.category));
  }

  // Suggestions basées sur l'heure
  const timeBasedSuggestions = {
    morning: filteredHabits.filter(h => 
      h.category === 'Énergie' || h.category === 'Productivité'
    ),
    afternoon: filteredHabits.filter(h => 
      h.category === 'Humeur' || h.category === 'Énergie'
    ),
    evening: filteredHabits.filter(h => 
      h.category === 'Stress' || h.category === 'Sommeil'
    )
  };

  // Éviter les suggestions récentes
  const recentHabitIds = history
    .slice(-5)
    .map(item => typeof item.habit === "object" ? item.habit.id : item.habit);
  
  const availableSuggestions = timeBasedSuggestions[timeContext].filter(
    h => !recentHabitIds.includes(h.id)
  );

  // Si aucune suggestion, élargir les critères
  if (availableSuggestions.length === 0) {
    return timeBasedSuggestions[timeContext][0] || filteredHabits[0];
  }

  // Choisir une suggestion aléatoire
  return availableSuggestions[
    Math.floor(Math.random() * availableSuggestions.length)
  ];
};

export const getMoodBasedSuggestion = (mood) => {
  const moodMapping = {
    '😞': ['Stress', 'Humeur'],
    '😐': ['Énergie', 'Humeur'],
    '😊': ['Énergie', 'Productivité']
  };
  
  const categories = moodMapping[mood] || ['Énergie', 'Humeur'];
  const suggestions = allHabits.filter(h => categories.includes(h.category));
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};