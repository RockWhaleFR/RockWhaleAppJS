// components/RecommendationCard.js - AVEC RAISONS VISIBLES
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

export default function RecommendationCard({ recommendation, onPress, user }) {
  const priorityColors = {
    critical: '#EF4444',
    high: '#F59E0B',
    moderate: '#3B82F6',
    low: '#10B981'
  };

  // Première technique (meilleure)
  const topTechnique = recommendation.techniques?.[0];
  const isPremium = topTechnique?.isPremium;
  const isLocked = isPremium && !user?.isPremium;

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: priorityColors[recommendation.priority] }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColors[recommendation.priority] + '20' }]}>
          <Text style={[styles.priorityText, { color: priorityColors[recommendation.priority] }]}>
            {recommendation.priority.toUpperCase()}
          </Text>
        </View>
        
        {isLocked && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.premiumText}>PRO</Text>
          </View>
        )}
        
        <Text style={styles.timing}>{recommendation.timing}</Text>
      </View>

      {/* Titre */}
      <Text style={styles.title}>{recommendation.title}</Text>
      
      {/* Raison */}
      <Text style={styles.reason}>{recommendation.reason}</Text>

      {/* 🔥 NOUVEAU : Raisons techniques matchées */}
      {topTechnique && topTechnique.reasons && topTechnique.reasons.length > 0 && (
        <View style={styles.matchReasonBox}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
          <Text style={styles.matchReasonText}>
            {topTechnique.reasons[0]}
          </Text>
        </View>
      )}

      {/* Rationale scientifique */}
      {recommendation.scientificRationale && (
        <View style={styles.scientificBox}>
          <Ionicons name="flask-outline" size={14} color={theme.colors.accent} />
          <Text style={styles.scientificText}>
            {recommendation.scientificRationale}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        {/* Technique suggérée */}
        {topTechnique && (
          <View style={styles.techniquePreview}>
            <Ionicons name="fitness-outline" size={14} color={theme.colors.ink} />
            <Text style={styles.techniqueTitle} numberOfLines={1}>
              {topTechnique.title}
            </Text>
          </View>
        )}
        
        <Text style={styles.duration}>
          <Ionicons name="time-outline" size={12} /> {recommendation.duration}
        </Text>
        
        <View style={styles.actionBadge}>
          <Text style={styles.actionText}>
            {isLocked ? 'Débloquer' : topTechnique ? 'Essayer' : 'Voir techniques'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
        </View>
      </View>

      {/* 🔥 NOUVEAU : Score de match (debug mode) */}
      {topTechnique?.matchScore && __DEV__ && (
        <View style={styles.debugScore}>
          <Text style={styles.debugText}>Match: {Math.round(topTechnique.matchScore)}/100</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...theme.psychology.shadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
  timing: {
    fontSize: 12,
    color: theme.colors.sub,
    marginLeft: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 8,
  },
  reason: {
    fontSize: 14,
    color: theme.colors.sub,
    lineHeight: 20,
    marginBottom: 12,
  },
  matchReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent + '10',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  matchReasonText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: '600',
    lineHeight: 18,
  },
  scientificBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.chipBg,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  scientificText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.sub,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  techniquePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  techniqueTitle: {
    fontSize: 13,
    color: theme.colors.ink,
    fontWeight: '600',
    flex: 1,
  },
  duration: {
    fontSize: 12,
    color: theme.colors.sub,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  debugScore: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 4,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
  },
});