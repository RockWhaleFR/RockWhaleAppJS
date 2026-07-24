// screens/TechniquesLibraryScreen.js - CORRIGÉ
import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../store/useUserStore';
import useHabitsStore from '../store/useHabitsStore';
import theme from '../theme/enhancedTheme';

const TechniqueCard = ({ technique, onPress }) => {
  const { user } = useUserStore.getState(); // Utiliser getState pour éviter re-render inutile
  const isLocked = technique.isPremium && !user.isPremium;

  return (
    <TouchableOpacity
      style={[styles.card, isLocked && styles.lockedCard]}
      onPress={() => onPress(technique)}
      disabled={isLocked}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: isLocked ? theme.colors.disabled + '20' : theme.colors.primary + '20' }]}>
          <Ionicons
            name={technique.category === 'Respiration' ? 'leaf-outline' : technique.category === 'Mouvement' ? 'walk-outline' : 'heart-outline'}
            size={24}
            color={isLocked ? theme.colors.disabled : theme.colors.primary}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>{technique.title}</Text>
          <Text style={styles.cardSubtitle}>
            {technique.duration || '2-5 min'} • Efficacité: {technique.efficacyRate || 85}%
          </Text>
        </View>
        {isLocked ? (
          <Ionicons name="lock-closed" size={20} color={theme.colors.disabled} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.sub} />
        )}
      </View>
      <Text style={styles.cardDescription}>{technique.scientificFact || technique.description || 'Technique de bien-être'}</Text>
    </TouchableOpacity>
  );
};

export default function TechniquesLibraryScreen() {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const { habits } = useHabitsStore();

  const groupedTechniques = useMemo(() => {
    // Utiliser uniquement les habits du store
    if (!habits || habits.length === 0) {
      return { 'Toutes les techniques': [] };
    }

    const grouped = habits.reduce((acc, technique) => {
      // Vérifier que la technique existe et a les bonnes propriétés
      if (!technique || !technique.id) {
        return acc;
      }

      const category = technique.category || 'Autres';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(technique);
      return acc;
    }, {});

    return grouped;
  }, [habits]);

  const handleTechniquePress = (technique) => {
    // Si la technique est premium et que l'utilisateur ne l'est pas
    if (technique.isPremium && !user.isPremium) {
      navigation.navigate('PremiumPaywall', {
        triggerSource: 'technique_library',
        blockedFeature: technique.title
      });
    } else {
      navigation.navigate('HabitDetail', { habit: technique });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Boîte à outils</Text>
        <View style={{ width: 24 }} />
      </View>

      {Object.keys(groupedTechniques).length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={theme.colors.sub} />
          <Text style={styles.emptyStateText}>
            Aucune technique disponible pour le moment
          </Text>
        </View>
      ) : (
        Object.entries(groupedTechniques).map(([category, techniques]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {techniques.length === 0 ? (
              <Text style={styles.emptyCategory}>Aucune technique dans cette catégorie</Text>
            ) : (
              techniques.map((technique) => (
                <TechniqueCard
                  key={technique.id}
                  technique={technique}
                  onPress={handleTechniquePress}
                />
              ))
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: theme.spacing(6),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  backButton: {
    padding: theme.spacing(1),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  categorySection: {
    marginBottom: theme.spacing(4),
    paddingHorizontal: theme.spacing(2),
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
  emptyCategory: {
    fontSize: 14,
    color: theme.colors.sub,
    textAlign: 'center',
    padding: theme.spacing(3),
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.l,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    ...theme.psychology.shadows.soft,
  },
  lockedCard: {
    backgroundColor: theme.colors.chipBg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.ink,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.sub,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.sub,
    lineHeight: 20,
    paddingHorizontal: theme.spacing(1),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
    marginTop: theme.spacing(10),
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.sub,
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
});