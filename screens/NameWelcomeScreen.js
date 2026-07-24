// screens/NameWelcomeScreen.js - Écran simple pour prénom + bienvenue
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../store/useUserStore';
import theme from '../theme';

const logoSource = require('../assets/Logo.png');

export default function NameWelcomeScreen() {
  const navigation = useNavigation();
  const { updateUser, user } = useUserStore();
  const [currentPhase, setCurrentPhase] = useState('name'); // 'name' ou 'welcome'
  const [name, setName] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentPhase]);

  // Joue le son de bienvenue
  useEffect(() => {
    if (currentPhase !== 'welcome') return;

    let soundObject;
    async function playWelcomeSound() {
      try {
        if (user.preferences?.soundEnabled !== false) {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/audio/welcome.mp3')
          );
          soundObject = sound;
          await sound.playAsync();
        }
      } catch (error) {
        console.warn('Erreur lecture son bienvenue:', error);
      }
    }

    playWelcomeSound();

    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, [currentPhase]);

  const handleNameSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Oups !", "Veuillez entrer votre prénom pour continuer.");
      return;
    }

    // Animation de sortie
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 200, useNativeDriver: true })
    ]).start(async () => {
      await updateUser({ name: trimmedName });
      setCurrentPhase('welcome');
    });
  };

  const proceedToDiagnostic = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 200, useNativeDriver: true })
    ]).start(() => {
      navigation.replace('StressDiagnostic');
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
    >
      <View style={{ flex: 1, padding: theme.spacing(3), paddingTop: theme.spacing(6), justifyContent: 'center' }}>
        
        {/* Header avec logo */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing(4) }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing(2),
            ...theme.psychology.shadows.warm
          }}>
            <Image source={logoSource} style={{ width: 50, height: 50 }} resizeMode="contain" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.ink, textAlign: 'center' }}>
            Bienvenue sur Rockwhale
          </Text>
          <Text style={{ fontSize: 16, color: theme.colors.sub, textAlign: 'center', marginTop: 4 }}>
            Votre assistant bien-être personnalisé
          </Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <View style={{
            backgroundColor: theme.colors.card,
            padding: theme.spacing(4),
            borderRadius: 20,
            marginBottom: theme.spacing(3),
            ...theme.psychology.shadows.soft,
          }}>
            
            {currentPhase === 'name' ? (
              <>
                <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.ink, marginBottom: theme.spacing(1), lineHeight: 28, textAlign: 'center' }}>
                  Pour commencer, comment puis-je vous appeler ?
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.sub, textAlign: 'center', marginBottom: theme.spacing(3) }}>
                  Votre prénom nous permettra de personnaliser votre expérience
                </Text>
                
                <TextInput
                  style={{
                    borderBottomWidth: 2,
                    borderColor: theme.colors.primary,
                    padding: theme.spacing(2),
                    fontSize: 20,
                    textAlign: 'center',
                    color: theme.colors.ink,
                    fontWeight: '600',
                    marginBottom: theme.spacing(4),
                  }}
                  placeholder="Entrez votre prénom"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={theme.colors.disabled}
                  autoFocus
                  onSubmitEditing={handleNameSubmit}
                />
                
                <TouchableOpacity
                  onPress={handleNameSubmit}
                  disabled={!name.trim()}
                  style={{
                    paddingVertical: theme.spacing(2),
                    paddingHorizontal: theme.spacing(4),
                    borderRadius: theme.psychology.borderRadius.gentle,
                    backgroundColor: !name.trim() ? theme.colors.disabled : theme.colors.primary,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...(!name.trim() ? {} : theme.psychology.shadows.warm)
                  }}
                >
                  <Text style={{ color: theme.colors.primaryInk, fontWeight: '700', marginRight: 6, fontSize: 16 }}>
                    Suivant
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.primaryInk} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="sparkles-outline" size={48} color={theme.colors.primary} />
                <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.ink, marginTop: theme.spacing(3), marginBottom: theme.spacing(2), textAlign: 'center', lineHeight: 32 }}>
                  Bonjour {name}, enchanté !
                </Text>
                <Text style={{ fontSize: 16, color: theme.colors.sub, textAlign: 'center', marginBottom: theme.spacing(4), lineHeight: 24 }}>
                  Je suis Rockwhale, votre assistant de bien-être. Pour créer votre parcours sur-mesure, je vais vous poser quelques questions.
                </Text>
                <TouchableOpacity
                  onPress={proceedToDiagnostic}
                  style={{
                    paddingVertical: theme.spacing(2),
                    paddingHorizontal: theme.spacing(4),
                    borderRadius: theme.psychology.borderRadius.gentle,
                    backgroundColor: theme.colors.primary,
                    flexDirection: 'row',
                    alignItems: 'center',
                    ...theme.psychology.shadows.warm
                  }}
                >
                  <Text style={{ color: theme.colors.primaryInk, fontWeight: '700', marginRight: 6, fontSize: 16 }}>
                    C'est parti !
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={theme.colors.primaryInk} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}