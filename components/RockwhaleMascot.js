// components/RockwhaleMascot.js
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

// Approche data-driven pour une meilleure lisibilité et maintenabilité
const mascotLevels = [
  { threshold: 30, iconName: 'rocket-outline', message: "Il est prêt à décoller !", color: theme.colors.primary },
  { threshold: 7, iconName: 'planet-outline', message: "Il prend de l'ampleur !", color: theme.colors.accent },
  { threshold: 3, iconName: 'diamond-outline', message: "Il commence à briller !", color: theme.colors.accent },
  { threshold: 0, iconName: 'sparkles-outline', message: "Prêt à commencer l'aventure ?", color: theme.colors.sub }
];

export default function RockwhaleMascot({ streak }) {
  // Trouve le plus haut palier atteint par l'utilisateur
  const currentLevel = mascotLevels.find(level => streak >= level.threshold);

  // Utilise les valeurs du palier actuel (ou le niveau 0 par défaut)
  const { iconName, message, color } = currentLevel || mascotLevels[mascotLevels.length - 1];

  return (
    <View style={{ 
      alignItems: 'center', 
      padding: theme.spacing(3), 
      backgroundColor: theme.colors.card, 
      borderRadius: theme.radius.xl,
      marginBottom: theme.spacing(3),
      borderWidth: 1,
      borderColor: theme.colors.chipBg
    }}>
      <Ionicons name={iconName} size={80} color={color} />
      <Text style={{ 
        marginTop: theme.spacing(2), 
        fontSize: 16, 
        fontWeight: '600', 
        color: theme.colors.ink 
      }}>
        {message}
      </Text>
    </View>
  );
}
