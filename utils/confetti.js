// utils/confetti.js
// Version simplifiée sans canvas-confetti
import { Alert } from 'react-native';

export const launchConfetti = () => {
  // Cette fonction ne fait rien pour le moment
  // Nous allons implémenter une vraie solution plus tard
  console.log('Confetti animation would play here');
  
  // Alternative simple : une alerte de félicitations
  // Vous pouvez la commenter si vous voulez
  Alert.alert(
    '🎉 Félicitations !',
    'Vous avez complété une habitude !',
    [{ text: 'OK' }],
    { cancelable: false }
  );
};

// Version alternative si vous voulez des vibrations à la place
export const launchCelebration = () => {
  const { Vibration } = require('react-native');
  
  // Vibration pattern: court-long-court
  Vibration.vibrate([100, 200, 100]);
  
  console.log('Celebration vibration played');
};