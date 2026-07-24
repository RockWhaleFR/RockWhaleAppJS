// screens/HomeScreen.js - Version Assistant Adaptatif Professionnel
import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import useUserStore from "../store/useUserStore";
import useHabitsStore from "../store/useHabitsStore";
import AdaptiveRecommendationEngine from "../services/recommendationEngine";
import theme from "../theme";

const logoSource = require("../assets/Logo.png");

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, resetOnboarding } = useUserStore();
  const { habits, loadHabits } = useHabitsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Calcul des recommandations adaptatives
  const adaptiveEngine = useMemo(() => {
    if (!user || !habits.length) return null;
    return new AdaptiveRecommendationEngine(user, habits, habits);
  }, [user, habits]);

  useEffect(() => {
    const loadData = async () => {
      await loadHabits();
      // Petit délai pour s'assurer que tout est chargé
      setTimeout(() => {
        setIsLoaded(true);
      }, 100);
    };
    loadData();
  }, []);

  // Mise à jour des recommandations
  useFocusEffect(
    React.useCallback(() => {
      if (adaptiveEngine) {
        const newRecommendations = adaptiveEngine.getAdaptiveRecommendations();
        setRecommendations(newRecommendations);
      }
    }, [adaptiveEngine])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadHabits();
    
    // Recalcul des recommandations
    if (adaptiveEngine) {
      const newRecommendations = adaptiveEngine.getAdaptiveRecommendations();
      setRecommendations(newRecommendations);
    }
    
    setRefreshing(false);
  }, [adaptiveEngine, loadHabits]);

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    const { resetHabitsToSeed } = useHabitsStore.getState();
    await resetHabitsToSeed();
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };

  const getContextualGreeting = () => {
    const hour = new Date().getHours();
    const userName = user.name || ""; // Si vous avez un nom d'utilisateur
    
    if (hour < 9) return `Bonjour${userName ? ` ${userName}` : ''} ! 🌅`;
    if (hour < 12) return `Bonne matinée${userName ? ` ${userName}` : ''} ! ☀️`;
    if (hour < 17) return `Bon après-midi${userName ? ` ${userName}` : ''} ! 💪`;
    if (hour < 20) return `Bonne soirée${userName ? ` ${userName}` : ''} ! 🌆`;
    return `Bonne nuit${userName ? ` ${userName}` : ''} ! 🌙`;
  };

  // Affichage d'un loader simple si pas encore chargé
  if (!isLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.colors.bg,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: theme.colors.ink, fontSize: 16 }}>Chargement...</Text>
      </View>
    );
  }

  const renderEmptyList = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="rocket-outline" size={48} color={theme.colors.primary} />
      <Text style={styles.emptyStateTitle}>Prêt à commencer ?</Text>
      <Text style={styles.emptyStateSubtitle}>
        Complétez l'onboarding pour recevoir des recommandations personnalisées.
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* HEADER AVEC SALUTATION ET SÉRIE */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>{getContextualGreeting()}</Text>
          <Text style={styles.headerSubtitle}>Prêt pour une micro-habitude ?</Text>
        </View>
        <View style={styles.streakIndicator}>
          <Ionicons name="flame" size={24} color={theme.colors.primary} />
          <Text style={styles.streakIndicatorText}>{user.streak}</Text>
        </View>
      </View>

      {/* CARTE D'ACTION PRINCIPALE (HERO) */}
      {recommendations?.primary ? (
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{recommendations.primary.title}</Text>
          <Text style={styles.heroReason}>{recommendations.primary.reason}</Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate("HabitDetail", { habit: recommendations.primary })}
          >
            <Ionicons name="play-circle-outline" size={24} color={theme.colors.primaryInk} />
            <Text style={styles.heroButtonText}>Commencer ({recommendations.primary.duration})</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Prêt à prendre soin de vous ?</Text>
          <Text style={styles.heroReason}>Choisissez une habitude ci-dessous pour démarrer votre journée.</Text>
        </View>
      )}

      {/* LISTE D'OUTILS RAPIDES */}
      <Text style={styles.sectionTitle}>Vos outils rapides</Text>
      {recommendations?.secondary?.length > 0 ? (
        <FlatList
          data={recommendations.secondary}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate("HabitDetail", { habit: item })}
              style={styles.secondaryCard}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.secondaryTitle}>{item.title}</Text>
                <Text style={styles.secondarySubtitle}>{item.category} • {item.duration}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color={theme.colors.sub} />
            </TouchableOpacity>
          )}
        />
      ) : (
        renderEmptyList()
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  contentContainer: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(6),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(3),
    paddingTop: theme.spacing(2),
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.sub,
    marginTop: 4,
  },
  streakIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.chipBg,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.5),
    borderRadius: theme.radius.l,
  },
  streakIndicatorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: theme.spacing(1),
  },
  heroCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.psychology.borderRadius.comfort,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    ...theme.psychology.shadows.warm,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primaryInk,
    lineHeight: 34,
  },
  heroReason: {
    fontSize: 16,
    color: `${theme.colors.primaryInk}cc`, // Plus lisible
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    lineHeight: 22,
  },
  heroButton: {
    backgroundColor: theme.colors.primaryInk,
    padding: theme.spacing(2),
    borderRadius: theme.psychology.borderRadius.gentle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 18,
    marginLeft: theme.spacing(1),
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  secondaryCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing(3),
    borderRadius: theme.psychology.borderRadius.gentle,
    marginBottom: theme.spacing(2),
    ...theme.psychology.shadows.soft,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: 4,
  },
  secondarySubtitle: {
    color: theme.colors.sub,
    fontSize: 14,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    backgroundColor: theme.colors.card,
    borderRadius: theme.psychology.borderRadius.comfort,
    ...theme.psychology.shadows.soft,
  },
  emptyStateTitle: {
    color: theme.colors.ink,
    textAlign: 'center',
    marginTop: theme.spacing(2),
    fontSize: 18,
    fontWeight: '700',
  },
  emptyStateSubtitle: {
    color: theme.colors.sub,
    textAlign: 'center',
    marginTop: theme.spacing(1),
    fontSize: 14,
  },
});