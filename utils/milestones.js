// utils/milestones.js
export const milestoneText = (streak) => {
  if ([3, 7, 21].includes(streak)) {
    return `🎯 Série de ${streak} jours ! Continuité = progrès durable.`;
  }
  return null;
};
