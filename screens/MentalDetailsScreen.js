// screens/MentalDetailsScreen.js - DÉTAILS BIEN-ÊTRE MENTAL
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme/enhancedTheme';

export default function MentalDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = route.params;

  const stressProfile = user?.stressProfile;
  const wellbeingProfile = user?.wellbeingProfile;

  if (!stressProfile || !wellbeingProfile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={theme.colors.sub} />
        <Text style={styles.errorText}>Aucune évaluation disponible</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.navigate('StressDiagnostic')}
        >
          <Text style={styles.errorButtonText}>Passer le test</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const daysSince = calculateDaysSince(stressProfile.completedAt);
  const shouldRetake = daysSince >= 14;

  // Calculer score global
  const overallScore = Math.round(wellbeingProfile.overallScore * 20); // /5 → /100

  // Couleur selon score
  const getScoreColor = (score) => {
    if (score >= 75) return '#10B981';
    if (score >= 50) return '#3B82F6';
    if (score >= 25) return '#F59E0B';
    return '#EF4444';
  };

  const scoreColor = getScoreColor(overallScore);
const getTopStrengths = (profile) => {
  const dimensions = [
    { name: 'Émotions positives', value: profile.positiveEmotions },
    { name: 'Engagement', value: profile.engagement },
    { name: 'Relations', value: profile.relationships },
    { name: 'Sens', value: profile.meaning },
    { name: 'Accomplissement', value: profile.accomplishment }
  ];
  
  return dimensions
    .filter(d => d.value >= 4)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(d => `${d.name} (${d.value.toFixed(1)}/5)`);
};

const getTopWeaknesses = (profile) => {
  const dimensions = [
    { name: 'Émotions positives', value: profile.positiveEmotions },
    { name: 'Engagement', value: profile.engagement },
    { name: 'Relations', value: profile.relationships },
    { name: 'Sens', value: profile.meaning },
    { name: 'Accomplissement', value: profile.accomplishment }
  ];
  
  return dimensions
    .filter(d => d.value < 3.5)
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(d => `${d.name} (${d.value.toFixed(1)}/5)`);
};
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
        <Text style={styles.headerTitle}>Bien-être Mental</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* 🔥 ALERTE SI > 14 JOURS */}
      {shouldRetake && (
        <View style={styles.alertCard}>
          <Ionicons name="calendar" size={24} color="#F59E0B" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.alertTitle}>
              📅 Évaluation expirée
            </Text>
            <Text style={styles.alertText}>
              Il y a {daysSince} jours depuis ton dernier test. Refais-le pour des recommandations actualisées.
            </Text>
          </View>
        </View>
      )}

      {/* Score Global */}
      <LinearGradient
        colors={[scoreColor, scoreColor + 'CC']}
        style={styles.scoreCard}
      >
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Score Global</Text>
          <View style={styles.scoreBadge}>
            <Ionicons name="analytics" size={20} color="#FFFFFF" />
          </View>
        </View>
        
        <Text style={styles.scoreValue}>{overallScore}</Text>
        <Text style={styles.scoreSubtitle}>
          sur 100
        </Text>

        <View style={styles.scoreInterpretation}>
          <Text style={styles.scoreInterpretationText}>
            {overallScore >= 75 && '🎉 Excellent bien-être mental'}
            {overallScore >= 50 && overallScore < 75 && '✅ Bien-être satisfaisant'}
            {overallScore >= 25 && overallScore < 50 && '⚠️ Bien-être à améliorer'}
            {overallScore < 25 && '🚨 Bien-être critique - Aide recommandée'}
          </Text>
        </View>
      </LinearGradient>
{/* 📋 RÉSUMÉ DERNIER TEST */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>📋 Résumé de ton test</Text>
  
  <View style={styles.summaryCard}>
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Date du test</Text>
      <Text style={styles.summaryValue}>
        {new Date(stressProfile.completedAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </Text>
    </View>
    
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Stress perçu</Text>
      <Text style={[styles.summaryValue, { 
        color: stressProfile.level === 'critical' ? '#EF4444' :
               stressProfile.level === 'high' ? '#F59E0B' : '#10B981'
      }]}>
        {stressProfile.score}/16 ({
          stressProfile.level === 'low' ? 'Faible' :
          stressProfile.level === 'moderate' ? 'Modéré' :
          stressProfile.level === 'high' ? 'Élevé' : 'Critique'
        })
      </Text>
    </View>
    
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Bien-être global</Text>
      <Text style={[styles.summaryValue, { color: scoreColor }]}>
        {overallScore}/100
      </Text>
    </View>

    {/* Points forts */}
    <View style={{ marginTop: 16 }}>
      <Text style={styles.summarySubtitle}>💪 Tes points forts</Text>
      {getTopStrengths(wellbeingProfile).map((strength, idx) => (
        <View key={idx} style={styles.strengthItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.strengthText}>{strength}</Text>
        </View>
      ))}
    </View>

    {/* Points d'amélioration */}
    <View style={{ marginTop: 12 }}>
      <Text style={styles.summarySubtitle}>🎯 À améliorer</Text>
      {getTopWeaknesses(wellbeingProfile).map((weakness, idx) => (
        <View key={idx} style={styles.weaknessItem}>
          <Ionicons name="arrow-up-circle-outline" size={16} color="#F59E0B" />
          <Text style={styles.weaknessText}>{weakness}</Text>
        </View>
      ))}
    </View>
  </View>
</View>
      {/* PSS-4 (Stress Perçu) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Stress Perçu (PSS-4)</Text>
        
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="pulse" size={24} color="#EF4444" />
            <Text style={styles.metricTitle}>
              {stressProfile.score} / 16 points
            </Text>
          </View>

          <View style={styles.stressBar}>
            <View 
              style={[
                styles.stressBarFill, 
                { 
                  width: `${(stressProfile.score / 16) * 100}%`,
                  backgroundColor: stressProfile.level === 'critical' ? '#EF4444' :
                                   stressProfile.level === 'high' ? '#F59E0B' :
                                   stressProfile.level === 'moderate' ? '#3B82F6' : '#10B981'
                }
              ]} 
            />
          </View>

          <Text style={styles.metricDescription}>
            Niveau : <Text style={{ fontWeight: '700' }}>
              {stressProfile.level === 'low' && 'Faible ✅'}
              {stressProfile.level === 'moderate' && 'Modéré ⚠️'}
              {stressProfile.level === 'high' && 'Élevé 🔴'}
              {stressProfile.level === 'critical' && 'Critique 🚨'}
            </Text>
          </Text>

          {/* Breakdown PSS-4 */}
          {stressProfile.pssBreakdown && (
            <View style={styles.breakdown}>
              <Text style={styles.breakdownTitle}>Détails :</Text>
              <BreakdownItem 
                label="Contrôle perçu" 
                value={stressProfile.pssBreakdown.control} 
              />
              <BreakdownItem 
                label="Débordement" 
                value={stressProfile.pssBreakdown.overwhelm} 
              />
            </View>
          )}
        </View>
      </View>

      {/* PERMA (Flourishing) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌟 PERMA (Épanouissement)</Text>
        
        <View style={styles.permaGrid}>
          <PermaCard 
            icon="happy-outline"
            label="Émotions Positives"
            value={wellbeingProfile.positiveEmotions}
            color="#10B981"
          />
          <PermaCard 
            icon="flash-outline"
            label="Engagement"
            value={wellbeingProfile.engagement}
            color="#3B82F6"
          />
          <PermaCard 
            icon="people-outline"
            label="Relations"
            value={wellbeingProfile.relationships}
            color="#8B5CF6"
          />
          <PermaCard 
            icon="bulb-outline"
            label="Sens"
            value={wellbeingProfile.meaning}
            color="#F59E0B"
          />
          <PermaCard 
            icon="trophy-outline"
            label="Accomplissement"
            value={wellbeingProfile.accomplishment}
            color="#EF4444"
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
  style={[
    styles.primaryButton,
    !shouldRetake && styles.primaryButtonDisabled
  ]}
  onPress={() => {
    if (!shouldRetake) {
      Alert.alert(
        '⏳ Test trop récent',
        `Pour des résultats significatifs, nous recommandons d'attendre ${14 - daysSince} jours.\n\nTon bien-être évolue sur 2 semaines. Re-tester trop tôt ne reflètera pas de vrais changements.`,
        [
          { text: 'Compris', style: 'cancel' },
          { 
            text: 'Quand même refaire', 
            onPress: () => navigation.navigate('StressDiagnostic'),
            style: 'destructive'
          }
        ]
      );
    } else {
      navigation.navigate('RetakeDiagnostic');
    }
  }}
>
  <Ionicons name="refresh" size={20} color="#FFFFFF" />
  <Text style={styles.primaryButtonText}>
    {shouldRetake ? 'Refaire le test (recommandé)' : `Refaire (dans ${14 - daysSince}j)`}
  </Text>
</TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('TechniquesLibrary')}
        >
          <Ionicons name="fitness-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.secondaryButtonText}>
            Voir techniques adaptées
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info scientifique */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={theme.colors.accent} />
        <Text style={styles.infoText}>
          <Text style={{ fontWeight: '700' }}>Pourquoi 14 jours ?</Text>
          {'\n'}Les recherches montrent que le bien-être mental fluctue sur 2 semaines. 
          Re-tester régulièrement permet des recommandations toujours adaptées.
        </Text>
      </View>

    </ScrollView>
  );
}

// Composant Item Breakdown
function BreakdownItem({ label, value }) {
  const getColor = (val) => {
    if (val === 'low') return '#10B981';
    if (val === 'moderate') return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.breakdownItem}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <View style={[styles.breakdownBadge, { backgroundColor: getColor(value) + '20' }]}>
        <Text style={[styles.breakdownValue, { color: getColor(value) }]}>
          {value === 'low' && 'Faible'}
          {value === 'moderate' && 'Modéré'}
          {value === 'high' && 'Élevé'}
        </Text>
      </View>
    </View>
  );
}

// Composant PERMA Card
function PermaCard({ icon, label, value, color }) {
  return (
    <View style={styles.permaCard}>
      <View style={[styles.permaIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.permaLabel}>{label}</Text>
      <Text style={styles.permaValue}>{value.toFixed(1)} / 5</Text>
      <View style={styles.permaBar}>
        <View 
          style={[
            styles.permaBarFill, 
            { width: `${(value / 5) * 100}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
}

// Helper
function calculateDaysSince(date) {
  if (!date) return 14;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingBottom: 120, // 🔥 FIX: Plus d'espace pour TabBar
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

  // Alerte
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },

  // Score Global
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
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  scoreInterpretation: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
  },
  scoreInterpretationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 16,
  },

  // Métrique Card
  metricCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    ...theme.psychology.shadows.soft,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginLeft: 12,
  },
  stressBar: {
    height: 12,
    backgroundColor: theme.colors.chipBg,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  stressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  metricDescription: {
    fontSize: 14,
    color: theme.colors.sub,
    lineHeight: 20,
  },

  // Breakdown
  breakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.chipBg,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: theme.colors.sub,
  },
  breakdownBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // PERMA Grid
  permaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  permaCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    ...theme.psychology.shadows.soft,
  },
  permaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  permaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.sub,
    marginBottom: 8,
  },
  permaValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 8,
  },
  permaBar: {
    height: 6,
    backgroundColor: theme.colors.chipBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  permaBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...theme.psychology.shadows.warm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Info
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.accent + '10',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.ink,
    lineHeight: 20,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.sub,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryCard: {
  backgroundColor: theme.colors.card,
  borderRadius: 16,
  padding: 20,
  ...theme.psychology.shadows.soft,
},
summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.chipBg,
},
summaryLabel: {
  fontSize: 14,
  color: theme.colors.sub,
},
summaryValue: {
  fontSize: 16,
  fontWeight: '700',
  color: theme.colors.ink,
},
summarySubtitle: {
  fontSize: 14,
  fontWeight: '700',
  color: theme.colors.ink,
  marginBottom: 8,
},
strengthItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
  gap: 8,
},
strengthText: {
  fontSize: 13,
  color: theme.colors.ink,
},
weaknessItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
  gap: 8,
},
weaknessText: {
  fontSize: 13,
  color: theme.colors.ink,
},
primaryButtonDisabled: {
  backgroundColor: theme.colors.sub,
  opacity: 0.6,
},
});