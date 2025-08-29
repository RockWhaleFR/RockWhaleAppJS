// screens/HomeScreen.js - Version Assistant Adaptatif Professionnel
import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, ScrollView, RefreshControl, Animated } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import useUserStore from "../store/useUserStore";
import useHabitsStore from "../store/useHabitsStore";
import { getTimeBasedGreeting, getStreakMessage } from "../utils/messages";
import { getBadgeForStreak, getAchievementBadges } from "../utils/badges";
import theme from "../theme";

const logoSource = require("../assets/Logo.png");

// Configuration des couleurs bien-être (même que l'onboarding)
const WELLNESS_COLORS = {
  energy: "#FFB84D",
  calm: "#7DD3FC", 
  focus: "#34D399",
  rest: "#A78BFA",
  balance: "#F472B6",
  grounding: "#94A3B8"
};

const PSYCHOLOGY = {
  borderRadius: {
    gentle: theme.radius.l,
    comfort: theme.radius.xl,
    energy: theme.radius.m
  },
  shadows: {
    soft: {
      shadowColor: theme.colors.ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4
    },
    warm: {
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6
    }
  }
};

// Moteur d'adaptation intelligent
class AdaptiveRecommendationEngine {
  constructor(user, habits, allHabits) {
    this.user = user;
    this.habits = habits;
    this.allHabits = allHabits;
    this.currentHour = new Date().getHours();
    this.currentDay = new Date().getDay();
    this.weather = this.getWeatherContext(); // À connecter à une API météo
  }

  // Analyse du contexte temporel
  getTimeContext() {
    const hour = this.currentHour;
    if (hour < 9) return 'morning';
    if (hour < 12) return 'late-morning';  
    if (hour < 14) return 'lunch';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  }

  // Simulation météo (à remplacer par vraie API)
  getWeatherContext() {
    const conditions = ['sunny', 'rainy', 'cloudy', 'cold', 'hot'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  // Calcul du niveau de stress estimé
  getEstimatedStressLevel() {
    const baseStress = this.user.preferences?.stressLevel || 'medium';
    const timeContext = this.getTimeContext();
    const workingHours = this.user.preferences?.workingHours;
    
    // Ajustement selon l'heure et les horaires de travail
    let stressMultiplier = 1;
    if (timeContext === 'morning' && workingHours?.start <= 9) stressMultiplier = 1.2;
    if (timeContext === 'afternoon' && this.currentDay >= 1 && this.currentDay <= 5) stressMultiplier = 1.3;
    if (timeContext === 'evening' && baseStress === 'high') stressMultiplier = 0.8;
    
    return { level: baseStress, intensity: stressMultiplier };
  }

  // Recommandations adaptatives principales
  getAdaptiveRecommendations() {
    const timeContext = this.getTimeContext();
    const stressContext = this.getEstimatedStressLevel();
    const completedToday = this.getCompletedHabitsToday();
    
    return {
      primary: this.getPrimaryRecommendation(timeContext, stressContext),
      secondary: this.getSecondaryRecommendations(timeContext, stressContext),
      contextual: this.getContextualInsights(timeContext, stressContext, completedToday)
    };
  }

  getPrimaryRecommendation(timeContext, stressContext) {
    const preferences = this.user.preferences || {};
    let recommendedHabits = [...this.habits];

    // Filtrage par moment optimal
    if (timeContext === 'morning' && preferences.productiveTime === 'morning') {
      recommendedHabits = recommendedHabits.filter(h => 
        h.category === 'Énergie' || h.tags?.includes('morning')
      );
    }
    
    if (timeContext === 'afternoon' && stressContext.intensity > 1.2) {
      recommendedHabits = recommendedHabits.filter(h => 
        h.category === 'Stress' || h.tags?.includes('break')
      );
    }

    if (timeContext === 'evening') {
      recommendedHabits = recommendedHabits.filter(h => 
        h.category === 'Sommeil' || h.tags?.includes('relaxation')
      );
    }

    // Priorisation par durée disponible
    const timeAvailable = preferences.timeAvailable || '5min';
    recommendedHabits = recommendedHabits.filter(h => {
      const duration = parseInt(h.duration) || 5;
      if (timeAvailable === '≤2min') return duration <= 2;
      if (timeAvailable === '5min') return duration <= 5;
      return duration <= 15;
    });

    // Sélection intelligente
    if (recommendedHabits.length === 0) recommendedHabits = this.habits;
    
    const selected = recommendedHabits[0];
    return selected ? {
      ...selected,
      reason: this.getRecommendationReason(timeContext, stressContext),
      confidence: this.calculateConfidence(selected, timeContext, stressContext)
    } : null;
  }

  getSecondaryRecommendations(timeContext, stressContext) {
    return this.habits.slice(1, 4).map(habit => ({
      ...habit,
      adaptiveScore: this.calculateAdaptiveScore(habit, timeContext, stressContext)
    })).sort((a, b) => b.adaptiveScore - a.adaptiveScore);
  }

  getContextualInsights(timeContext, stressContext, completedToday) {
    const insights = [];
    
    // Analyse de performance
    if (completedToday.length === 0 && this.currentHour > 10) {
      insights.push({
        type: 'motivation',
        icon: '🚀',
        title: 'Lancez votre journée',
        message: 'Une petite habitude maintenant peut transformer votre journée',
        color: WELLNESS_COLORS.energy
      });
    }

    // Analyse de stress
    if (stressContext.intensity > 1.2) {
      insights.push({
        type: 'stress',
        icon: '🧘',
        title: 'Moment de pause détecté',
        message: 'Votre rythme semble intense. Une pause vous ferait du bien.',
        color: WELLNESS_COLORS.calm
      });
    }

    // Analyse météo
    if (this.weather === 'rainy') {
      insights.push({
        type: 'weather',
        icon: '🌧️',
        title: 'Journée cocooning',
        message: 'Parfait pour des activités relaxantes à l\'intérieur',
        color: WELLNESS_COLORS.rest
      });
    }

    // Analyse de streak
    if (this.user.streak > 0 && this.user.streak % 7 === 0) {
      insights.push({
        type: 'achievement',
        icon: '🏆',
        title: `${this.user.streak} jours consécutifs !`,
        message: 'Vous construisez de solides habitudes. Continuez !',
        color: WELLNESS_COLORS.balance
      });
    }

    return insights.slice(0, 2); // Maximum 2 insights pour éviter la surcharge
  }

  calculateAdaptiveScore(habit, timeContext, stressContext) {
    let score = 50; // Score de base

    // Bonus temporel
    if (timeContext === 'morning' && habit.category === 'Énergie') score += 30;
    if (timeContext === 'afternoon' && habit.category === 'Focus') score += 25;
    if (timeContext === 'evening' && habit.category === 'Sommeil') score += 35;

    // Bonus stress
    if (stressContext.intensity > 1.2 && habit.category === 'Stress') score += 40;

    // Bonus préférences utilisateur
    const preferences = this.user.preferences || {};
    if (preferences.preferredBreak === 'meditation' && habit.tags?.includes('meditation')) score += 20;
    if (preferences.preferredBreak === 'movement' && habit.tags?.includes('movement')) score += 20;

    return score;
  }

  calculateConfidence(habit, timeContext, stressContext) {
    // Calcul de confiance basé sur les données utilisateur
    let confidence = 60;
    
    if (habit.category === this.user.objectives?.[0]) confidence += 25;
    if (this.isOptimalTime(habit, timeContext)) confidence += 15;
    
    return Math.min(confidence, 95);
  }

  getRecommendationReason(timeContext, stressContext) {
    const reasons = {
      'morning': 'Idéal pour démarrer votre journée avec énergie',
      'afternoon': stressContext.intensity > 1.2 ? 'Parfait pour une pause régénérante' : 'Boost pour votre après-midi',
      'evening': 'Excellent pour terminer la journée en douceur',
      'night': 'Préparez-vous pour une nuit réparatrice'
    };
    
    return reasons[timeContext] || 'Adapté à votre profil et objectifs';
  }

  isOptimalTime(habit, timeContext) {
    // Logique pour déterminer si c'est le moment optimal pour cette habitude
    const optimalTimes = {
      'Énergie': ['morning', 'late-morning'],
      'Focus': ['morning', 'afternoon'], 
      'Stress': ['afternoon', 'evening'],
      'Sommeil': ['evening', 'night']
    };
    
    return optimalTimes[habit.category]?.includes(timeContext) || false;
  }

  getCompletedHabitsToday() {
    // À implémenter : retourner les habitudes complétées aujourd'hui
    return []; // Placeholder
  }
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, resetOnboarding } = useUserStore();
  const { habits, loadHabits } = useHabitsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentBadge = getBadgeForStreak(user.streak);
  const achievements = getAchievementBadges(user);

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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      contentContainerStyle={{
        padding: theme.spacing(2),
        paddingBottom: theme.spacing(4),
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* HEADER PREMIUM */}
      <View style={{ 
        alignItems: "center", 
        marginBottom: theme.spacing(3),
        paddingTop: theme.spacing(2)
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: PSYCHOLOGY.borderRadius.comfort,
          backgroundColor: theme.colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing(2),
          ...PSYCHOLOGY.shadows.warm
        }}>
          <Image source={logoSource} style={{ width: 50, height: 50 }} resizeMode="contain" />
        </View>
        <Text style={{ 
          color: theme.colors.sub,
          fontSize: 16,
          fontWeight: '500'
        }}>Rockwhale • Assistant Bien-être</Text>
      </View>

      {/* SALUTATION CONTEXTUELLE */}
      <View style={{
        backgroundColor: theme.colors.card,
        padding: theme.spacing(3),
        borderRadius: PSYCHOLOGY.borderRadius.comfort,
        marginBottom: theme.spacing(3),
        ...PSYCHOLOGY.shadows.soft,
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: "700", 
          color: theme.colors.ink, 
          marginBottom: theme.spacing(1)
        }}>
          {getContextualGreeting()}
        </Text>
        <Text style={{ 
          color: theme.colors.sub,
          lineHeight: 22,
          fontSize: 16
        }}>
          {getStreakMessage(user.streak)}
        </Text>
      </View>

      {/* INSIGHTS CONTEXTUELS */}
      {recommendations?.contextual?.length > 0 && showInsights && (
        <View style={{ marginBottom: theme.spacing(3) }}>
          {recommendations.contextual.map((insight, index) => (
            <View key={index} style={{
              backgroundColor: `${insight.color}15`,
              padding: theme.spacing(3),
              borderRadius: PSYCHOLOGY.borderRadius.gentle,
              marginBottom: theme.spacing(2),
              borderLeftWidth: 4,
              borderLeftColor: insight.color,
              ...PSYCHOLOGY.shadows.soft
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(1) }}>
                <Text style={{ fontSize: 24, marginRight: theme.spacing(2) }}>
                  {insight.icon}
                </Text>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '700', 
                  color: theme.colors.ink,
                  flex: 1
                }}>
                  {insight.title}
                </Text>
                <TouchableOpacity onPress={() => setShowInsights(false)}>
                  <Ionicons name="close-circle" size={24} color={theme.colors.sub} />
                </TouchableOpacity>
              </View>
              <Text style={{ 
                color: theme.colors.ink,
                fontSize: 15,
                lineHeight: 20
              }}>
                {insight.message}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* RECOMMANDATION PRINCIPALE ADAPTATIVE */}
      {recommendations?.primary && (
        <View style={{
          backgroundColor: theme.colors.card,
          padding: theme.spacing(4),
          borderRadius: PSYCHOLOGY.borderRadius.comfort,
          marginBottom: theme.spacing(3),
          ...PSYCHOLOGY.shadows.warm,
          borderWidth: 2,
          borderColor: theme.colors.primary
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(2) }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: theme.spacing(2)
            }}>
              <Ionicons name="star" size={20} color={theme.colors.primaryInk} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: theme.colors.ink,
                marginBottom: 2
              }}>
                Recommandé pour vous
              </Text>
              <Text style={{ 
                color: theme.colors.primary,
                fontSize: 14,
                fontWeight: '600'
              }}>
                {recommendations.primary.confidence}% de correspondance
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("HabitDetail", { habit: recommendations.primary })}
            style={{
              backgroundColor: `${theme.colors.primary}10`,
              padding: theme.spacing(3),
              borderRadius: PSYCHOLOGY.borderRadius.gentle,
              marginBottom: theme.spacing(2)
            }}
          >
            <Text style={{ 
              fontWeight: '700', 
              color: theme.colors.ink,
              fontSize: 18,
              marginBottom: theme.spacing(1)
            }}>
              {recommendations.primary.title}
            </Text>
            <Text style={{ 
              color: theme.colors.sub,
              fontSize: 14,
              marginBottom: theme.spacing(1)
            }}>
              {recommendations.primary.category} • {recommendations.primary.duration}
            </Text>
            <Text style={{ 
              color: theme.colors.primary,
              fontSize: 14,
              fontWeight: '600'
            }}>
              {recommendations.primary.reason}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("HabitDetail", { habit: recommendations.primary })}
            style={{
              backgroundColor: theme.colors.primary,
              padding: theme.spacing(2),
              borderRadius: PSYCHOLOGY.borderRadius.gentle,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="play" size={20} color={theme.colors.primaryInk} style={{ marginRight: theme.spacing(1) }} />
            <Text style={{ 
              color: theme.colors.primaryInk,
              fontWeight: '700',
              fontSize: 16
            }}>
              Commencer maintenant
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* AUTRES HABITUDES ADAPTÉES */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing(2) }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: theme.colors.ink }}>
          Autres suggestions
        </Text>
        <Text style={{ color: theme.colors.sub, fontSize: 14 }}>
          Adaptées à votre profil
        </Text>
      </View>

      {recommendations?.secondary?.length > 0 ? (
        <FlatList
          data={recommendations.secondary}
          scrollEnabled={false}
          keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate("HabitDetail", { habit: item })}
              activeOpacity={0.9}
              style={{
                backgroundColor: theme.colors.card,
                padding: theme.spacing(3),
                borderRadius: PSYCHOLOGY.borderRadius.gentle,
                marginBottom: theme.spacing(2),
                ...PSYCHOLOGY.shadows.soft,
                borderLeftWidth: 4,
                borderLeftColor: item.adaptiveScore > 80 ? WELLNESS_COLORS.energy : 
                                item.adaptiveScore > 60 ? WELLNESS_COLORS.focus : WELLNESS_COLORS.grounding,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: "600", 
                    color: theme.colors.ink,
                    marginBottom: 4
                  }}>
                    {item.title ?? "Habitude sans nom"}
                  </Text>
                  <Text style={{ 
                    color: theme.colors.sub, 
                    fontSize: 14,
                    marginBottom: 4
                  }}>
                    {item.category} • {item.duration}
                  </Text>
                  {item.adaptiveScore > 70 && (
                    <Text style={{ 
                      color: theme.colors.primary, 
                      fontSize: 12,
                      fontWeight: '600'
                    }}>
                      ✨ Très adapté à votre situation
                    </Text>
                  )}
                </View>
                <View style={{
                  backgroundColor: item.adaptiveScore > 80 ? `${WELLNESS_COLORS.energy}20` : `${theme.colors.sub}10`,
                  paddingHorizontal: theme.spacing(1),
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: item.adaptiveScore > 80 ? WELLNESS_COLORS.energy : theme.colors.sub,
                    fontSize: 12,
                    fontWeight: '600'
                  }}>
                    {Math.round(item.adaptiveScore)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : habits.length > 0 ? (
        <FlatList
          data={habits}
          scrollEnabled={false}
          keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate("HabitDetail", { habit: item })}
              activeOpacity={0.9}
              style={{
                backgroundColor: theme.colors.card,
                padding: theme.spacing(3),
                borderRadius: PSYCHOLOGY.borderRadius.gentle,
                marginBottom: theme.spacing(2),
                ...PSYCHOLOGY.shadows.soft,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary,
              }}
            >
              <Text style={{ 
                fontSize: 18, 
                fontWeight: "600", 
                color: theme.colors.ink,
                marginBottom: 4
              }}>
                {item.title ?? "Habitude sans nom"}
              </Text>
              <Text style={{ 
                color: theme.colors.sub, 
                fontSize: 14
              }}>
                {item.category} • {item.duration}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={{ 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: theme.spacing(4),
          backgroundColor: theme.colors.card,
          borderRadius: PSYCHOLOGY.borderRadius.comfort,
          marginBottom: theme.spacing(3),
          ...PSYCHOLOGY.shadows.soft
        }}>
          <Ionicons name="rocket" size={48} color={theme.colors.primary} />
          <Text style={{ 
            color: theme.colors.ink, 
            textAlign: "center",
            marginTop: theme.spacing(2),
            fontSize: 18,
            fontWeight: '700'
          }}>
            Prêt à commencer ?
          </Text>
          <Text style={{ 
            color: theme.colors.sub, 
            textAlign: "center",
            marginTop: theme.spacing(1),
            fontSize: 14
          }}>
            Complétez l'onboarding pour recevoir des recommandations personnalisées
          </Text>
        </View>
      )}

      {/* STREAK ET MOTIVATION */}
      <View style={{
        backgroundColor: theme.colors.card,
        padding: theme.spacing(3),
        borderRadius: PSYCHOLOGY.borderRadius.comfort,
        alignItems: "center",
        marginBottom: theme.spacing(3),
        ...PSYCHOLOGY.shadows.soft,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(1) }}>
          <Ionicons name="flame" size={28} color={theme.colors.primary} />
          <Text style={{ 
            color: theme.colors.ink, 
            fontWeight: "700",
            fontSize: 20,
            marginLeft: theme.spacing(1)
          }}>
            {user.streak ?? 0} jours consécutifs
          </Text>
        </View>
        
        <Text style={{ 
          color: theme.colors.sub, 
          textAlign: 'center',
          fontSize: 15,
          lineHeight: 20
        }}>
          {user.streak > 0 
            ? `Fantastique ! Vous construisez des habitudes durables. ${7 - (user.streak % 7)} jours pour le prochain niveau !`
            : "Complétez une habitude aujourd'hui pour commencer votre série !"
          }
        </Text>
      </View>

      {/* BOUTON PERSONNALISATION */}
      <TouchableOpacity
        onPress={handleResetOnboarding}
        style={{
          backgroundColor: theme.colors.card,
          padding: theme.spacing(3),
          borderRadius: PSYCHOLOGY.borderRadius.gentle,
          alignItems: "center",
          marginBottom: theme.spacing(2),
          borderWidth: 2,
          borderColor: theme.colors.primary,
          flexDirection: 'row',
          justifyContent: 'center',
          ...PSYCHOLOGY.shadows.soft
        }}
      >
        <Ionicons name="settings" size={20} color={theme.colors.primary} style={{ marginRight: theme.spacing(1) }} />
        <Text style={{ 
          color: theme.colors.primary, 
          fontWeight: "700",
          fontSize: 16
        }}>
          Personnaliser mon expérience
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}