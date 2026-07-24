// screens/WelcomeScreen.js - CORRIGÉ
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const logoSource = require('../assets/Logo.png');

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </View>
        
        <Text style={styles.title}>Bienvenue sur Rockwhale</Text>
        <Text style={styles.subtitle}>
          Votre assistant personnel pour transformer votre bien-être au travail grâce à des micro-habitudes basées sur la science.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('NameWelcome')}
        >
          <Text style={styles.buttonText}>Commencer mon parcours</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.primaryInk} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${theme.colors.primary}20`,
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: `${theme.colors.accent}15`,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.psychology.borderRadius.comfort,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    ...theme.psychology.shadows.warm,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.sub,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing(5),
    maxWidth: '90%',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(5),
    borderRadius: theme.psychology.borderRadius.gentle,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.psychology.shadows.warm,
  },
  buttonText: {
    color: theme.colors.primaryInk,
    fontSize: 18,
    fontWeight: '700',
    marginRight: theme.spacing(2),
  },
});