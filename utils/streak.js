import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';

const habits = [
  { id: '1', title: 'Boire un verre d’eau 💧' },
  { id: '2', title: 'Respirer profondément 1 min 🌬️' },
  { id: '3', title: 'S’étirer 30 secondes 🧘‍♂️' },
];

export default function App() {
  const [completed, setCompleted] = useState({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const saved = await AsyncStorage.getItem('completedHabits');
      const lastDate = await AsyncStorage.getItem('lastDate');
      const savedStreak = await AsyncStorage.getItem('streak');

      const today = new Date().toDateString();

      if (lastDate !== today) {
        // Nouveau jour → reset
        if (saved) {
          const allDone = habits.every(h => JSON.parse(saved)[h.id]);
          if (allDone) {
            const newStreak = (parseInt(savedStreak) || 0) + 1;
            setStreak(newStreak);
            await AsyncStorage.setItem('streak', newStreak.toString());
          } else {
            setStreak(0);
            await AsyncStorage.setItem('streak', '0');
          }
        }
        setCompleted({});
        await AsyncStorage.setItem('completedHabits', JSON.stringify({}));
        await AsyncStorage.setItem('lastDate', today);
      } else {
        if (saved) setCompleted(JSON.parse(saved));
        if (savedStreak) setStreak(parseInt(savedStreak));
      }
    };
    loadData();
  }, []);

  const handleComplete = async (id) => {
    const updated = { ...completed, [id]: true };
    setCompleted(updated);
    await AsyncStorage.setItem('completedHabits', JSON.stringify(updated));
  };

  const renderHabit = ({ item }) => (
    <View style={styles.habitBox}>
      <Text style={styles.habitText}>{item.title}</Text>
      <Button
        title={completed[item.id] ? "✅ Fait !" : "Je l’ai fait"}
        onPress={() => handleComplete(item.id)}
        color={completed[item.id] ? "green" : "blue"}
      />
      {completed[item.id] && (
        <Text style={styles.feedback}>Bravo ! Tu prends soin de toi 🧠</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌊 Tes micro-habitudes du jour</Text>
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id}
      />
      <Text style={styles.streak}>🔥 Série de jours consécutifs : {streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  habitBox: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f8ff',
  },
  habitText: {
    fontSize: 18,
    marginBottom: 10,
  },
  feedback: {
    marginTop: 10,
    fontSize: 16,
    color: 'green',
  },
  streak: {
    marginTop: 30,
    fontSize: 18,
    textAlign: 'center',
    color: 'orange',
  },
});

