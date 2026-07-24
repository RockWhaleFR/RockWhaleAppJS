// utils/badges.js - VERSION SANS IMAGES (emojis uniquement)

export const STREAK_MILESTONES = [
  { days: 1, name: "Premiers Pas", emoji: "⭐", color: "#90A4AE" },
  { days: 3, name: "Débutant", emoji: "🌱", color: "#81C784" },
  { days: 7, name: "Engagé", emoji: "🔥", color: "#FFB74D" },
  { days: 14, name: "Persévérant", emoji: "💪", color: "#64B5F6" },
  { days: 30, name: "Maître", emoji: "🏆", color: "#FFD54F" },
  { days: 60, name: "Légende", emoji: "👑", color: "#BA68C8" },
];

export const getNextStreakMilestone = (currentStreak = 0) => {
  // Trouve le prochain jalon à atteindre, ou retourne le dernier si tous sont atteints.
  return STREAK_MILESTONES.find(m => m.days > currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
};

export const getBadgeForStreak = (streak) => {
  if (streak >= 60) {
    return { name: "Légende", icon: "👑", color: "#BA68C8", description: "60 jours de consistency !" };
  } else if (streak >= 30) {
    return { name: "Maître", icon: "🏆", color: "#FFD54F", description: "30 jours - l'habitude est formée !" };
  } else if (streak >= 21) {
    return { name: "Expert", icon: "🎯", color: "#64B5F6", description: "21 jours - l'habitude est formée !" };
  } else if (streak >= 14) {
    return { name: "Persévérant", icon: "💪", color: "#64B5F6", description: "14 jours d'affilée !" };
  } else if (streak >= 7) {
    return { name: "Engagé", icon: "🔥", color: "#FFB74D", description: "7 jours de suite !" };
  } else if (streak >= 3) {
    return { name: "Débutant", icon: "🌱", color: "#81C784", description: "3 jours de suite !" };
  } else if (streak >= 1) {
    return { name: "Premiers Pas", icon: "⭐", color: "#90A4AE", description: "Premier jour !" };
  }
  return null;
};

export const getAchievementBadges = (userData, allHabits = []) => {
  const achievements = [];
  const { history = [], streak } = userData;

  // Badges de série avec emojis (pas d'images)
  STREAK_MILESTONES.forEach(milestone => {
    if (streak >= milestone.days) {
      achievements.push({
        id: `streak_${milestone.days}`,
        name: milestone.name,
        emoji: milestone.emoji,
        color: milestone.color,
        description: `${milestone.days} jour${milestone.days > 1 ? 's' : ''} de série !`
      });
    }
  });

  // Badge de variété (au moins 5 habitudes différentes)
  const uniqueHabits = new Set(history.map(item => 
    typeof item.habit === "object" ? item.habit.id : item.habit
  ));
  if (uniqueHabits.size >= 5) achievements.push({
    id: 'variety_5', name: "Explorateur", icon: "🌍", color: "#4DD0E1",
    description: "5 habitudes différentes testées",
  });

  // Badge de complétion de catégorie
  const completedCategories = new Set(history.map(item => {
    const habitObject = typeof item.habit === "object" ? item.habit : allHabits.find(h => h.id === item.habit);
    return habitObject?.category;
  }).filter(Boolean));

  if (completedCategories.size >= 4) achievements.push({
    id: 'polymath', name: "Polymathe", icon: "🧠", color: "#BA68C8",
    description: "Testé toutes les catégories",
  });

  // Badge "Lève-tôt" ou "Noctambule"
  const morningHabits = history.filter(h => new Date(h.date).getHours() < 12).length;
  const eveningHabits = history.filter(h => new Date(h.date).getHours() >= 18).length;

  if (morningHabits >= 10) achievements.push({
    id: 'early_bird', name: "Lève-tôt", icon: "☀️", color: "#FFF176",
    description: "10 habitudes avant midi",
  });
  if (eveningHabits >= 10) achievements.push({
    id: 'night_owl', name: "Noctambule", icon: "🌙", color: "#7986CB",
    description: "10 habitudes en soirée",
  });

  return achievements;
};