// screens/ActivityScreen.js - VERSION FINALE CORRIGÉE
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import * as Haptics from 'expo-haptics';
import useUserStore from '../store/useUserStore';
import successTrackingService from '../services/successTrackingService';
import theme from '../theme';

// Base de données scientifique
const SCIENTIFIC_FACTS = {
  'box-breathing': {
    mechanism: "Active le système nerveux parasympathique via la stimulation vagale",
    study: "Gerritsen & Band (2018)",
    journal: "Frontiers in Psychology",
    impact: "Réduction de 23% du cortisol salivaire après 5 minutes",
    doi: "10.3389/fpsyg.2018.02288"
  },
  'coherence-cardiaque-365': {
    mechanism: "Synchronise rythme cardiaque et respiration, optimise la variabilité cardiaque (HRV)",
    study: "Lehrer et al. (2020)",
    journal: "Applied Psychophysiology and Biofeedback",
    impact: "Amélioration de 24% de la HRV après 10 jours de pratique",
    doi: "10.1007/s10484-020-09458-z"
  },
  'wim-hof-breathing': {
    mechanism: "Hyperventilation suivie d'apnée, influence le système nerveux autonome et la réponse immunitaire",
    study: "Kox et al. (2014)",
    journal: "PNAS",
    impact: "Modulation volontaire de la réponse inflammatoire",
    doi: "10.1073/pnas.1322174111"
  },
  '4-7-8-breathing': {
    mechanism: "Ratio inspiration/rétention/expiration qui ralentit le rythme cardiaque",
    study: "Magnon et al. (2021)",
    journal: "Scientific Reports",
    impact: "Baisse moyenne de 10 bpm du rythme cardiaque",
    doi: "10.1038/s41598-021-98736-9"
  }
};

export default function ActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { habit, onComplete } = route.params;
  const { user } = useUserStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('Prêt à commencer');
  const [key, setKey] = useState(0);
  const [showScience, setShowScience] = useState(false);
  
  // 🔥 États pour tracking
  const [sessionStartTime] = useState(new Date());
  const [moodBefore] = useState('Neutre'); // TODO: Demander avant session

  const animValue = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const totalTime = habit.timer.inhale + habit.timer.hold + habit.timer.exhale + (habit.timer.holdEmpty || 0);
  
  const scienceData = SCIENTIFIC_FACTS[habit.id] || SCIENTIFIC_FACTS['box-breathing'];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: totalTime * 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: totalTime * 500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleUpdate = (remainingTime) => {
    let phase = '';
    let scaleTo = 1;

    if (remainingTime > habit.timer.hold + habit.timer.exhale) {
      phase = 'Inspirez profondément';
      scaleTo = 1.3;
    } else if (remainingTime > habit.timer.exhale) {
      phase = 'Retenez votre souffle';
      scaleTo = 1.3;
    } else {
      phase = 'Expirez lentement';
      scaleTo = 0.7;
    }

    if (phase !== currentPhase) {
      setCurrentPhase(phase);
      if (user.preferences?.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      Animated.spring(animValue, {
        toValue: scaleTo,
        tension: 20,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  };

  // ✅ HANDLE COMPLETE CORRIGÉ
  const handleComplete = async () => {
    const newCyclesCompleted = cyclesCompleted + 1;
    
    if (newCyclesCompleted >= habit.timer.cycles) {
      // Session terminée
      setIsPlaying(false);
      setCyclesCompleted(habit.timer.cycles);
      setCurrentPhase('Session terminée !');
      
      if (user.preferences?.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // ✅ TRACKING SUCCESS
      try {
        const sessionDuration = Math.round((new Date() - sessionStartTime) / 60000);
        const moodAfter = 'Bien'; // TODO: Modal de feedback mood après
        
        console.log('📊 Enregistrement succès:', {
          userId: user.id,
          techniqueId: habit.id,
          duration: sessionDuration
        });
        
        await successTrackingService.trackCompletion(
          user.id, 
          habit.id, 
          {
            moodBefore: moodBefore,
            moodAfter: moodAfter,
            completed: true,
            duration: sessionDuration
          }
        );
        
        console.log('✅ Succès enregistré');
      } catch (error) {
        console.error('⚠️ Erreur tracking:', error);
      }
      
      // Navigation après délai
      setTimeout(() => {
        if (onComplete) onComplete();
        navigation.goBack();
      }, 2000);
      
      return { shouldRepeat: false };
    }
    
    // Cycle suivant
    setCyclesCompleted(newCyclesCompleted);
    return { shouldRepeat: true, delay: 2 };
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    setIsPlaying(!isPaused);
  };

  const handleRestart = () => {
    setKey(prevKey => prevKey + 1);
    setCyclesCompleted(0);
    setIsPlaying(true);
    setIsPaused(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowScience(!showScience)} style={styles.scienceButton}>
          <Ionicons name="information-circle-outline" size={28} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Titre */}
          <Text style={styles.habitTitle}>{habit.title}</Text>
          <Text style={styles.habitSubtitle}>
            Technique de respiration thérapeutique
          </Text>

          {/* Panneau scientifique */}
          {showScience && (
            <Animated.View style={styles.sciencePanel}>
              <View style={styles.scienceHeader}>
                <Ionicons name="flask-outline" size={20} color={theme.colors.accent} />
                <Text style={styles.sciencePanelTitle}>Base scientifique</Text>
              </View>
              
              <Text style={styles.mechanismText}>
                <Text style={styles.mechanismLabel}>Mécanisme : </Text>
                {scienceData.mechanism}
              </Text>
              
              <View style={styles.studyCard}>
                <Text style={styles.studyTitle}>Étude de référence</Text>
                <Text style={styles.studyAuthors}>{scienceData.study}</Text>
                <Text style={styles.studyJournal}>{scienceData.journal}</Text>
                <Text style={styles.studyImpact}>
                  📊 {scienceData.impact}
                </Text>
                <TouchableOpacity 
                  style={styles.doiButton}
                  onPress={() => console.log('DOI:', scienceData.doi)}
                >
                  <Text style={styles.doiText}>DOI: {scienceData.doi}</Text>
                  <Ionicons name="open-outline" size={14} color={theme.colors.accent} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Timer visuel */}
          <View style={styles.timerContainer}>
            <Animated.View 
              style={[
                styles.breathingCircle, 
                { 
                  transform: [{ scale: Animated.multiply(animValue, pulseAnim) }],
                  opacity: isPlaying ? 0.3 : 0.1
                }
              ]} 
            />
            
            <CountdownCircleTimer
              key={key}
              isPlaying={isPlaying && !isPaused}
              duration={totalTime}
              colors={[theme.colors.primary]}
              trailColor={theme.colors.chipBg}
              size={280}
              strokeWidth={12}
              onUpdate={handleUpdate}
              onComplete={handleComplete}
            >
              {({ remainingTime }) => (
                <View style={styles.timerTextContainer}>
                  <Text style={styles.phaseText}>{currentPhase}</Text>
                  {isPlaying && (
                    <Text style={styles.timeText}>{remainingTime}s</Text>
                  )}
                </View>
              )}
            </CountdownCircleTimer>
          </View>

          {/* Progression */}
          <View style={styles.progressContainer}>
            <Text style={styles.cycleText}>
              Cycle {cyclesCompleted} / {habit.timer.cycles}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(cyclesCompleted / habit.timer.cycles) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Pattern de respiration */}
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>Pattern de respiration</Text>
            <View style={styles.patternRow}>
              <View style={styles.patternItem}>
                <Ionicons name="arrow-down" size={20} color={theme.wellness.energy} />
                <Text style={styles.patternValue}>{habit.timer.inhale}s</Text>
                <Text style={styles.patternLabel}>Inspiration</Text>
              </View>
              <View style={styles.patternItem}>
                <Ionicons name="pause" size={20} color={theme.wellness.focus} />
                <Text style={styles.patternValue}>{habit.timer.hold}s</Text>
                <Text style={styles.patternLabel}>Rétention</Text>
              </View>
              <View style={styles.patternItem}>
                <Ionicons name="arrow-up" size={20} color={theme.wellness.calm} />
                <Text style={styles.patternValue}>{habit.timer.exhale}s</Text>
                <Text style={styles.patternLabel}>Expiration</Text>
              </View>
            </View>
          </View>

          {/* Boutons de contrôle */}
          {!isPlaying && currentPhase !== 'Session terminée !' && (
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={() => setIsPlaying(true)}
            >
              <Ionicons name="play" size={24} color={theme.colors.primaryInk} />
              <Text style={styles.startButtonText}>Démarrer la session</Text>
            </TouchableOpacity>
          )}

          {isPlaying && (
            <View style={styles.controlsRow}>
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={handlePause}
              >
                <Ionicons 
                  name={isPaused ? "play" : "pause"} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.controlButtonText}>
                  {isPaused ? 'Reprendre' : 'Pause'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, styles.restartButton]} 
                onPress={handleRestart}
              >
                <Ionicons name="refresh" size={24} color={theme.colors.sub} />
                <Text style={styles.controlButtonText}>Recommencer</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ... styles identiques
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(2),
  },
  closeButton: {
    padding: theme.spacing(1),
  },
  scienceButton: {
    padding: theme.spacing(1),
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  habitTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
    marginBottom: theme.spacing(1),
  },
  habitSubtitle: {
    fontSize: 16,
    color: theme.colors.sub,
    textAlign: 'center',
    marginBottom: theme.spacing(3),
  },
  sciencePanel: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    width: '100%',
    ...theme.psychology.shadows.soft,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  sciencePanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginLeft: theme.spacing(1),
  },
  mechanismText: {
    fontSize: 14,
    color: theme.colors.sub,
    lineHeight: 22,
    marginBottom: theme.spacing(2),
  },
  mechanismLabel: {
    fontWeight: '600',
    color: theme.colors.ink,
  },
  studyCard: {
    backgroundColor: theme.colors.chipBg,
    borderRadius: theme.radius.m,
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  studyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accent,
    marginBottom: theme.spacing(0.5),
  },
  studyAuthors: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: theme.spacing(0.5),
  },
  studyJournal: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.sub,
    marginBottom: theme.spacing(1),
  },
  studyImpact: {
    fontSize: 13,
    color: theme.colors.ink,
    lineHeight: 20,
    marginBottom: theme.spacing(1),
  },
  doiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  doiText: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '600',
    marginRight: theme.spacing(0.5),
  },
  timerContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 280,
    height: 280,
    marginVertical: theme.spacing(4),
  },
  breathingCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
  },
  timerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: theme.colors.ink,
    marginTop: theme.spacing(1),
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  cycleText: {
    fontSize: 18,
    color: theme.colors.sub,
    fontWeight: '600',
    marginBottom: theme.spacing(1),
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: theme.colors.chipBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  patternCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(3),
    width: '100%',
    marginBottom: theme.spacing(3),
    ...theme.psychology.shadows.soft,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  patternItem: {
    alignItems: 'center',
  },
  patternValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.ink,
    marginVertical: theme.spacing(0.5),
  },
  patternLabel: {
    fontSize: 12,
    color: theme.colors.sub,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(6),
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.psychology.shadows.warm,
  },
  startButtonText: {
    color: theme.colors.primaryInk,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: theme.spacing(1),
  },
  controlsRow: {
    flexDirection: 'row',
    gap: theme.spacing(2),
    width: '100%',
    justifyContent: 'center',
  },
  controlButton: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.radius.l,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  restartButton: {
    borderColor: theme.colors.chipBorder,
  },
  controlButtonText: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing(1),
  },
});