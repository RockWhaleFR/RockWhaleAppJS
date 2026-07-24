// screens/BiometricDetailsScreen.js - VERSION FUSIONNÉE COMPLÈTE
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HRVTrendChart, SleepTrendChart, TimeRangeSelector } from '../components/AdvancedCharts';
import theme from '../theme/enhancedTheme';

export default function BiometricDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { biometricData, contextualData } = route.params;
  
  const [timeRange, setTimeRange] = useState('7d');

  // 🔥 Données mockées pour démonstration (remplacer par vraies données plus tard)
  const hrvHistory = [
    { timestamp: new Date(Date.now() - 6*24*60*60*1000).toISOString(), value: 45 },
    { timestamp: new Date(Date.now() - 5*24*60*60*1000).toISOString(), value: 48 },
    { timestamp: new Date(Date.now() - 4*24*60*60*1000).toISOString(), value: 52 },
    { timestamp: new Date(Date.now() - 3*24*60*60*1000).toISOString(), value: 50 },
    { timestamp: new Date(Date.now() - 2*24*60*60*1000).toISOString(), value: 55 },
    { timestamp: new Date(Date.now() - 1*24*60*60*1000).toISOString(), value: 58 },
    { timestamp: new Date().toISOString(), value: biometricData.hrv?.value || 60 },
  ];

  const sleepHistory = [
    { date: new Date(Date.now() - 6*24*60*60*1000).toISOString(), hours: 6.5 },
    { date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), hours: 7.0 },
    { date: new Date(Date.now() - 4*24*60*60*1000).toISOString(), hours: 6.8 },
    { date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), hours: 7.5 },
    { date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), hours: 7.2 },
    { date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), hours: 6.9 },
    { date: new Date().toISOString(), hours: parseFloat(biometricData.sleep?.duration) || 7.0 },
  ];

  const getHRVStatus = (value) => {
    if (!value) return { label: 'Indisponible', color: '#9E9E9E', description: 'Données manquantes' };
    if (value >= 60) return { 
      label: 'Excellent', 
      color: '#10B981', 
      description: 'Système nerveux très bien récupéré'
    };
    if (value >= 40) return { 
      label: 'Bon', 
      color: '#3B82F6', 
      description: 'Récupération satisfaisante'
    };
    if (value >= 25) return { 
      label: 'Modéré', 
      color: '#F59E0B', 
      description: 'Fatigue présente, repos recommandé'
    };
    return { 
      label: 'Faible', 
      color: '#EF4444', 
      description: 'Épuisement détecté, repos prioritaire'
    };
  };

  const getHRStatus = (value) => {
    if (!value) return { label: 'Indisponible', color: '#9E9E9E' };
    if (value < 60) return { label: 'Optimal', color: '#10B981' };
    if (value < 70) return { label: 'Bon', color: '#3B82F6' };
    if (value < 80) return { label: 'Élevé', color: '#F59E0B' };
    return { label: 'Très élevé', color: '#EF4444' };
  };

  const getSleepStatus = (duration) => {
    if (!duration) return { label: 'Inconnu', color: '#9E9E9E' };
    const hours = parseFloat(duration);
    if (hours >= 7.5) return { label: 'Excellent', color: '#10B981' };
    if (hours >= 6.5) return { label: 'Correct', color: '#3B82F6' };
    if (hours >= 5.5) return { label: 'Insuffisant', color: '#F59E0B' };
    return { label: 'Critique', color: '#EF4444' };
  };

  const hrvStatus = getHRVStatus(biometricData.hrv?.value);
  const hrStatus = getHRStatus(biometricData.restingHR?.data?.value);
  const sleepStatus = getSleepStatus(biometricData.sleep?.duration);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyse Détaillée</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Score Global */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.scoreCard}
      >
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Score de Récupération</Text>
          <View style={styles.scoreBadge}>
            <Ionicons name="trophy" size={20} color="#FFFFFF" />
          </View>
        </View>
        
        <Text style={styles.scoreValue}>
          {biometricData.stressScore?.recoveryScore || 0}
        </Text>
        <Text style={styles.scoreSubtitle}>
          Basé sur HRV, FC repos et sommeil
        </Text>

        {biometricData.stressScore?.recommendation && (
          <View style={styles.scoreRecommendation}>
            <Text style={styles.scoreRecommendationText}>
              💡 {biometricData.stressScore.recommendation}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* 📊 EXPLICATION CALCUL SCORE */}
      <View style={styles.explanationCard}>
        <Text style={styles.explanationTitle}>
          📊 Comment est calculé ton score ?
        </Text>
        
        <View style={styles.explanationSection}>
          <View style={styles.explanationHeader}>
            <Ionicons name="pulse" size={20} color="#3B82F6" />
            <Text style={styles.explanationMetric}>HRV (Variabilité Cardiaque)</Text>
            <Text style={styles.explanationWeight}>35 points max</Text>
          </View>
          <Text style={styles.explanationText}>
            Mesure l'équilibre de ton système nerveux. Plus elle est haute, meilleure est ta récupération.
          </Text>
          {biometricData.stressScore?.metrics?.hrv && (
            <Text style={styles.explanationScore}>
              Ton impact: {biometricData.stressScore.metrics.hrv.score} pts
            </Text>
          )}
        </View>

        <View style={styles.explanationSection}>
          <View style={styles.explanationHeader}>
            <Ionicons name="heart" size={20} color="#EF4444" />
            <Text style={styles.explanationMetric}>FC Repos</Text>
            <Text style={styles.explanationWeight}>30 points max</Text>
          </View>
          <Text style={styles.explanationText}>
            Indique l'efficacité de ton système cardiovasculaire. Objectif: &lt;70 bpm.
          </Text>
          {biometricData.stressScore?.metrics?.heartRate && (
            <Text style={styles.explanationScore}>
              Ton impact: {biometricData.stressScore.metrics.heartRate.score} pts
            </Text>
          )}
        </View>

        <View style={styles.explanationSection}>
          <View style={styles.explanationHeader}>
            <Ionicons name="moon" size={20} color="#8B5CF6" />
            <Text style={styles.explanationMetric}>Sommeil</Text>
            <Text style={styles.explanationWeight}>25 points max</Text>
          </View>
          <Text style={styles.explanationText}>
            Durée et qualité de ton sommeil. Objectif: 7-9h/nuit.
          </Text>
          {biometricData.stressScore?.metrics?.sleep && (
            <Text style={styles.explanationScore}>
              Ton impact: {biometricData.stressScore.metrics.sleep.score} pts
            </Text>
          )}
        </View>

        <View style={styles.explanationFooter}>
          <Ionicons name="calculator-outline" size={18} color={theme.colors.accent} />
          <Text style={styles.explanationFooterText}>
            Score = HRV (35) + FC (30) + Sommeil (25) + Bonus (10)
          </Text>
        </View>
      </View>

      {/* 🔥 GRAPHIQUES - Sélecteur période */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>📈 Évolution de tes Métriques</Text>
        <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
        
        {/* Graphique HRV */}
        <HRVTrendChart data={hrvHistory} timeRange={timeRange} />
        
        {/* Graphique Sommeil */}
        <SleepTrendChart data={sleepHistory} timeRange={timeRange} />
      </View>

      {/* Métriques Détaillées */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>🔬 Analyse Approfondie</Text>
        
        {/* HRV */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="pulse" size={24} color={hrvStatus.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitle}>Variabilité Cardiaque (HRV)</Text>
              <View style={[styles.statusBadge, { backgroundColor: hrvStatus.color + '20' }]}>
                <Text style={[styles.statusText, { color: hrvStatus.color }]}>
                  {hrvStatus.label}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.metricValue}>
            {biometricData.hrv?.value || '--'} <Text style={styles.metricUnit}>ms</Text>
          </Text>

          <Text style={styles.metricDescription}>
            {hrvStatus.description}
          </Text>

          <View style={styles.metricInfo}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.sub} />
            <Text style={styles.metricInfoText}>
              La HRV mesure la variation entre tes battements cardiaques. 
              Plus elle est élevée, meilleure est ta récupération.
            </Text>
          </View>

          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((biometricData.hrv?.value / 100) * 100, 100)}%`,
                    backgroundColor: hrvStatus.color
                  }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0</Text>
              <Text style={styles.progressLabel}>50</Text>
              <Text style={styles.progressLabel}>100+</Text>
            </View>
          </View>
        </View>

        {/* Fréquence Cardiaque Repos */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="heart" size={24} color={hrStatus.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitle}>Fréquence Cardiaque Repos</Text>
              <View style={[styles.statusBadge, { backgroundColor: hrStatus.color + '20' }]}>
                <Text style={[styles.statusText, { color: hrStatus.color }]}>
                  {hrStatus.label}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.metricValue}>
            {biometricData.restingHR?.data?.value || '--'} <Text style={styles.metricUnit}>bpm</Text>
          </Text>

          <Text style={styles.metricDescription}>
            {biometricData.restingHR?.data?.value < 60 && 'Excellente condition physique'}
            {biometricData.restingHR?.data?.value >= 60 && biometricData.restingHR?.data?.value < 70 && 'Bonne condition cardiovasculaire'}
            {biometricData.restingHR?.data?.value >= 70 && biometricData.restingHR?.data?.value < 80 && 'FC légèrement élevée, gestion du stress recommandée'}
            {biometricData.restingHR?.data?.value >= 80 && 'FC élevée, repos et techniques de relaxation prioritaires'}
          </Text>

          <View style={styles.metricInfo}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.sub} />
            <Text style={styles.metricInfoText}>
              La FC au repos indique l'efficacité de ton système cardiovasculaire. 
              Objectif : &lt;70 bpm.
            </Text>
          </View>

          {/* Échelle visuelle */}
          <View style={styles.hrScale}>
            <View style={[styles.hrZone, { backgroundColor: '#10B981' }]}>
              <Text style={styles.hrZoneText}>&lt;60</Text>
            </View>
            <View style={[styles.hrZone, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.hrZoneText}>60-70</Text>
            </View>
            <View style={[styles.hrZone, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.hrZoneText}>70-80</Text>
            </View>
            <View style={[styles.hrZone, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.hrZoneText}>80+</Text>
            </View>
          </View>
        </View>

        {/* Sommeil */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="moon" size={24} color={sleepStatus.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitle}>Qualité du Sommeil</Text>
              <View style={[styles.statusBadge, { backgroundColor: sleepStatus.color + '20' }]}>
                <Text style={[styles.statusText, { color: sleepStatus.color }]}>
                  {sleepStatus.label}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.metricValue}>
            {biometricData.sleep?.duration || '--'} <Text style={styles.metricUnit}>heures</Text>
          </Text>

          <Text style={styles.metricDescription}>
            {biometricData.sleep?.quality === 'excellent' && 'Sommeil réparateur optimal'}
            {biometricData.sleep?.quality === 'good' && 'Bonne récupération nocturne'}
            {biometricData.sleep?.quality === 'acceptable' && 'Sommeil acceptable mais perfectible'}
            {biometricData.sleep?.quality === 'poor' && 'Sommeil insuffisant, repos prioritaire'}
          </Text>

          <View style={styles.metricInfo}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.sub} />
            <Text style={styles.metricInfoText}>
              L'adulte a besoin de 7-9h de sommeil par nuit. 
              Chaque heure manquante réduit la HRV de 10-15%.
            </Text>
          </View>

          {/* Recommandations sommeil */}
          {biometricData.sleep?.duration && parseFloat(biometricData.sleep.duration) < 7 && (
            <View style={styles.sleepTip}>
              <Ionicons name="bulb" size={18} color="#F59E0B" />
              <Text style={styles.sleepTipText}>
                💤 Vise +{(7 - parseFloat(biometricData.sleep.duration)).toFixed(1)}h de sommeil ce soir
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('TechniquesLibrary')}
        >
          <Ionicons name="fitness" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Améliorer mes métriques</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
            Gérer Google Fit
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
  },

  scoreCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    ...theme.psychology.shadows.warm,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  scoreRecommendation: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
  },
  scoreRecommendationText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  explanationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    ...theme.psychology.shadows.soft,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 16,
  },
  explanationSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.chipBg,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  explanationMetric: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.ink,
  },
  explanationWeight: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.sub,
  },
  explanationText: {
    fontSize: 13,
    color: theme.colors.sub,
    lineHeight: 18,
    marginBottom: 6,
  },
  explanationScore: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  explanationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent + '10',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  explanationFooterText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.accent,
  },

  chartsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 16,
  },

  metricsContainer: {
    paddingHorizontal: 20,
  },
  metricCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...theme.psychology.shadows.soft,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.chipBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 40,
    fontWeight: '800',
    color: theme.colors.ink,
    marginBottom: 8,
  },
  metricUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.sub,
  },
  metricDescription: {
    fontSize: 14,
    color: theme.colors.sub,
    lineHeight: 20,
    marginBottom: 12,
  },
  metricInfo: {
    flexDirection: 'row',
    backgroundColor: theme.colors.chipBg,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  metricInfoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.sub,
    lineHeight: 18,
    marginLeft: 8,
  },

  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.chipBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: theme.colors.sub,
  },

  hrScale: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  hrZone: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  hrZoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  sleepTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  sleepTipText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    fontWeight: '600',
  },

  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...theme.psychology.shadows.warm,
  },
  actionButtonSecondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});