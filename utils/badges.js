// utils/badges.js
export const getBadgeForStreak = (streak) => {
  if (streak >= 30) {
    return { name: "Maître", icon: "🏆", color: "#FFD700", description: "30 jours de consistency !" };
  } else if (streak >= 21) {
    return { name: "Expert", icon: "🚀", color: "#C0C0C0", description: "21 jours - l'habitude est formée !" };
  } else if (streak >= 7) {
    return { name: "Engagé", icon: "🔥", color: "#CD7F32", description: "7 jours d'affilée !" };
  } else if (streak >= 3) {
    return { name: "Débutant", icon: "🌱", color: "#8A9A5B", description: "3 jours de suite !" };
  }
  return null;
};

export const getAchievementBadges = (userData) => {
  const achievements = [];
  const { history = [], streak } = userData;

  // Badge de consistency
  if (streak >= 3) achievements.push({
    id: 'consistency_3',
    name: "Consistency",
    icon: "📅",
    description: `3 jours consécutifs d'habitudes`,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  });

  // Badge de variété (au moins 5 habitudes différentes)
  const uniqueHabits = new Set(history.map(item => 
    typeof item.habit === "object" ? item.habit.id : item.habit
  ));
  if (uniqueHabits.size >= 5) achievements.push({
    id: 'variety_5',
    name: "Explorateur",
    icon: "🌍",
    description: "5 habitudes différentes essayées",
    unlocked: true
  });

  // Badge de régularité (7 jours avec au moins une habitude)
  if (history.length >= 7) achievements.push({
    id: 'regular_7',
    name: "Régulier",
    icon: "⏰",
    description: "7 jours avec au moins une habitude",
    unlocked: true
  });

  return achievements;
};