// screens/HabitDetailScreen.js - VERSION PROFESSIONNELLE
import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, Image, ScrollView, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from "../store/useUserStore";
import { buildPraise } from "../utils/messages";
import { getMoodBasedSuggestion } from "../utils/suggestions";
import FeedbackEmoji from "../components/FeedbackEmoji";
import HabitInstructionsModal from "../components/HabitInstructionsModal";
import theme from "../theme";

const logoSource = require("../assets/Logo.png");

export default function HabitDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { habit } = route.params;
  const { user, incrementStreak, addHistory } = useUserStore();
  
  const [validated, setValidated] = useState(false);
  const [praise, setPraise] = useState("");
  const [moodSelectionDone, setMoodSelectionDone] = useState(false);
  const [showBeforeMoodPicker, setShowBeforeMoodPicker] = useState(false);
  const [moodBefore, setMoodBefore] = useState(null);
  const [showScientificDetails, setShowScientificDetails] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const confettiRef = useRef(null);

  const showCelebration = () => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }
    if (user.preferences.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleValidate = async () => {
    const msg = buildPraise(user.name);
    setPraise(msg);
    
    const oldStreak = user.streak;
    await incrementStreak();
    
    setValidated(true);
    showCelebration();
    
    const newStreak = useUserStore.getState().user.streak;
    if (newStreak > oldStreak) {
      // Notification désactivée pour Expo Go
    }
  };

  const saveHistory = async (moodAfter) => {
    setMoodSelectionDone(true);

    const historyEntry = {
      habit: habit.id,
      date: new Date().toISOString(),
      moodBefore: moodBefore,
      moodAfter: moodAfter,
    };
    
    await addHistory(historyEntry);
    
    const updatedUser = useUserStore.getState().user;
    const today = new Date().toDateString();
    const todayUsage = updatedUser.history?.filter(entry => 
      new Date(entry.date).toDateString() === today
    ).length || 0;

    if (!updatedUser.isPremium && todayUsage >= 3) {
      Alert.alert(
        "Limite quotidienne atteinte",
        "Vous avez utilisé vos 3 techniques gratuites pour aujourd'hui. Passez à Premium pour un accès illimité !",
        [
          { 
            text: "Retour", 
            style: "cancel",
            onPress: () => navigation.goBack()
          },
          {
            text: "Découvrir Premium",
            onPress: () => navigation.navigate('PremiumPaywall', { triggerSource: 'technique_limit' })
          }
        ]
      );
    } else {
      const nextSuggestion = getMoodBasedSuggestion(moodAfter);
      Alert.alert(
        "Bien noté ! 💫",
        `Votre humeur (${moodAfter}) a été enregistrée. \n\nVoulez-vous essayer une autre habitude adaptée à votre état ?`,
        [
          { text: "Plus tard", style: "cancel", onPress: () => navigation.goBack() },
          { text: "Oui, pourquoi pas !", onPress: () => navigation.replace('HabitDetail', { habit: nextSuggestion }) }
        ]
      );
    }
  };

  const handleEmojiSelect = (emoji) => {
    const moodMap = {
      "😞": "Pas top",
      "😐": "Neutre",
      "😊": "Bien",
      "🤩": "Excellent",
    };
    const moodAfter = moodMap[emoji] || "Neutre";
    saveHistory(moodAfter);
  };

  const handleBeforeMoodSelect = (emoji) => {
    const moodMap = { "😞": "Pas top", "😐": "Neutre", "😊": "Bien", "🤩": "Excellent" };
    const mood = moodMap[emoji] || "Neutre";
    setMoodBefore(mood);
    setShowBeforeMoodPicker(false);
    startExercise();
  };

const startExercise = () => {
  if (habit.timer) {
    // Techniques avec timer (respiration)
    navigation.navigate('Activity', { 
      habit: habit,
      onComplete: handleValidate,
    });
  } else {
    // ✅ TOUTES les autres techniques → Page guidée
    navigation.navigate('GuidedTechnique', {
      habit: habit,
      onComplete: handleValidate,
    });
  }
};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {validated && <ConfettiCannon count={200} origin={{x: -10, y: 0}} autoStart={false} ref={confettiRef} fadeOut />}

      {/* Mood picker avant exercice */}
      {showBeforeMoodPicker && (
        <View style={styles.moodPickerCard}>
          <Text style={styles.moodPickerTitle}>
            Comment vous sentez-vous, juste maintenant ?
          </Text>
          <FeedbackEmoji onSelect={handleBeforeMoodSelect} />
          <TouchableOpacity onPress={() => setShowBeforeMoodPicker(false)} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header avec logo */}
      <View style={styles.logoContainer}>
        <Image source={logoSource} resizeMode="contain" style={styles.logo} />
        <Text style={styles.logoText}>Rockwhale</Text>
      </View>

      {/* Carte principale */}
      <View style={styles.mainCard}>
        <Text style={styles.habitTitle}>{habit.title}</Text>
        <Text style={styles.habitCategory}>{habit.category || 'Technique de bien-être'}</Text>

        {/* Badge de validation scientifique */}
        <View style={styles.validationBadge}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
          <Text style={styles.validationText}>Validé scientifiquement</Text>
        </View>

        {/* Fait scientifique principal */}
        <View style={styles.factContainer}>
          <Ionicons name="analytics-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.factText}>{habit.scientificFact}</Text>
        </View>

        {/* Bouton "Pourquoi ça marche ?" */}
        <TouchableOpacity 
          style={styles.scientificToggle}
          onPress={() => setShowScientificDetails(!showScientificDetails)}
        >
          <View style={styles.toggleContent}>
            <Ionicons name="flask" size={20} color={theme.colors.accent} />
            <Text style={styles.toggleText}>
              {showScientificDetails ? 'Masquer les détails scientifiques' : 'Pourquoi ça marche ?'}
            </Text>
          </View>
          <Ionicons 
            name={showScientificDetails ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.colors.accent} 
          />
        </TouchableOpacity>

        {/* Section scientifique dépliable */}
        {showScientificDetails && habit.scientificDetails && (
          <View style={styles.scientificSection}>
            <Text style={styles.mechanismTitle}>Mécanisme d'action</Text>
            <Text style={styles.mechanismText}>
              {habit.scientificDetails.mechanism || 
               "Cette technique agit sur le système nerveux autonome en activant le système parasympathique (repos et digestion) tout en réduisant l'activité du système sympathique (combat ou fuite)."}
            </Text>

            {/* Études cliniques */}
            {habit.scientificDetails?.studies && habit.scientificDetails.studies.length > 0 && (
              <View style={styles.studiesContainer}>
                <Text style={styles.studiesTitle}>Études cliniques</Text>
                {habit.scientificDetails.studies.map((study, index) => (
                  <View key={index} style={styles.studyCard}>
                    <View style={styles.studyHeader}>
                      <Ionicons name="document-text-outline" size={16} color={theme.colors.accent} />
                      <Text style={styles.studyAuthors}>{study.authors}</Text>
                    </View>
                    <Text style={styles.studyJournal}>{study.journal} ({study.year})</Text>
                    <Text style={styles.studyFindings} numberOfLines={3} ellipsizeMode="tail">
                      📊 {study.findings}
                    </Text>
                    {study.doi && (
                      <Text style={styles.studyDoi}>DOI: {study.doi}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Méta-analyse ou données agrégées */}
            {habit.scientificDetails?.efficacyData && (
              <View style={styles.efficacyContainer}>
                <Text style={styles.efficacyTitle}>Efficacité mesurée</Text>
                <View style={styles.efficacyStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{habit.scientificDetails.efficacyData.rate}%</Text>
                    <Text style={styles.statLabel}>Taux de réussite</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{habit.scientificDetails.efficacyData.sampleSize}</Text>
                    <Text style={styles.statLabel}>Participants étudiés</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{habit.scientificDetails.efficacyData.timeframe}</Text>
                    <Text style={styles.statLabel}>Durée moyenne</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Recommandations professionnelles */}
            {habit.scientificDetails?.recommendations && (
              <View style={styles.recommendationsBox}>
                <Ionicons name="medical" size={18} color={theme.colors.info} />
                <Text style={styles.recommendationsText}>
                  {habit.scientificDetails.recommendations}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Informations pratiques */}
        <View style={styles.practicalInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.infoText}>{habit.duration || '5 minutes'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="speedometer-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.infoText}>Efficacité : {habit.efficacyRate || 85}%</Text>
          </View>
          {habit.difficulty && (
            <View style={styles.infoItem}>
              <Ionicons name="fitness-outline" size={20} color={theme.colors.accent} />
              <Text style={styles.infoText}>Niveau : {habit.difficulty}</Text>
            </View>
          )}
        </View>

        {/* Bouton principal */}
        {!validated ? (
          <TouchableOpacity
            onPress={() => {
              if (user.preferences.trackMood) {
                setShowBeforeMoodPicker(true);
              } else {
                startExercise();
              }
            }}
            activeOpacity={0.9}
            style={styles.startButton}
          >
            <Ionicons name="play-circle" size={24} color={theme.colors.primaryInk} />
            <Text style={styles.startButtonText}>Commencer l'exercice</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.validatedContainer}>
            <Text style={styles.praiseText}>{praise}</Text>
            
            {!moodSelectionDone ? (
              <>
                <Text style={styles.moodQuestion}>Comment te sens-tu maintenant ?</Text>
                <FeedbackEmoji onSelect={handleEmojiSelect} />
              </>
            ) : (
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.returnButton}
              >
                <Text style={styles.returnButtonText}>Retour à l'accueil</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Carte de série */}
      <View style={styles.streakCard}>
        <Ionicons name="flame" size={24} color={theme.colors.primary} />
        <Text style={styles.streakText}>Série actuelle : {user.streak} jours</Text>
      </View>
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
    paddingBottom: 100,
  },
  moodPickerCard: {
    padding: theme.spacing(3),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing(3),
    alignItems: 'center',
    ...theme.psychology.shadows.soft,
  },
  moodPickerTitle: {
    textAlign: 'center',
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing(2),
  },
  cancelButton: {
    marginTop: theme.spacing(2),
  },
  cancelButtonText: {
    color: theme.colors.sub,
    fontSize: 14,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoText: {
    marginTop: theme.spacing(1),
    color: theme.colors.sub,
    fontSize: 16,
    fontWeight: '500',
  },
  mainCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing(3),
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing(3),
    ...theme.psychology.shadows.soft,
  },
  habitTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.ink,
    marginBottom: theme.spacing(1),
  },
  habitCategory: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
    marginBottom: theme.spacing(2),
  },
  validationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.5),
    borderRadius: theme.radius.m,
    marginBottom: theme.spacing(2),
  },
  validationText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
    marginLeft: theme.spacing(0.5),
  },
  factContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
    padding: theme.spacing(2),
    borderRadius: theme.radius.m,
    marginBottom: theme.spacing(2),
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  factText: {
    flex: 1,
    color: theme.colors.ink,
    marginLeft: theme.spacing(1.5),
    fontStyle: "italic",
    lineHeight: 22,
    fontSize: 14,
  },
  scientificToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: theme.spacing(2),
    borderRadius: theme.radius.m,
    marginBottom: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    color: theme.colors.accent,
    fontWeight: '600',
    marginLeft: theme.spacing(1),
    fontSize: 14,
  },
  scientificSection: {
    backgroundColor: theme.colors.chipBg,
    padding: theme.spacing(2),
    borderRadius: theme.radius.m,
    marginBottom: theme.spacing(2),
  },
  mechanismTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: theme.spacing(1),
  },
  mechanismText: {
    fontSize: 14,
    color: theme.colors.sub,
    lineHeight: 22,
    marginBottom: theme.spacing(2),
  },
  studiesContainer: {
    marginTop: theme.spacing(2),
  },
  studiesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: theme.spacing(1.5),
  },
  studyCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing(2),
    borderRadius: theme.radius.m,
    marginBottom: theme.spacing(1.5),
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  studyAuthors: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    marginLeft: theme.spacing(0.5),
  },
  studyJournal: {
    fontSize: 12,
    fontStyle: 'italic',
    color: theme.colors.sub,
    marginBottom: theme.spacing(1),
  },
  studyFindings: {
    fontSize: 13,
    color: theme.colors.ink,
    lineHeight: 20,
    marginBottom: theme.spacing(0.5),
    flexWrap: 'wrap', // ✅ Force le retour à la ligne
  },
  studyDoi: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  efficacyContainer: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.colors.card,
    padding: theme.spacing(2),
    borderRadius: theme.radius.m,
  },
  efficacyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: theme.spacing(1.5),
    textAlign: 'center',
  },
  efficacyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.sub,
    textAlign: 'center',
    marginTop: theme.spacing(0.5),
  },
  recommendationsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: theme.spacing(2),
    borderRadius: theme.radius.m,
    marginTop: theme.spacing(2),
    alignItems: 'flex-start',
  },
  recommendationsText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.ink,
    lineHeight: 20,
    marginLeft: theme.spacing(1),
  },
  practicalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.chipBorder,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.sub,
    marginTop: theme.spacing(0.5),
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(2.5),
    borderRadius: theme.radius.xl,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    ...theme.psychology.shadows.warm,
  },
  startButtonText: {
    color: theme.colors.primaryInk,
    fontWeight: "700",
    fontSize: 18,
    marginLeft: theme.spacing(1),
  },
  validatedContainer: {
    alignItems: 'center',
  },
  praiseText: {
    textAlign: "center",
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 18,
    marginBottom: theme.spacing(3),
    lineHeight: 26,
  },
  moodQuestion: {
    textAlign: 'center',
    color: theme.colors.sub,
    fontSize: 16,
    marginBottom: theme.spacing(1),
  },
  returnButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.radius.l,
  },
  returnButtonText: {
    color: theme.colors.primaryInk,
    fontWeight: "600",
    fontSize: 16,
  },
  streakCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing(2),
    borderRadius: theme.radius.l,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    ...theme.psychology.shadows.soft,
  },
  streakText: {
    color: theme.colors.ink,
    fontWeight: "700",
    fontSize: 16,
    marginLeft: theme.spacing(1),
  },
});