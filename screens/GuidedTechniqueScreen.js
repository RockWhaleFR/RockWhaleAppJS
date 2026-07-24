// screens/GuidedTechniqueScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import useUserStore from '../store/useUserStore';
import theme from '../theme';

export default function GuidedTechniqueScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { habit, onComplete } = route.params;
  const { user } = useUserStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const confettiRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const steps = habit.instructions?.steps || [
    "Prenez une position confortable",
    "Concentrez-vous sur votre respiration",
    "Suivez les instructions à votre rythme",
    "Prenez le temps dont vous avez besoin"
  ];

  const totalSteps = steps.length;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (user.preferences?.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep < totalSteps - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setCurrentStep(currentStep + 1);
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    confettiRef.current?.start();
    
    if (user.preferences?.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setTimeout(() => {
      onComplete();
      navigation.goBack();
    }, 2000);
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {isCompleted && <ConfettiCannon count={200} origin={{x: -10, y: 0}} ref={confettiRef} fadeOut />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={theme.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{habit.title}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Étape {currentStep + 1} / {totalSteps}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Illustration (optionnelle) */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationCircle}>
              <Ionicons 
                name={currentStep === 0 ? 'body-outline' : 
                      currentStep === totalSteps - 1 ? 'checkmark-circle' : 
                      'pulse-outline'} 
                size={64} 
                color={theme.colors.primary} 
              />
            </View>
          </View>

          {/* Instruction actuelle */}
          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>Étape {currentStep + 1}</Text>
            <Text style={styles.stepText}>{steps[currentStep]}</Text>
          </View>

          {/* Conseils */}
          {habit.instructions?.tips && currentStep < habit.instructions.tips.length && (
            <View style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={20} color={theme.colors.accent} />
              <Text style={styles.tipText}>
                {habit.instructions.tips[currentStep]}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Boutons */}
      <View style={styles.buttonsContainer}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps - 1 ? "Terminer" : "Suivant"}
          </Text>
          <Ionicons 
            name={currentStep === totalSteps - 1 ? "checkmark" : "arrow-forward"} 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(2),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  progressContainer: {
    paddingHorizontal: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.chipBg,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing(1),
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.sub,
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(20),
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  illustrationCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    ...theme.psychology.shadows.soft,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
    marginBottom: theme.spacing(1),
  },
  stepText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.ink,
    lineHeight: 28,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accent + '10',
    padding: theme.spacing(2),
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.ink,
    marginLeft: theme.spacing(1),
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing(3),
    paddingBottom: theme.spacing(20),
    gap: theme.spacing(2),
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing(2),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing(1),
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing(2),
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    ...theme.psychology.shadows.warm,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: theme.spacing(1),
  },
});