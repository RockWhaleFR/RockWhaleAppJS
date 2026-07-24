// screens/HistoryTimelineScreen.js
import React, { useMemo } from "react";
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import useUserStore from "../store/useUserStore";
import useHabitsStore from "../store/useHabitsStore";
import { getStreakMessage } from "../utils/messages";
import theme from "../theme";

export default function HistoryTimelineScreen() {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const { habits } = useHabitsStore();

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique Détaillé</Text>
      </View>

      {groupedHistory.length > 0 ? (
        <SectionList
          sections={groupedHistory}
          keyExtractor={(item, index) => item.date + index}
          renderItem={({ item }) => {
            const habitObject = typeof item.habit === "object"
              ? item.habit
              : habits.find((h) => h.id === item.habit);

            const habitTitle = habitObject?.title || "Habitude inconnue";
            const fact = habitObject?.scientificFact || "Bienfait : contribue à ton bien-être !";

            return (
              <View style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{habitTitle}</Text>
                  <Text style={styles.itemTime}>{item.time}</Text>
                </View>

                {item.moodBefore && item.moodAfter ? (
                  <View style={styles.moodContainer}>
                    <Text style={styles.moodText}>Humeur : {item.moodBefore}</Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.sub} style={{ marginHorizontal: 8 }} />
                    <Text style={[styles.moodText, { color: theme.colors.primary, fontWeight: '600' }]}>{item.moodAfter}</Text>
                  </View>
                ) : (
                  // Fallback pour les anciennes données qui n'ont que `mood` ou `moodAfter`
                  <View style={styles.moodContainer}>
                    <Ionicons
                      name={(item.moodAfter || item.mood) === 'Bien' || (item.moodAfter || item.mood) === 'Excellent' ? 'happy-outline' : (item.moodAfter || item.mood) === 'Neutre' ? 'remove-outline' : 'sad-outline'}
                      size={16}
                      color={(item.moodAfter || item.mood) === 'Bien' || (item.moodAfter || item.mood) === 'Excellent' ? '#4CAF50' : (item.moodAfter || item.mood) === 'Neutre' ? '#FF9800' : '#F44336'}
                    />
                    <Text style={styles.moodText}>Humeur : {item.moodAfter || item.mood}</Text>
                  </View>
                )}

                <Text style={styles.factText}>📌 {fact}</Text>
              </View>
            );
          }}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {getStreakMessage(user.streak)}
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.sub} />
          <Text style={styles.emptyStateText}>
            Aucun historique pour l'instant
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(2) },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(3), paddingTop: theme.spacing(4) },
  backButton: { padding: 8, marginRight: theme.spacing(1) },
  headerTitle: { fontSize: 24, fontWeight: "700", color: theme.colors.ink },
  itemContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing(2),
    borderRadius: theme.radius.l,
    marginBottom: theme.spacing(2),
    ...theme.psychology.shadows.soft,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemTitle: { fontWeight: "600", color: theme.colors.ink, fontSize: 16, flex: 1 },
  itemTime: { color: theme.colors.sub, fontSize: 14 },
  moodContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  moodText: { color: theme.colors.sub, marginLeft: 4, fontSize: 14 },
  factText: { marginTop: 6, fontStyle: "italic", color: theme.colors.sub, fontSize: 14, lineHeight: 20 },
  sectionHeader: {
    fontWeight: '700', color: theme.colors.ink, fontSize: 18,
    marginTop: theme.spacing(3), marginBottom: theme.spacing(1),
    backgroundColor: theme.colors.bg, paddingVertical: theme.spacing(1), paddingHorizontal: theme.spacing(1)
  },
  footer: { alignItems: 'center', marginVertical: theme.spacing(4) },
  footerText: { color: theme.colors.sub, textAlign: 'center', fontStyle: 'italic' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing(6) },
  emptyStateText: { color: theme.colors.sub, textAlign: "center", marginTop: theme.spacing(2), fontSize: 16 },
});