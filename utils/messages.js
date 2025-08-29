// utils/messages.js
export const praiseSegments = {
  start: ["Super", "Bravo", "Top", "Bien joué", "Excellent", "Génial", "Formidable"],
  middle: ["tu viens de", "tu as réussi à", "félicitations pour avoir"],
  end: [
    "faire un pas qui compte.",
    "envoyer un signal positif à ton cerveau.",
    "renforcer ton nouveau réflexe.",
    "prendre soin de toi aujourd'hui.",
    "avancer vers ta meilleure version.",
    "consolider une habitude bénéfique."
  ],
  challenges: [
    "Chaque petit pas compte, même les jours difficiles.",
    "La régularité est la clé, continue comme ça !",
    "Rome ne s'est pas construite en un jour, mais tu es sur la bonne voie.",
    "Les meilleures choses prennent du temps, mais tu progresses !"
  ]
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function buildGenericPraise(habitTitle) {
  return `${pick(praiseSegments.start)} ! ${pick(praiseSegments.middle)} ${habitTitle.toLowerCase()} et ${pick(praiseSegments.end)}`;
}

export function buildPraise(habitTitle, mood) {
  const base = buildGenericPraise(habitTitle);
  
  if (mood === "Pas top") {
    return `${base} ${pick(praiseSegments.challenges)}`;
  }
  
  if (mood === "Neutre") {
    return `${base} La régularité est plus importante que l'intensité.`;
  }
  
  return base;
}

export function getStreakMessage(streak) {
  if (streak === 0) return "Commence ta série dès aujourd'hui !";
  if (streak === 1) return "Premier jour de série ! Continue demain.";
  if (streak === 3) return "3 jours d'affilée ! Tu es sur la bonne voie.";
  if (streak === 7) return "Une semaine complète ! Ton engagement paie.";
  if (streak === 21) return "21 jours ! Une habitude est en train de se former.";
  if (streak === 30) return "30 jours ! Tu as officialisé cette habitude.";
  if (streak % 10 === 0) return `${streak} jours de suite ! Exceptionnel.`;
  
  return `Série de ${streak} jours. Continue comme ça !`;
}

export function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  
  if (hour < 12) return "Bonjour ! Belle journée à toi 🌞";
  if (hour < 18) return "Bon après-midi ! 💪";
  return "Bonsoir ! Prends soin de toi 🌙";
}