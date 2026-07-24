// components/EnhancedTechniqueModal.js
// Modal avec timer avancé + guidance audio + feedback temps réel

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import theme from '../theme/enhancedTheme';

export default function EnhancedTechniqueModal({ 
  technique, 
  visible, 
  onClose, 
  onComplete 
}) {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [audioGuidanceEnabled, setAudioGuidanceEnabled] = useState(true);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    // Animation de respiration visuelle
    if (isTimerActive && currentPhase) {
      animateBreathing(currentPhase);
    }
  }, [currentPhase, isTimerActive]);

  const animateBreathing = (phase) => {
    const targetScale = phase === 'inhale' || phase === 'inhale2' ? 1.15 : 0.85;
    
    Animated.spring(scaleAnim, {
      toValue: targetScale,
      tension: 20,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const startTimer = () => {
    setIsTimerActive(true);
    setCurrentCycle(0);
    setCurrentPhase(technique.timer?.pattern === 'physiological-sigh' ? 'inhale1' : 'inhale');
    
    if (audioGuidanceEnabled) {
      speakGuidance('Commençons. Suivez les instructions.');
    }
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setCurrentPhase(null);
    setTimerKey(prev => prev + 1);
    Speech.stop();
  };

  const handleTimerComplete = () => {
    const totalCycles = technique.timer?.cycles || 1;
    
    if (currentCycle + 1 >= totalCycles) {
      // Terminé
      setIsTimerActive(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (audioGuidanceEnabled) {
        speakGuidance('Excellent travail. Technique terminée.');
      }
      
      return { shouldRepeat: false };
    } else {
      // Cycle suivant
      setCurrentCycle(prev => prev + 1);
      return { shouldRepeat: true, delay: 1.5 };
    }
  };

  const speakGuidance = (text) => {
    if (!audioGuidanceEnabled) return;
    
    Speech.speak(text, {
      language: 'fr-FR',
      pitch: 1.0,
      rate: 0.9
    });
  };

  const renderTimer = () => {
    if (!technique.timer) return null;

    const pattern = technique.timer.pattern;

    // Timer physiological sigh (complexe)
    if (pattern === 'physiological-sigh') {
      return renderPhysiologicalSighTimer();
    }

    // Timer box breathing
    if (pattern === 'box-breathing') {
      return renderBoxBreathingTimer();
    }

    // Timer standard (inhale-hold-exhale)
    return renderStandardTimer();
  };

  const renderPhysiologicalSighTimer = () => {
    const guidance = technique.timer.guidance || [];
    
    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerTitle}>Soupir Physiologique</Text>
        <Text style={styles.timerSubtitle}>
          Cycle {currentCycle + 1} / {technique.timer.cycles}
        </Text>
        
        <Animated.View 
          style={[
            styles.breathingCircle, 
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.phaseIndicator}>
            <Text style={styles.phaseText}>
              {currentPhase === 'inhale1' ? 'Inspirez' :
               currentPhase === 'inhale2' ? 'Re-inspirez !' :
               currentPhase === 'exhale' ? 'Expirez lentement' :
               'Pause'}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.timerControls}>
          {!isTimerActive ? (
            <TouchableOpacity 
              style={[styles.controlButton, styles.startButton]} 
              onPress={startTimer}
            >
              <Ionicons name="play" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]} 
              onPress={stopTimer}
            >
              <Ionicons name="stop" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.audioToggle}
          onPress={() => setAudioGuidanceEnabled(!audioGuidanceEnabled)}
        >
          <Ionicons 
            name={audioGuidanceEnabled ? 'volume-high' : 'volume-mute'} 
            size={20} 
            color={theme.colors.sub} 
          />
          <Text style={styles.audioToggleText}>
            Guidance audio {audioGuidanceEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBoxBreathingTimer = () => {
    const { inhale, hold, exhale, holdEmpty, cycles } = technique.timer;
    const totalDuration = inhale + hold + exhale + holdEmpty;

    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerTitle}>Respiration Carrée</Text>
        <Text style={styles.timerSubtitle}>
          Cycle {currentCycle + 1} / {cycles}
        </Text>

        <CountdownCircleTimer
          key={timerKey}
          isPlaying={isTimerActive}
          duration={totalDuration}
          colors={[theme.colors.primary]}
          size={200}
          strokeWidth={12}
          onComplete={handleTimerComplete}
          onUpdate={(remainingTime) => {
            let phase;
            if (remainingTime > hold + exhale + holdEmpty) {
              phase = 'inhale';
              if (currentPhase !== 'inhale') {
                setCurrentPhase('inhale');
                speakGuidance('Inspirez');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            } else if (remainingTime > exhale + holdEmpty) {
              phase = 'hold';
              if (currentPhase !== 'hold') {
                setCurrentPhase('hold');
                speakGuidance('Retenez');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            } else if (remainingTime > holdEmpty) {
              phase = 'exhale';
              if (currentPhase !== 'exhale') {
                setCurrentPhase('exhale');
                speakGuidance('Expirez');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            } else {
              phase = 'holdEmpty';
              if (currentPhase !== 'holdEmpty') {
                setCurrentPhase('holdEmpty');
                speakGuidance('Poumons vides');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }
          }}
        >
          {({ remainingTime }) => (
            <Animated.View 
              style={[
                styles.timerContent,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.phaseText}>
                {currentPhase === 'inhale' ? 'Inspirez' :
                 currentPhase === 'hold' ? 'Retenez' :
                 currentPhase === 'exhale' ? 'Expirez' :
                 'Vide'}
              </Text>
              <Text style={styles.timeText}>{remainingTime}</Text>
            </Animated.View>
          )}
        </CountdownCircleTimer>

        <View style={styles.timerControls}>
          {!isTimerActive ? (
            <TouchableOpacity 
              style={[styles.controlButton, styles.startButton]} 
              onPress={startTimer}
            >
              <Ionicons name="play" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]} 
              onPress={stopTimer}
            >
              <Ionicons name="stop" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.audioToggle}
          onPress={() => setAudioGuidanceEnabled(!audioGuidanceEnabled)}
        >
          <Ionicons 
            name={audioGuidanceEnabled ? 'volume-high' : 'volume-mute'} 
            size={20} 
            color={theme.colors.sub} 
          />
          <Text style={styles.audioToggleText}>
            Guidance vocale {audioGuidanceEnabled ? 'activée' : 'désactivée'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStandardTimer = () => {
    const { inhale, hold, exhale, cycles } = technique.timer;
    const totalDuration = inhale + hold + exhale;

    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerTitle}>{technique.title}</Text>
        <Text style={styles.timerSubtitle}>
          Cycle {currentCycle + 1} / {cycles}
        </Text>

        <CountdownCircleTimer
          key={timerKey}
          isPlaying={isTimerActive}
          duration={totalDuration}
          colors={[theme.colors.wellness.calm, theme.colors.wellness.energy]}
          colorsTime={[totalDuration, 0]}
          size={220}
          strokeWidth={14}
          onComplete={handleTimerComplete}
          onUpdate={(remainingTime) => {
            let phase;
            if (remainingTime > hold + exhale) {
              phase = 'inhale';
              if (currentPhase !== 'inhale') {
                setCurrentPhase('inhale');
                speakGuidance('Inspirez profondément');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            } else if (remainingTime > exhale) {
              phase = 'hold';
              if (currentPhase !== 'hold') {
                setCurrentPhase('hold');
                speakGuidance('Retenez');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            } else {
              phase = 'exhale';
              if (currentPhase !== 'exhale') {
                setCurrentPhase('exhale');
                speakGuidance('Expirez lentement');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }
          }}
        >
          {({ remainingTime }) => (
            <Animated.View 
              style={[
                styles.timerContent,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.phaseText}>
                {currentPhase === 'inhale' ? 'Inspirez' :
                 currentPhase === 'hold' ? 'Retenez' :
                 'Expirez'}
              </Text>
              <Text style={styles.timeText}>{remainingTime}s</Text>
            </Animated.View>
          )}
        </CountdownCircleTimer>

        <View style={styles.timerControls}>
          {!isTimerActive ? (
            <TouchableOpacity 
              style={[styles.controlButton, styles.startButton]} 
              onPress={startTimer}
            >
              <Ionicons name="play" size={28} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Démarrer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]} 
              onPress={stopTimer}
            >
              <Ionicons name="stop" size={28} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Arrêter</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Guide Complet</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color={theme.colors.sub} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Timer interactif */}
            {renderTimer()}

            {/* Instructions détaillées */}
            {technique.instructions && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list" size={22} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Instructions</Text>
                </View>
                {technique.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Conseils */}
            {technique.tips && technique.tips.length > 0 && (
              <View style={[styles.section, styles.tipsSection]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb" size={22} color={theme.colors.success} />
                  <Text style={styles.sectionTitle}>Conseils Pro</Text>
                </View>
                {technique.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Preuve scientifique */}
            {technique.evidence && (
              <View style={[styles.section, styles.evidenceSection]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="school" size={22} color={theme.colors.info} />
                  <Text style={styles.sectionTitle}>Validation Scientifique</Text>
                </View>
                <Text style={styles.evidenceText}>
                  <Text style={styles.evidenceBold}>{technique.evidence.study}</Text>
                  {' '}({technique.evidence.year}){'\n'}
                  {technique.evidence.institution}
                </Text>
                <View style={styles.evidenceMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Échantillon</Text>
                    <Text style={styles.metricValue}>n={technique.evidence.sampleSize}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Effet</Text>
                    <Text style={styles.metricValue}>{technique.evidence.effectSize}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Bouton de complétion */}
            {onComplete && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => {
                  onComplete();
                  onClose();
                }}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Marquer comme terminé</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.psychology.borderRadius.comfort,
    maxHeight: '90%',
    ...theme.psychology.shadows.intense,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.chipBorder,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  closeButton: {
    padding: theme.spacing(1),
  },
  timerContainer: {
    alignItems: 'center',
    padding: theme.spacing(4),
    backgroundColor: theme.colors.chipBg,
    margin: theme.spacing(3),
    borderRadius: theme.psychology.borderRadius.comfort,
  },
  timerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: theme.spacing(1),
  },
  timerSubtitle: {
    fontSize: 14,
    color: theme.colors.sub,
    marginBottom: theme.spacing(3),
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing(3),
  },
  phaseIndicator: {
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  timerContent: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.ink,
    marginTop: theme.spacing(1),
  },
  timerControls: {
    flexDirection: 'row',
    marginTop: theme.spacing(3),
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.psychology.borderRadius.comfort,
    ...theme.psychology.shadows.medium,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
  },
  stopButton: {
    backgroundColor: theme.colors.error,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: theme.spacing(1),
  },
  audioToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(2),
    backgroundColor: theme.colors.card,
    borderRadius: theme.psychology.borderRadius.gentle,
  },
  audioToggleText: {
    fontSize: 14,
    color: theme.colors.sub,
    marginLeft: theme.spacing(1),
  },
  section: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginLeft: theme.spacing(1),
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing(2),
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.ink,
    lineHeight: 22,
  },
  tipsSection: {
    backgroundColor: theme.colors.success + '08',
    borderRadius: theme.psychology.borderRadius.gentle,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1.5),
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.ink,
    marginLeft: theme.spacing(1),
    lineHeight: 20,
  },
  evidenceSection: {
    backgroundColor: theme.colors.info + '08',
    borderRadius: theme.psychology.borderRadius.gentle,
  },
  evidenceText: {
    fontSize: 14,
    color: theme.colors.ink,
    lineHeight: 22,
    marginBottom: theme.spacing(2),
  },
  evidenceBold: {
    fontWeight: '700',
  },
  evidenceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.chipBorder,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.sub,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.info,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing(2.5),
    margin: theme.spacing(3),
    borderRadius: theme.psychology.borderRadius.comfort,
    ...theme.psychology.shadows.medium,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: theme.spacing(1),
  },
};