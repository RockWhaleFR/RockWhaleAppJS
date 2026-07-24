// utils/messages.js

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Génère un message de félicitations personnalisé et naturel.
 * @param {string} [userName] - Le prénom de l'utilisateur.
 * @returns {string} - Un message de félicitations.
 */
export function buildPraise(userName) {
  const namePart = userName ? ` ${userName}` : '';
  const praises = [
    `Bravo${namePart} ! C'est un pas de plus vers votre objectif.`,
    `Excellent travail${namePart} ! Chaque habitude compte.`,
    `Super${namePart} ! Vous avez pris un moment pour vous, c'est l'essentiel.`,
    `Bien joué ! La régularité est la clé du succès.`,
    `Génial${namePart} ! Votre cerveau vous remercie pour ce signal positif.`,
    `Formidable${namePart} ! Une habitude de plus pour une journée réussie.`
  ];
  const challenges = [
    `L'important est de continuer${namePart ? `, ${userName},` : ''} même les jours difficiles. Bravo.`,
    `Chaque petit pas compte. Vous êtes sur la bonne voie.`,
    `La régularité est plus importante que la perfection. Continuez comme ça !`,
    `C'est dans la constance qu'on trouve la force. Bien joué.`
  ];

  // On mélange les deux types de messages pour plus de variété
  const allMessages = [...praises, ...challenges];
  return pick(allMessages);
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