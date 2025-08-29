// components/HabitInstructionsModal.js - Version améliorée
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import theme from '../theme';

export default function HabitInstructionsModal({ habit, visible, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setIsTimerRunning(false);
      setKey(prev => prev + 1);
    }
  }, [visible]);

  const startTimer = () => setIsTimerRunning(true);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setKey(prev => prev + 1);
  };

  const renderTimer = () => {
    if (!habit.timer) return null;

    const totalTime = habit.timer.inhale + habit.timer.hold + habit.timer.exhale;

    return (
      <View style={{ alignItems: 'center', marginVertical: theme.spacing(3) }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '700', 
          color: theme.colors.ink,
          marginBottom: theme.spacing(2),
          textAlign: 'center'
        }}>
          ⏰ Timer de Respiration Guidée
        </Text>

        <CountdownCircleTimer
          key={key}
          isPlaying={isTimerRunning}
          duration={totalTime}
          colors={['#FF6B35', '#0A1628', '#6EE7F9']}
          colorsTime={[habit.timer.inhale + habit.timer.hold, habit.timer.inhale, 0]}
          size={140}
          strokeWidth={10}
          onComplete={() => {
            return { shouldRepeat: true, delay: 0 };
          }}
        >
          {({ remainingTime }) => {
            let phase = 'Inspirez';
            let color = '#4CAF50';
            
            if (remainingTime > habit.timer.hold + habit.timer.exhale) {
              phase = 'Inspirez';
              color = '#4CAF50';
            } else if (remainingTime > habit.timer.exhale) {
              phase = 'Retenez';
              color = '#FF9800';
            } else {
              phase = 'Expirez';
              color = '#2196F3';
            }

            return (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.ink }}>
                  {remainingTime}s
                </Text>
                <Text style={{ fontSize: 18, color, fontWeight: '600', marginTop: 8 }}>
                  {phase}
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.sub, marginTop: 4 }}>
                  {phase === 'Inspirez' && `Pendant ${habit.timer.inhale}s`}
                  {phase === 'Retenez' && `Pendant ${habit.timer.hold}s`}
                  {phase === 'Expirez' && `Pendant ${habit.timer.exhale}s`}
                </Text>
              </View>
            );
          }}
        </CountdownCircleTimer>

        <View style={{ flexDirection: 'row', marginTop: theme.spacing(2) }}>
          {!isTimerRunning ? (
            <TouchableOpacity
              onPress={startTimer}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.spacing(3),
                paddingVertical: theme.spacing(2),
                borderRadius: theme.radius.l,
                marginRight: theme.spacing(1),
                flex: 1
              }}
            >
              <Text style={{ color: theme.colors.primaryInk, fontWeight: '600', textAlign: 'center' }}>
                Démarrer
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={resetTimer}
              style={{
                backgroundColor: '#F44336',
                paddingHorizontal: theme.spacing(3),
                paddingVertical: theme.spacing(2),
                borderRadius: theme.radius.l,
                flex: 1
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                Arrêter
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={{ 
          color: theme.colors.sub, 
          fontSize: 12, 
          textAlign: 'center',
          marginTop: theme.spacing(1)
        }}>
          {habit.timer.cycles} cycles complets
        </Text>
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
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        justifyContent: 'center',
        padding: theme.spacing(2)
      }}>
        <View style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.xl,
          padding: theme.spacing(3),
          maxHeight: '90%',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing(3) }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.ink }}>
              🎯 Guide Complet
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={{ padding: 8 }}
            >
              <Ionicons name="close-circle" size={28} color={theme.colors.sub} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Instructions étape par étape */}
            {habit.instructions && (
              <View style={{ marginBottom: theme.spacing(3) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(2) }}>
                  <Ionicons name="list" size={20} color={theme.colors.primary} />
                  <Text style={{ fontWeight: '700', color: theme.colors.ink, marginLeft: 8, fontSize: 18 }}>
                    Instructions Détaillées
                  </Text>
                </View>
                
                {habit.instructions.map((instruction, index) => (
                  <View key={index} style={{ 
                    flexDirection: 'row', 
                    marginBottom: theme.spacing(2),
                    backgroundColor: index === currentStep ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                    padding: index === currentStep ? theme.spacing(2) : 0,
                    borderRadius: index === currentStep ? theme.radius.m : 0
                  }}>
                    <View style={{ 
                      width: 30, 
                      height: 30, 
                      borderRadius: 15, 
                      backgroundColor: theme.colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: theme.spacing(2)
                    }}>
                      <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={{ 
                      color: theme.colors.ink, 
                      flex: 1,
                      fontSize: 15,
                      lineHeight: 22
                    }}>
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Timer pour les exercices de respiration */}
            {habit.timer && renderTimer()}

            {/* Conseils et erreurs communes */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing(3) }}>
              {/* Conseils */}
              {habit.tips && habit.tips.length > 0 && (
                <View style={{ flex: 1, minWidth: '48%', marginRight: theme.spacing(1) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(1) }}>
                    <Ionicons name="bulb" size={18} color="#4CAF50" />
                    <Text style={{ fontWeight: '600', color: theme.colors.ink, marginLeft: 6, fontSize: 16 }}>
                      💡 Conseils Pro
                    </Text>
                  </View>
                  {habit.tips.map((tip, index) => (
                    <View key={index} style={{ 
                      flexDirection: 'row', 
                      marginBottom: theme.spacing(1),
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      padding: theme.spacing(1.5),
                      borderRadius: theme.radius.m
                    }}>
                      <Text style={{ color: theme.colors.ink, fontSize: 14, lineHeight: 20 }}>
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Erreurs communes */}
              {habit.commonMistakes && habit.commonMistakes.length > 0 && (
                <View style={{ flex: 1, minWidth: '48%' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(1) }}>
                    <Ionicons name="warning" size={18} color="#F44336" />
                    <Text style={{ fontWeight: '600', color: theme.colors.ink, marginLeft: 6, fontSize: 16 }}>
                      ⚠️ À Éviter
                    </Text>
                  </View>
                  {habit.commonMistakes.map((mistake, index) => (
                    <View key={index} style={{ 
                      flexDirection: 'row', 
                      marginBottom: theme.spacing(1),
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      padding: theme.spacing(1.5),
                      borderRadius: theme.radius.m
                    }}>
                      <Text style={{ color: theme.colors.ink, fontSize: 14, lineHeight: 20 }}>
                        {mistake}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Info scientifique */}
            <View style={{ 
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              padding: theme.spacing(2),
              borderRadius: theme.radius.m,
              marginBottom: theme.spacing(2),
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.primary
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(1) }}>
                <Ionicons name="school" size={18} color={theme.colors.primary} />
                <Text style={{ fontWeight: '700', color: theme.colors.ink, marginLeft: 6, fontSize: 16 }}>
                  🧪 Preuve Scientifique
                </Text>
              </View>
              <Text style={{ color: theme.colors.ink, fontSize: 15, lineHeight: 22 }}>
                {habit.scientificFact}
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: theme.colors.primary,
              padding: theme.spacing(2),
              borderRadius: theme.radius.l,
              alignItems: 'center',
              marginTop: theme.spacing(2),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ color: theme.colors.primaryInk, fontWeight: '700', fontSize: 16 }}>
              🚀 Commencer l'Exercice
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}