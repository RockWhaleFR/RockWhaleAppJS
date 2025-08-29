import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import theme from '../theme';

const EMOJIS = ["😞", "😐", "😊", "🤩"];

export default function FeedbackEmoji({ onSelect }) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      paddingVertical: 12,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.l,
      marginVertical: theme.spacing(2),
      padding: theme.spacing(2)
    }}>
      {EMOJIS.map(e => (
        <TouchableOpacity 
          key={e} 
          onPress={() => onSelect(e)}
          accessibilityLabel={`humeur ${e}`}
          style={{
            padding: theme.spacing(1),
            borderRadius: theme.radius.m,
            backgroundColor: theme.colors.chipBg,
            borderWidth: 1,
            borderColor: theme.colors.chipBorder,
          }}
        >
          <Text style={{ fontSize: 32 }}>{e}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}