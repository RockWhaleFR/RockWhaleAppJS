// utils/tts.js
import * as Speech from 'expo-speech';

export const speak = (text) => {
  try {
    Speech.speak(text, { 
      language: 'fr-FR',
      pitch: 1.1,
      rate: 0.85,
      volume: 0.9,
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
        pitch: 1.1,
        rate: 0.8,
        volume: 0.9,
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