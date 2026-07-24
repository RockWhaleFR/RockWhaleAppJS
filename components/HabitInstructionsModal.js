// components/HabitInstructionsModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

export default function HabitInstructionsModal({ habit, visible, onClose, onCompleteHabit }) {
  if (!habit || !habit.instructions) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{habit.instructions.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Étapes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Étapes à suivre</Text>
              {habit.instructions.steps.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Conseils */}
            {habit.instructions.tips && habit.instructions.tips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Conseils pratiques</Text>
                {habit.instructions.tips.map((tip, index) => (
                  <View key={index} style={styles.tipContainer}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Durée estimée */}
            {habit.duration && (
              <View style={styles.durationCard}>
                <Ionicons name="time-outline" size={24} color={theme.colors.accent} />
                <View style={styles.durationContent}>
                  <Text style={styles.durationLabel}>Durée estimée</Text>
                  <Text style={styles.durationValue}>{habit.duration}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bouton de validation (uniquement si sans timer) */}
          {onCompleteHabit && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => {
                onClose();
                onCompleteHabit();
              }}
            >
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primaryInk} />
              <Text style={styles.completeButtonText}>J'ai terminé</Text>
            </TouchableOpacity>
          )}

          {/* Bouton fermer (si timer, l'exercice se fait dans ActivityScreen) */}
          {!onCompleteHabit && (
            <TouchableOpacity
              style={styles.closeBottomButton}
              onPress={onClose}
            >
              <Text style={styles.closeBottomButtonText}>Compris, commencer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: theme.spacing(2),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.chipBorder,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing(1),
  },
  scrollContent: {
    flex: 1,
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: theme.spacing(2),
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing(2),
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
    marginTop: 2,
  },
  stepNumberText: {
    color: theme.colors.primaryInk,
    fontWeight: '700',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.ink,
    lineHeight: 22,
  },
  tipContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing(1.5),
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.sub,
    lineHeight: 20,
    marginLeft: theme.spacing(1),
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: theme.spacing(2),
    borderRadius: theme.radius.m,
    marginTop: theme.spacing(2),
  },
  durationContent: {
    marginLeft: theme.spacing(2),
  },
  durationLabel: {
    fontSize: 12,
    color: theme.colors.sub,
    marginBottom: 2,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing(2.5),
    marginHorizontal: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.radius.xl,
    ...theme.psychology.shadows.warm,
  },
  completeButtonText: {
    color: theme.colors.primaryInk,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: theme.spacing(1),
  },
  closeBottomButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(2.5),
    marginHorizontal: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    ...theme.psychology.shadows.warm,
  },
  closeBottomButtonText: {
    color: theme.colors.primaryInk,
    fontSize: 18,
    fontWeight: '700',
  },
});