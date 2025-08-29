// screens/HistoryScreen.js
import React, { useState, useMemo } from "react";
import { View, Text, SectionList, Image, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import useUserStore from "../store/useUserStore";
import { getStreakMessage } from "../utils/messages";
import theme from "../theme";

const logoSource = require("../assets/Logo.png");

const scientificFacts = {
  "Boire un grand verre d'eau": "L'hydratation améliore la vigilance et les fonctions cognitives à court terme.",
  "30 s de jumping jacks": "De brèves bouffées d'activité élèvent la fréquence cardiaque et l'énergie perçue.",
  "10 squats lents": "Activer les grands groupes musculaires réveille le système neuromoteur.",
  "Respiration énergisante 3-2 (x6)": "Les respirations rythmées modulent le tonus sympathique et la vigilance.",
  "Respiration 4-2-6 (1 min)": "Allonger l'expiration stimule le nerf vague et apaise le stress.",
  "3 respirations profondes": "Une micro-pause respiratoire réduit la charge mentale et clarifie l'attention.",
  "Écrire 1 gratitude": "La reconnaissance augmente les affects positifs et l'optimisme.",
  "Sourire 30 s": "Le feedback facial peut influencer l'humeur via les voies neuro-viscérales.",
  "Relâcher les épaules (60 s)": "Relâcher les trapèzes réduit la tension somatique liée au stress.",
  "Mini scan corporel (60 s)": "Ramener l'attention au corps diminue la rumination et ré-ancre le présent.",
  "Regard loin 20-20-20": "Détendre l'accommodation visuelle baisse la fatigue et la tension oculaire.",
  "Étirement de nuque (60 s)": "Micro-étirements réduisent la tension musculaire et améliorent le confort.",
  "Respiration 4-7-8 (x2)": "Ralentir la respiration facilite la transition vers un état parasympathique.",
  "Poser le téléphone loin": "Réduire l'exposition tardive aux écrans améliore l'endormissement.",
  "Préparer le réveil (1 geste)": "Des repères clairs stabilisent l'horloge circadienne.",
  "Noter une pensée à déposer": "Externaliser les pensées diminue l'activation cognitive pré-sommeil.",
};

export default function HistoryScreen() {
  const { user } = useUserStore();
  const [viewMode, setViewMode] = useState('timeline');

  const groupedHistory = useMemo(() => {
    const grouped = user.history.reduce((acc, item) => {
      const date = new Date(item.date);
      const dateStr = date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      
      acc[dateStr].push({
        ...item,
        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      });
      
      return acc;
    }, {});
    
    return Object.entries(grouped)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => new Date(b.data[0].date) - new Date(a.data[0].date));
  }, [user.history]);

  const stats = useMemo(() => {
    if (user.history.length === 0) return null;
    
    const habitCount = {};
    const moodCount = { 'Bien': 0, 'Neutre': 0, 'Pas top': 0 };
    const dailyCompletion = {};
    
    user.history.forEach(item => {
      const habitTitle = typeof item.habit === "object" 
        ? item.habit.title 
        : user.habits.find((h) => h.id === item.habit)?.title || "Inconnu";
      
      habitCount[habitTitle] = (habitCount[habitTitle] || 0) + 1;
      
      if (item.mood in moodCount) {
        moodCount[item.mood] += 1;
      }
      
      const date = new Date(item.date).toDateString();
      dailyCompletion[date] = (dailyCompletion[date] || 0) + 1;
    });
    
    const mostFrequentHabit = Object.entries(habitCount)
      .sort((a, b) => b[1] - a[1])[0];
    
    const mostFrequentMood = Object.entries(moodCount)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalCompletions: user.history.length,
      mostFrequentHabit: mostFrequentHabit ? `${mostFrequentHabit[0]} (${mostFrequentHabit[1]} fois)` : 'Aucune',
      mostFrequentMood: mostFrequentMood ? `${mostFrequentMood[0]} (${mostFrequentMood[1]} fois)` : 'Aucune',
      averagePerDay: (user.history.length / Object.keys(dailyCompletion).length).toFixed(1)
    };
  }, [user.history]);

  if (viewMode === 'stats') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(2) }}>
        <View style={{ alignItems: "center", marginBottom: theme.spacing(3) }}>
          <Image source={logoSource} style={{ width: 80, height: 80 }} resizeMode="contain" />
          <Text style={{ marginTop: theme.spacing(1), color: theme.colors.sub }}>Rockwhale</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing(3) }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: theme.colors.ink }}>
            Mes statistiques
          </Text>
          <TouchableOpacity onPress={() => setViewMode('timeline')}>
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {stats ? (
          <View>
            <View style={{
              backgroundColor: theme.colors.card,
              padding: theme.spacing(3),
              borderRadius: theme.radius.xl,
              marginBottom: theme.spacing(3),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.ink, marginBottom: theme.spacing(2) }}>
                📊 Aperçu général
              </Text>
              
              <View style={{ flexDirection: 'row', marginBottom: theme.spacing(2) }}>
                <View style={{ flex: 1, alignItems: 'center', padding: theme.spacing(2), backgroundColor: 'rgba(255, 107, 53, 0.1)', borderRadius: theme.radius.l }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>{stats.totalCompletions}</Text>
                  <Text style={{ color: theme.colors.sub, textAlign: 'center' }}>Total complétions</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', padding: theme.spacing(2), backgroundColor: 'rgba(255, 107, 53, 0.1)', borderRadius: theme.radius.l, marginHorizontal: theme.spacing(1) }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>{stats.averagePerDay}</Text>
                  <Text style={{ color: theme.colors.sub, textAlign: 'center' }}>Moyenne/jour</Text>
                </View>
              </View>
            </View>
            
            <View style={{
              backgroundColor: theme.colors.card,
              padding: theme.spacing(3),
              borderRadius: theme.radius.xl,
              marginBottom: theme.spacing(3),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.ink, marginBottom: theme.spacing(2) }}>
                🏆 Habitude préférée
              </Text>
              <Text style={{ color: theme.colors.sub }}>{stats.mostFrequentHabit}</Text>
            </View>
            
            <View style={{
              backgroundColor: theme.colors.card,
              padding: theme.spacing(3),
              borderRadius: theme.radius.xl,
              marginBottom: theme.spacing(3),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.ink, marginBottom: theme.spacing(2) }}>
                😊 Humeur générale
              </Text>
              <Text style={{ color: theme.colors.sub }}>{stats.mostFrequentMood}</Text>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing(6) }}>
            <Ionicons name="stats-chart" size={64} color={theme.colors.sub} />
            <Text style={{ color: theme.colors.sub, textAlign: "center", marginTop: theme.spacing(2), fontSize: 16 }}>
              Aucune donnée à analyser pour le moment
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(2) }}>
      <View style={{ alignItems: "center", marginBottom: theme.spacing(3) }}>
        <Image source={logoSource} style={{ width: 80, height: 80 }} resizeMode="contain" />
        <Text style={{ marginTop: theme.spacing(1), color: theme.colors.sub }}>Rockwhale</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing(3) }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: theme.colors.ink }}>
          Historique
        </Text>
        <TouchableOpacity onPress={() => setViewMode('stats')}>
          <Ionicons name="stats-chart-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {groupedHistory.length > 0 ? (
        <SectionList
          sections={groupedHistory}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => {
            const habitTitle = typeof item.habit === "object"
              ? item.habit.title
              : user.habits.find((h) => h.id === item.habit)?.title || "Habitude inconnue";

            const fact = scientificFacts[habitTitle] || "Bienfait : contribue à ton bien-être !";

            return (
              <View
                style={{
                  backgroundColor: theme.colors.card,
                  padding: theme.spacing(2),
                  borderRadius: theme.radius.l,
                  marginBottom: theme.spacing(2),
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                  borderLeftWidth: 3,
                  borderLeftColor: theme.colors.primary,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontWeight: "600", color: theme.colors.ink, fontSize: 16, flex: 1 }}>
                    {habitTitle}
                  </Text>
                  <Text style={{ color: theme.colors.sub, fontSize: 14 }}>
                    {item.time}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons 
  name={item.mood === 'Bien' ? 'happy-outline' : item.mood === 'Neutre' ? 'remove-outline' : 'sad-outline'} 
  size={16} 
  color={item.mood === 'Bien' ? '#4CAF50' : item.mood === 'Neutre' ? '#FF9800' : '#F44336'} 
/>
                  <Text style={{ color: theme.colors.sub, marginLeft: 4, fontSize: 14 }}>
                    Humeur : {item.mood}
                  </Text>
                </View>
                
                <Text style={{ marginTop: 6, fontStyle: "italic", color: theme.colors.sub, fontSize: 14, lineHeight: 20 }}>
                  📌 {fact}
                </Text>
              </View>
            );
          }}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={{ 
              fontWeight: '700', 
              color: theme.colors.ink, 
              fontSize: 18, 
              marginTop: theme.spacing(3), 
              marginBottom: theme.spacing(1),
              backgroundColor: theme.colors.bg,
              paddingVertical: theme.spacing(1),
              paddingHorizontal: theme.spacing(1)
            }}>
              {title}
            </Text>
          )}
          ListFooterComponent={
            <View style={{ alignItems: 'center', marginTop: theme.spacing(4), marginBottom: theme.spacing(4) }}>
              <Text style={{ color: theme.colors.sub, textAlign: 'center', fontStyle: 'italic' }}>
                {getStreakMessage(user.streak)}
              </Text>
            </View>
          }
        />
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing(6) }}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.sub} />
          <Text style={{ color: theme.colors.sub, textAlign: "center", marginTop: theme.spacing(2), fontSize: 16 }}>
            Aucun historique pour l'instant
          </Text>
        </View>
      )}
    </View>
  );
}