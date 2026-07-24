// components/MentalScoreCard.js - Score Bien-Être Mental
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

/**
 * Calcule le score mental global depuis PSS-4 et PERMA
 * @param {object} stressProfile - Profil de stress (PSS-4)
 * @param {object} wellbeingProfile - Profil PERMA
 * @returns {number} Score 0-100
 */
const calculateMentalScore = (stressProfile, wellbeingProfile) => {
  if (!stressProfile || !wellbeingProfile) return null;
  
  // PSS-4 : Score 0-16, on inverse (16 = stress max = 0 mental score)
  const stressComponent = ((16 - stressProfile.score) / 16) * 100;
  
  // PERMA : Score moyen sur 5, on ramène sur 100
  const permaComponent = (wellbeingProfile.overallScore / 5) * 100;
  
  // Pondération : 50% PSS-4 + 50% PERMA
  const mentalScore = (stressComponent * 0.5) + (permaComponent * 0.5);
  
  return Math.round(mentalScore);
};

/**
 * Détermine le niveau et la couleur selon le score
 */
const getMentalStatus = (score) => {
  if (!score) return { 
    level: 'Indisponible', 
    color: '#9E9E9E', 
    icon: 'help-circle',
    gradient: ['#9E9E9E', '#757575'],
    message: 'Complète le diagnostic pour voir ton score'
  };
  
  if (score >= 80) return {
    level: 'Excellent',
    color: '#10B981',
    icon: 'happy',
    gradient: ['#10B981', '#059669'],
    message: 'Ton bien-être mental est optimal'
  };
  
  if (score >= 65) return {
    level: 'Bon',
    color: '#3B82F6',
    icon: 'happy-outline',
    gradient: ['#3B82F6', '#2563EB'],
    message: 'Bonne santé mentale, continue'
  };
  
  if (score >= 50) return {
    level: 'Modéré',
    color: '#F59E0B',
    icon: 'sad-outline',
    gradient: ['#F59E0B', '#D97706'],
    message: 'Quelques difficultés à gérer'
  };
  
  return {
    level: 'Faible',
    color: '#EF4444',
    icon: 'sad',
    gradient: ['#EF4444', '#DC2626'],
    message: 'Soutien mental prioritaire'
  };
};

export default function MentalScoreCard({ user, onPress }) {
  const mentalScore = calculateMentalScore(user.stressProfile, user.wellbeingProfile);
  const status = getMentalStatus(mentalScore);
  
  // Identifier dimension PERMA la plus faible
  const weakestDimension = user.wellbeingProfile 
    ? Object.entries({
        engagement: user.wellbeingProfile.engagement,
        relationships: user.wellbeingProfile.relationships,
        meaning: user.wellbeingProfile.meaning,
        accomplishment: user.wellbeingProfile.accomplishment
      }).sort((a, b) => a[1] - b[1])[0]
    : null;
  
  const dimensionLabels = {
    engagement: 'Engagement/Flow',
    relationships: 'Relations sociales',
    meaning: 'Sens & Purpose',
    accomplishment: 'Accomplissement'
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={status.gradient}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="brain" size={20} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Bien-Être Mental</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name={status.icon} size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* Score Principal */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>
            {mentalScore !== null ? mentalScore : '--'}
          </Text>
          <Text style={styles.scoreLabel}>{status.level}</Text>
        </View>

        {/* Message */}
        <Text style={styles.message}>{status.message}</Text>

        {/* Composantes */}
        {user.stressProfile && user.wellbeingProfile && (
          <View style={styles.componentsRow}>
            <View style={styles.componentItem}>
              <Text style={styles.componentLabel}>Stress PSS-4</Text>
              <Text style={styles.componentValue}>
                {user.stressProfile.score}/16
              </Text>
            </View>
            
            <View style={styles.componentDivider} />
            
            <View style={styles.componentItem}>
              <Text style={styles.componentLabel}>PERMA</Text>
              <Text style={styles.componentValue}>
                {user.wellbeingProfile.overallScore.toFixed(1)}/5
              </Text>
            </View>
          </View>
        )}

        {/* Point d'amélioration */}
        {weakestDimension && (
          <View style={styles.insightBox}>
            <Ionicons name="bulb-outline" size={16} color="#FFFFFF" />
            <Text style={styles.insightText}>
              Point d'amélioration : {dimensionLabels[weakestDimension[0]]}
            </Text>
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>Voir analyse détaillée</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...theme.psychology.shadows.warm,
  },
  gradient: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 60,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  componentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  componentItem: {
    alignItems: 'center',
    flex: 1,
  },
  componentLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  componentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  componentDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    gap: 6,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});