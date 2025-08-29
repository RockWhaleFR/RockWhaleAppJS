import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import useUserStore from '../store/useUserStore';
import useHabitsStore from '../store/useHabitsStore';
import allHabits from '../data/habits';
import theme from '../theme';

const logoSource = require('../assets/Logo.png');

export default function OnboardingScreen({ navigation }) {
  const { setUser } = useUserStore();
  const { setHabits } = useHabitsStore();
  const [objectives, setObjectives] = useState([]);
  const [timeAvailable, setTimeAvailable] = useState('≤2min');
  const [intensity, setIntensity] = useState('ultra-douce');
  const [chronotype, setChronotype] = useState('neutre');
  const fade = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fade, bob]);

  const translateY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const toggleObjective = (value) => {
    setObjectives((prev) =>
      prev.includes(value) ? prev.filter((o) => o !== value) : [...prev, value]
    );
  };

  const finish = async () => {
    await setUser({
      objectives,
      timeAvailable,
      intensity,
      chronotype,
      hasOnboarded: true,
    });

    const mapping = {
      'énergie': ['Énergie'],
      'mental': ['Humeur', 'Stress'],
      'productivité': ['Énergie', 'Humeur'],
      'sommeil': ['Sommeil'],
    };

    const wantedCategories = new Set(
      objectives.flatMap((o) => mapping[o] || [])
    );

    const filteredHabits = allHabits.filter((h) =>
      wantedCategories.has(h.category)
    );

    setHabits(filteredHabits);
    navigation.replace('Main');
  };

  const goalOptions = [
    { label: 'Énergie', value: 'énergie' },
    { label: 'Mental', value: 'mental' },
    { label: 'Productivité', value: 'productivité' },
    { label: 'Sommeil', value: 'sommeil' },
  ];

  const disabled = objectives.length === 0;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
      }}
      contentContainerStyle={{
        padding: theme.spacing(2),
        paddingBottom: theme.spacing(4),
      }}
    >
      {/* Logo animé */}
      <View style={{ alignItems: 'center', marginBottom: theme.spacing(3), paddingTop: theme.spacing(3) }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY }] }}>
          <Image
            source={logoSource}
            resizeMode="contain"
            style={{ width: 120, height: 120 }}
          />
        </Animated.View>
        <Text style={{ 
          marginTop: theme.spacing(1), 
          color: theme.colors.sub,
          fontSize: 18,
          fontWeight: '500'
        }}>
          Rockwhale
        </Text>
      </View>

      {/* Titre */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          padding: theme.spacing(3),
          borderRadius: theme.radius.xl,
          marginBottom: theme.spacing(3),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Text style={{ 
          fontSize: 24, 
          color: theme.colors.ink, 
          marginBottom: 8,
          fontWeight: '700'
        }}>
          Bienvenue 👋
        </Text>
        <Text style={{ 
          color: theme.colors.sub, 
          lineHeight: 22,
          fontSize: 16
        }}>
          Choisis tes objectifs, on te prépare des habitudes sur-mesure.
        </Text>
      </View>

      {/* Objectifs multi-sélection */}
      <Text style={{ 
        color: theme.colors.ink, 
        marginBottom: 8,
        fontWeight: '600',
        fontSize: 16
      }}>
        Objectifs principaux
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: theme.spacing(3),
        }}
      >
        {goalOptions.map((opt) => {
          const selected = objectives.includes(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => toggleObjective(opt.value)}
              activeOpacity={0.9}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: theme.radius.l,
                borderWidth: 1,
                borderColor: selected
                  ? theme.colors.primary
                  : theme.colors.chipBorder,
                backgroundColor: selected
                  ? theme.colors.primary
                  : theme.colors.chipBg,
                marginRight: 10,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: selected
                    ? theme.colors.primaryInk
                    : theme.colors.ink,
                  fontWeight: selected ? '600' : '500',
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Temps disponible */}
      <Text style={{ 
        color: theme.colors.ink, 
        marginBottom: 8,
        fontWeight: '600',
        fontSize: 16
      }}>
        Temps disponible
      </Text>
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.l,
          marginBottom: theme.spacing(3),
          borderWidth: 1,
          borderColor: theme.colors.chipBorder,
          overflow: 'hidden',
        }}
      >
        <Picker
          selectedValue={timeAvailable}
          onValueChange={setTimeAvailable}
          style={{
            color: theme.colors.ink,
          }}
        >
          <Picker.Item label="≤ 2 min" value="≤2min" />
          <Picker.Item label="5 min" value="5min" />
        </Picker>
      </View>

      {/* Intensité */}
      <Text style={{ 
        color: theme.colors.ink, 
        marginBottom: 8,
        fontWeight: '600',
        fontSize: 16
      }}>
        Intensité
      </Text>
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.l,
          marginBottom: theme.spacing(3),
          borderWidth: 1,
          borderColor: theme.colors.chipBorder,
          overflow: 'hidden',
        }}
      >
        <Picker
          selectedValue={intensity}
          onValueChange={setIntensity}
          style={{
            color: theme.colors.ink,
          }}
        >
          <Picker.Item label="Ultra-douce" value="ultra-douce" />
          <Picker.Item label="Standard" value="standard" />
        </Picker>
      </View>

      {/* Chronotype */}
      <Text style={{ 
        color: theme.colors.ink, 
        marginBottom: 8,
        fontWeight: '600',
        fontSize: 16
      }}>
        Chronotype
      </Text>
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.l,
          marginBottom: theme.spacing(4),
          borderWidth: 1,
          borderColor: theme.colors.chipBorder,
          overflow: 'hidden',
        }}
      >
        <Picker
          selectedValue={chronotype}
          onValueChange={setChronotype}
          style={{
            color: theme.colors.ink,
          }}
        >
          <Picker.Item label="Matin" value="matin" />
          <Picker.Item label="Soir" value="soir" />
          <Picker.Item label="Neutre" value="neutre" />
        </Picker>
      </View>

      {/* Bouton principal custom */}
      <TouchableOpacity
        onPress={finish}
        disabled={disabled}
        activeOpacity={0.9}
        style={{
          backgroundColor: disabled
            ? theme.colors.disabled
            : theme.colors.primary,
          paddingVertical: 16,
          borderRadius: theme.radius.xl,
          alignItems: 'center',
          shadowColor: '#FF6B35',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: disabled ? 0 : 0.3,
          shadowRadius: 12,
          elevation: disabled ? 0 : 4,
          marginBottom: theme.spacing(2),
        }}
      >
        <Text
          style={{
            color: theme.colors.primaryInk,
            fontWeight: '700',
            fontSize: 16,
          }}
        >
          C'est parti
        </Text>
      </TouchableOpacity>

      {disabled && (
        <Text style={{
          color: theme.colors.sub,
          textAlign: 'center',
          fontSize: 14,
          marginTop: theme.spacing(1)
        }}>
          Sélectionnez au moins un objectif pour continuer
        </Text>
      )}
    </ScrollView>
  );
}