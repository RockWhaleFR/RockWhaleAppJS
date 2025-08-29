// components/HabitCard.js
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import ScientificTooltip from "./ScientificTooltip";
import theme from "../theme";

export default function HabitCard({ habit, onPress }) {
  return (
    <ScientificTooltip fact={habit.scientificFact}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: theme.colors.card,
          padding: theme.spacing(2),
          borderRadius: theme.radius.xl,
          marginBottom: theme.spacing(2),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.primary,
        }}
      >
        <View>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: "600", 
            color: theme.colors.ink,
            marginBottom: 4 
          }}>
            {habit.title}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: theme.colors.sub 
          }}>
            {habit.category} • {habit.duration}
          </Text>
        </View>
      </TouchableOpacity>
    </ScientificTooltip>
  );
}