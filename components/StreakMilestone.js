// components/StreakMilestone.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNextStreakMilestone } from '../utils/badges';
import theme from '../theme';

export default function StreakMilestone({ streak }) {
  const nextMilestone = getNextStreakMilestone(streak);
  const progress = streak >= nextMilestone.days ? 100 : Math.floor((streak / nextMilestone.days) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={28} color={theme.colors.primary} />
          <Text style={styles.streakText}>{streak}</Text>
          <Text style={styles.streakLabel}>jours de série</Text>
        </View>
        <View style={styles.milestoneContainer}>
          <Image source={nextMilestone.image} style={styles.milestoneIcon} />
          <Text style={styles.milestoneLabel}>Prochain badge</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        Plus que {Math.max(0, nextMilestone.days - streak)} jours pour le badge "{nextMilestone.name}"
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.psychology.borderRadius.comfort,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    ...theme.psychology.shadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  streakContainer: {
    flex: 1, // Permet à ce conteneur de prendre l'espace disponible
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // Permet au texte de passer à la ligne si l'espace est réduit
  },
  streakText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: theme.spacing(1),
  },
  streakLabel: {
    fontSize: 14,
    color: theme.colors.sub,
    fontWeight: '500',
    marginLeft: theme.spacing(1),
    paddingBottom: 4,
  },
  milestoneContainer: {
    alignItems: 'center',
    marginLeft: theme.spacing(2), // Ajoute un espace pour ne pas être collé
  },
  milestoneIcon: {
    width: 40,
    height: 40,
  },
  milestoneLabel: {
    fontSize: 12,
    color: theme.colors.sub,
    fontWeight: '600',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: theme.colors.chipBg,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: theme.spacing(1),
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.sub,
    textAlign: 'center',
    fontWeight: '500',
  },
});