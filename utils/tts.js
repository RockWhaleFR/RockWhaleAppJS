// utils/tts.js
import * as Speech from 'expo-speech';

/**
 * Fait parler le texte avec la voix native de l'appareil.
 * @param {string} text - Le texte à prononcer.
 */
export const speak = (text) => {
  try {
    Speech.speak(text, {
      language: 'fr-FR',
      pitch: 1.0, // Voix plus naturelle
      rate: 0.95, // Rythme légèrement plus rapide et moins robotique
      volume: 1.0,
    });
  } catch (e) {
    console.warn('TTS error', e);
  }
};

export const speakGentle = async (text) => {
  try {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    for (let i = 0; i < sentences.length; i++) {
      Speech.speak(sentences[i].trim() + '.', {
        language: 'fr-FR',
        pitch: 1.0,
        rate: 0.9, // Un peu plus lent pour la lecture posée
        volume: 1.0,
      });

      if (i < sentences.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
  } catch (e) {
    console.warn('TTS error', e);
    speak(text);
  }
};