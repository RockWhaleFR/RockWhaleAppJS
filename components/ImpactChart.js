// components/ImpactChart.js
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

export default function ImpactChart({ habit, impact }) {
  return (
    <View style={{ 
      backgroundColor: `${theme.colors.accent}20`, // Fond turquoise léger
      padding: theme.spacing(3), 
      borderRadius: theme.radius.xl, 
      marginTop: theme.spacing(3),
      borderWidth: 1,
      borderColor: theme.colors.accent
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(2) }}>
        <Ionicons name="bulb-outline" size={24} color={theme.colors.accent} />
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '700', 
          color: theme.colors.ink, 
          marginLeft: theme.spacing(1)
        }}>
          Votre Levier de Bien-être
        </Text>
      </View>
      
      <Text style={{ color: theme.colors.sub, lineHeight: 22, marginBottom: theme.spacing(2) }}>
        Nous avons remarqué que lorsque vous pratiquez "{habit}", vous rapportez une humeur "Bien" dans 
        <Text style={{ fontWeight: 'bold', color: theme.colors.accent }}> {impact}%</Text> des cas.
        C'est votre habitude la plus efficace !
      </Text>

      <View style={{
        height: 12,
        backgroundColor: `${theme.colors.accent}40`,
        borderRadius: 6,
        overflow: 'hidden'
      }}>
        <View style={{
          width: `${impact}%`,
          height: '100%',
          backgroundColor: theme.colors.accent,
          borderRadius: 6
        }} />
      </View>
    </View>
  );
}

