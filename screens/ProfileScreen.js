// screens/ProfileScreen.js - CORRIGÉ avec accès Settings
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../store/useUserStore';
import useHabitsStore from '../store/useHabitsStore';
import { getAchievementBadges } from '../utils/badges';
import ProgressChart from '../components/ProgressChart';
import theme from '../theme/enhancedTheme';

const StatCard = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Badge = ({ badge }) => (
  <View style={styles.badgeContainer}>
    <View style={[styles.badgeIconContainer, { backgroundColor: `${badge.color}20` }]}>
      {badge.emoji ? (
  <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
) : (
  <Image source={badge.image} style={styles.badgeImage} />
)}
    </View>
    <Text style={styles.badgeName}>{badge.name}</Text>
    <Text style={styles.badgeDescription}>{badge.description}</Text>
  </View>
);

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const { habits } = useHabitsStore();

  const stats = useMemo(() => {
    if (!user.history || user.history.length === 0 || !habits) return null;

    const habitCount = {};
    user.history.forEach(item => {
      const habitTitle = typeof item.habit === "object"
        ? item.habit.title
        : habits.find((h) => h.id === item.habit)?.title || "Inconnu";
      habitCount[habitTitle] = (habitCount[habitTitle] || 0) + 1;
    });

    const mostFrequentHabit = Object.entries(habitCount).sort((a, b) => b[1] - a[1])[0];

    return {
      totalCompletions: user.history.length,
      mostFrequentHabit: mostFrequentHabit ? mostFrequentHabit[0] : 'Aucune',
    };
  }, [user.history, habits]);

  const calculateImprovement = () => {
    if (!user.history || user.history.length < 7) return 0;
    
    const recent = user.history.slice(-7);
    const older = user.history.slice(-14, -7);
    
    if (older.length === 0) return 0;
    
    const recentPositive = recent.filter(h => ['Bien', 'Excellent'].includes(h.moodAfter)).length / recent.length;
    const olderPositive = older.filter(h => ['Bien', 'Excellent'].includes(h.moodAfter)).length / older.length;
    
    return Math.max(0, recentPositive - olderPositive);
  };

  const achievements = getAchievementBadges(user, habits);

  if (!habits || (habits.length === 0 && user.history?.length > 0)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.bg }}>
        <Text style={{ color: theme.colors.sub }}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header avec bouton Settings */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="person-circle-outline" size={32} color={theme.colors.primary} />
          <View style={{ marginLeft: theme.spacing(2) }}>
            <Text style={styles.headerTitle}>Mon Tableau de Bord</Text>
            <Text style={styles.headerSubtitle}>Votre progression en un coup d'œil</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* NOUVEAU : Graphique de progression */}
      <ProgressChart history={user.history} />

      {/* Statistiques clés */}
      <View style={styles.statsRow}>
        <StatCard icon="flame" value={user.streak || 0} label="Jours de série" color={theme.colors.primary} />
        <StatCard icon="checkmark-done" value={user.history?.length || 0} label="Habitudes validées" color={theme.colors.accent} />
        <StatCard icon="trending-up" value={`${Math.round(calculateImprovement() * 100)}%`} label="Progrès (7j)" color={'#4CAF50'} />
      </View>

      {/* Habitude favorite mise en avant */}
      <View style={styles.favoriteHabitCard}>
        <Ionicons name="star-outline" size={24} color={theme.wellness.energy} />
        <View style={{ marginLeft: theme.spacing(2), flex: 1 }}>
          <Text style={styles.favoriteHabitLabel}>Votre habitude favorite</Text>
          <Text style={styles.favoriteHabitValue}>{stats?.mostFrequentHabit || 'Pas encore définie'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🏆 Badges & Trophées</Text>
      {achievements.length > 0 ? (
        <View style={styles.badgesGrid}>
          {achievements.map((badge) => (
            <Badge key={badge.id} badge={badge} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={48} color={theme.colors.sub} />
          <Text style={styles.emptyStateText}>
            Continuez vos habitudes pour débloquer vos premiers badges !
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('HistoryTimeline')}
      >
        <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.historyButtonText}>Voir l'historique complet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  contentContainer: { padding: theme.spacing(2), paddingBottom: 100 }, // Ajouté espace pour tab bar
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3), 
    paddingTop: theme.spacing(2) 
  },
  settingsButton: {
    padding: theme.spacing(1),
    backgroundColor: theme.colors.chipBg,
    borderRadius: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: theme.colors.ink },
  headerSubtitle: { fontSize: 14, color: theme.colors.sub, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: theme.spacing(3) },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    marginHorizontal: theme.spacing(1),
    ...theme.psychology.shadows.soft,
  },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { color: theme.colors.sub, marginTop: 4, textAlign: 'center', fontSize: 12 },
  favoriteHabitCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    ...theme.psychology.shadows.soft,
  },
  favoriteHabitLabel: {
    color: theme.colors.sub,
    fontSize: 14,
    marginBottom: 2,
  },
  favoriteHabitValue: {
    color: theme.wellness.energy,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.ink, marginBottom: theme.spacing(2), marginTop: theme.spacing(3) },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.l,
    padding: theme.spacing(2),
    alignItems: 'center',
    width: '48%',
    marginBottom: theme.spacing(2),
    ...theme.psychology.shadows.soft,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  badgeIcon: { fontSize: 32 },
  badgeImage: {
    width: 40,
    height: 40,
  },
  badgeName: { fontWeight: '700', color: theme.colors.ink, fontSize: 16 },
  badgeDescription: { color: theme.colors.sub, textAlign: 'center', fontSize: 12, marginTop: 4 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.l,
    marginTop: theme.spacing(2),
  },
  emptyStateText: {
    color: theme.colors.sub,
    textAlign: 'center',
    marginTop: theme.spacing(2),
    fontSize: 16,
  },
  historyButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.colors.chipBg,
    padding: theme.spacing(2),
    borderRadius: theme.radius.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: theme.spacing(1),
  },
});