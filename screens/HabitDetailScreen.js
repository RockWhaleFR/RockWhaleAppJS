// screens/HabitDetailScreen.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import useUserStore from "../store/useUserStore";
import { buildPraise } from "../utils/messages";
import { speak } from "../utils/tts";
import { launchConfetti } from "../utils/confetti";
import { scheduleStreakNotification } from "../services/notifications";
import { getMoodBasedSuggestion } from "../utils/suggestions";
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
  const [showInstructions, setShowInstructions] = useState(false);

  const showCelebration = () => {
    // Lancement des confettis
    launchConfetti();
    
    // Vibration de célébration
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Message vocal de félicitations
    const celebrationMessages = [
      "Félicitations pour cette habitude accomplie !",
      "Bravo ! Tu progresses chaque jour.",
      "Excellent travail ! Ton engagement porte ses fruits."
    ];
    
    const randomMessage = celebrationMessages[
      Math.floor(Math.random() * celebrationMessages.length)
    ];
    
    speak(randomMessage);
  };

  const handleValidate = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const msg = buildPraise(habit.title);
    setPraise(msg);
    
    // Incrémenter le streak
    await incrementStreak();
    
    setValidated(true);
    
    // Ajouter la célébration
    showCelebration();
    
    // Planifier une notification de félicitations pour le nouveau streak
    const newStreak = useUserStore.getState().user.streak;
    await scheduleStreakNotification(newStreak);
    
    speak(msg);
    
    Alert.alert(
      "Ton ressenti 💡", 
      "Comment tu te sens après cette habitude ?", 
      [
        { text: "😃 Bien", onPress: () => saveHistory("Bien") },
        { text: "😐 Neutre", onPress: () => saveHistory("Neutre") },
        { text: "😞 Pas top", onPress: () => saveHistory("Pas top") },
      ],
      { cancelable: false }
    );
  };

  const saveHistory = async (mood) => {
    const historyEntry = {
      habit,
      date: new Date().toISOString(),
      mood,
    };
    
    await addHistory(historyEntry);
    
    // Suggérer une nouvelle habitude basée sur l'humeur
    const nextSuggestion = getMoodBasedSuggestion(mood);
    
    Alert.alert(
      "Bien noté ! 💫",
      `Votre humeur (${mood}) a été enregistrée. \n\nVoulez-vous essayer une autre habitude adaptée à votre état ?`,
      [
        { 
          text: "Plus tard", 
          style: "cancel",
          onPress: () => navigation.goBack()
        },
        {
          text: "Oui, pourquoi pas !",
          onPress: () => navigation.replace('HabitDetail', { habit: nextSuggestion })
        }
      ]
    );
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
      }}
      contentContainerStyle={{
        padding: theme.spacing(2),
      }}
    >
      {/* HEADER avec logo */}
      <View style={{ 
        alignItems: "center", 
        marginBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
      }}>
        <Image
          source={logoSource}
          resizeMode="contain"
          style={{ width: 80, height: 80 }}
        />
        <Text style={{ 
          marginTop: theme.spacing(1), 
          color: theme.colors.sub,
          fontSize: 16,
          fontWeight: '500'
        }}>
          Rockwhale
        </Text>
      </View>

      {/* Carte principale */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          padding: theme.spacing(3),
          borderRadius: theme.radius.xl,
          marginBottom: theme.spacing(3),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: theme.colors.ink,
            marginBottom: 12,
          }}
        >
          {habit.title}
        </Text>

        {/* Fait scientifique */}
        <View style={{
          backgroundColor: 'rgba(255, 107, 53, 0.08)',
          padding: theme.spacing(2),
          borderRadius: theme.radius.m,
          marginBottom: 16,
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.primary,
        }}>
          <Text style={{ 
            color: theme.colors.ink, 
            marginBottom: 8, 
            fontStyle: "italic",
            lineHeight: 22
          }}>
            📊 {habit.scientificFact}
          </Text>
        </View>

        <Text style={{ 
          color: theme.colors.sub, 
          marginBottom: 24,
          lineHeight: 22
        }}>
          Un petit pas aujourd'hui, un grand demain 🚀
        </Text>

        {/* Bouton instructions */}
        {!validated && (
          <TouchableOpacity
            onPress={() => setShowInstructions(true)}
            style={{
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              padding: theme.spacing(2),
              borderRadius: theme.radius.l,
              alignItems: 'center',
              marginBottom: theme.spacing(2),
              borderWidth: 1,
              borderColor: theme.colors.primary
            }}
          >
            <Text style={{ 
              color: theme.colors.primary, 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              📋 Voir les instructions détaillées
            </Text>
          </TouchableOpacity>
        )}

        {!validated ? (
          <TouchableOpacity
            onPress={handleValidate}
            activeOpacity={0.9}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 16,
              borderRadius: theme.radius.xl,
              alignItems: "center",
              shadowColor: "#FF6B35",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text
              style={{
                color: theme.colors.primaryInk,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              ✅ Valider maintenant
            </Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text
              style={{
                textAlign: "center",
                color: theme.colors.primary,
                fontWeight: "600",
                fontSize: 16,
                marginBottom: theme.spacing(3),
                lineHeight: 24,
              }}
            >
              {praise}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.9}
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 14,
                borderRadius: theme.radius.l,
                alignItems: "center",
              }}
            >
              <Text style={{ 
                color: theme.colors.primaryInk, 
                fontWeight: "600",
                fontSize: 16
              }}>
                Retour à l'accueil
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bloc streak */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          padding: theme.spacing(2),
          borderRadius: theme.radius.l,
          alignItems: "center",
          marginBottom: theme.spacing(2),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <Text style={{ 
          color: theme.colors.ink, 
          fontWeight: "700",
          fontSize: 16
        }}>
          🔥 Série actuelle : {user.streak} jours
        </Text>
      </View>

      {/* Modal instructions */}
      <HabitInstructionsModal 
        habit={habit}
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </ScrollView>
  );
}