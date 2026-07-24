// screens/PremiumPaywallScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useUserStore from '../store/useUserStore';
import theme from '../theme';

const logoSource = require('../assets/Logo.png');

const premiumFeatures = [
  {
    icon: 'analytics-outline',
    title: 'IA Prédictive Personnalisée',
    description: 'Anticipe vos pics de stress et suggère des interventions préventives',
    value: 'Évite 78% des crises d\'anxiété',
    color: '#4CAF50'
  },
  {
    icon: 'library-outline',
    title: 'Bibliothèque Thérapeutique',
    description: '15+ techniques cliniques : EFT, EMDR, Cohérence cardiaque avancée',
    value: '3x plus efficace que les techniques de base',
    color: '#2196F3'
  },
  {
    icon: 'headset-outline',
    title: 'Sessions Audio Guidées',
    description: 'Voix thérapeutique professionnelle avec musiques biométriques',
    value: 'Améliore l\'efficacité de 45%',
    color: '#9C27B0'
  },
  {
    icon: 'trending-up-outline',
    title: 'Analyse de Résilience',
    description: 'Score évolutif de votre capacité de gestion du stress',
    value: 'Progression mesurable scientifiquement',
    color: '#FF9800'
  },
  {
    icon: 'time-outline',
    title: 'Optimisation Circadienne',
    description: 'Recommandations selon votre rythme biologique personnel',
    value: 'Efficacité +60% aux bons moments',
    color: '#00BCD4'
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Protocoles SOS',
    description: 'Techniques d\'urgence pour crises d\'anxiété et burnout',
    value: 'Soulagement en moins de 5 minutes',
    color: '#F44336'
  }
];

const socialProof = [
  {
    name: 'Marie L.',
    role: 'Directrice Marketing',
    text: 'J\'ai réduit mes attaques de panique de 90% en 3 semaines. L\'IA m\'a aidé à identifier mes déclencheurs.',
    rating: 5
  },
  {
    name: 'Thomas K.',
    role: 'Entrepreneur',
    text: 'Les techniques EFT ont transformé ma gestion du stress. Je dors enfin normalement.',
    rating: 5
  },
  {
    name: 'Sarah M.',
    role: 'Médecin',
    text: 'Même en tant que professionnelle de santé, j\'ai appris des techniques que j\'ignorais. Remarquable.',
    rating: 5
  }
];

export default function PremiumPaywallScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { updateUser, user } = useUserStore();
  
  const { triggerSource, blockedFeature, userProgress } = route.params || {};
  
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Animation pulsante pour le CTA
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handleSubscribe = async (plan) => {
    setIsProcessing(true);
    
    try {
      // Simulation d'appel API de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mise à jour du statut premium
      await updateUser({
        isPremium: true,
        subscriptionPlan: plan,
        subscriptionDate: new Date().toISOString(),
        premiumFeatures: {
          unlimitedTechniques: true,
          aiRecommendations: true,
          audioGuidedSessions: true,
          advancedAnalytics: true,
          progressReports: true,
          sosProtocols: true
        }
      });

      Alert.alert(
        'Bienvenue dans Premium ! 🎉',
        'Toutes les fonctionnalités avancées sont maintenant débloquées.',
        [
          {
            text: 'Commencer',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      Alert.alert('Erreur', 'Problème lors de l\'activation. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getContextualMessage = () => {
    switch (triggerSource) {
      case 'technique_limit':
        return {
          title: 'Vous avez atteint votre limite quotidienne',
          subtitle: 'Débloquez l\'accès illimité pour continuer votre progression',
          urgency: 'high'
        };
      case 'advanced_analytics':
        return {
          title: 'Découvrez vos patterns de stress',
          subtitle: 'L\'IA a détecté des insights précieux pour vous',
          urgency: 'medium'
        };
      case 'sos_needed':
        return {
          title: 'Accédez aux protocoles d\'urgence',
          subtitle: 'Techniques spécialisées pour situations critiques',
          urgency: 'critical'
        };
      default:
        return {
          title: 'Accélérez votre transformation',
          subtitle: 'Techniques scientifiques premium pour résultats garantis',
          urgency: 'medium'
        };
    }
  };

  const contextMessage = getContextualMessage();
  const monthlyPrice = 14.99;
  const yearlyPrice = 149.99;
  const yearlyMonthlyEquivalent = yearlyPrice / 12;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <LinearGradient
        colors={['#1A237E', '#3F51B5', '#5C6BC0']}
        style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={logoSource} style={{ width: 40, height: 40 }} resizeMode="contain" />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 }}>
            {contextMessage.title}
          </Text>
          <Text style={{ fontSize: 18, color: '#E8EAF6', textAlign: 'center', lineHeight: 26 }}>
            {contextMessage.subtitle}
          </Text>

          {userProgress && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 15,
              padding: 20,
              marginTop: 30,
              alignItems: 'center'
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
                Votre progression actuelle
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFFFFF' }}>{userProgress.streak || 0}</Text>
                  <Text style={{ fontSize: 12, color: '#E8EAF6' }}>Jours consécutifs</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFFFFF' }}>{userProgress.techniques || 0}</Text>
                  <Text style={{ fontSize: 12, color: '#E8EAF6' }}>Techniques maîtrisées</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFFFFF' }}>{Math.round((userProgress.improvement || 0) * 100)}%</Text>
                  <Text style={{ fontSize: 12, color: '#E8EAF6' }}>Amélioration</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      <View style={{ padding: 20 }}>
        {/* Fonctionnalités premium */}
        <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.ink, marginBottom: 20, textAlign: 'center' }}>
          Ce que vous débloquez
        </Text>

        {premiumFeatures.map((feature, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: theme.colors.card,
              borderRadius: 15,
              padding: 20,
              marginBottom: 15,
              borderLeftWidth: 4,
              borderLeftColor: feature.color,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: feature.color + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 15
              }}>
                <Ionicons name={feature.icon} size={24} color={feature.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.ink }}>
                  {feature.title}
                </Text>
                <Text style={{ fontSize: 12, color: feature.color, fontWeight: '600' }}>
                  {feature.value}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: theme.colors.sub, lineHeight: 20 }}>
              {feature.description}
            </Text>
          </Animated.View>
        ))}

        {/* Témoignages */}
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.ink, marginTop: 30, marginBottom: 20, textAlign: 'center' }}>
          Ce qu'en disent nos utilisateurs
        </Text>

        {socialProof.map((testimonial, index) => (
          <View key={index} style={{
            backgroundColor: theme.colors.card,
            borderRadius: 15,
            padding: 20,
            marginBottom: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {[...Array(testimonial.rating)].map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#FFD700" />
              ))}
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.ink, fontStyle: 'italic', marginBottom: 10, lineHeight: 22 }}>
              "{testimonial.text}"
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary }}>
              {testimonial.name}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.sub }}>
              {testimonial.role}
            </Text>
          </View>
        ))}

        {/* Plans tarifaires */}
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.ink, marginBottom: 20, textAlign: 'center' }}>
            Choisissez votre plan
          </Text>

          {/* Plan mensuel */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            style={{
              borderRadius: 15,
              borderWidth: 2,
              borderColor: selectedPlan === 'monthly' ? theme.colors.primary : theme.colors.chipBorder,
              backgroundColor: selectedPlan === 'monthly' ? theme.colors.primary + '10' : theme.colors.card,
              padding: 20,
              marginBottom: 15
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.ink }}>
                  Mensuel
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.sub }}>
                  Flexibilité maximale
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>
                  {monthlyPrice}€
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.sub }}>
                  par mois
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Plan annuel */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('yearly')}
            style={{
              borderRadius: 15,
              borderWidth: 2,
              borderColor: selectedPlan === 'yearly' ? theme.colors.primary : theme.colors.chipBorder,
              backgroundColor: selectedPlan === 'yearly' ? theme.colors.primary + '10' : theme.colors.card,
              padding: 20,
              position: 'relative',
              marginBottom: 30
            }}
          >
            <View style={{
              position: 'absolute',
              top: -15,
              alignSelf: 'center',
              backgroundColor: '#4CAF50',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                ÉCONOMIE 17%
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.ink }}>
                  Annuel
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.sub }}>
                  Meilleure valeur
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>
                  {yearlyMonthlyEquivalent.toFixed(2)}€
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.sub }}>
                  par mois ({yearlyPrice}€ facturé annuellement)
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* CTA Principal */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={() => handleSubscribe(selectedPlan)}
              disabled={isProcessing}
              style={{
                backgroundColor: contextMessage.urgency === 'critical' ? '#F44336' : theme.colors.primary,
                paddingVertical: 18,
                borderRadius: 15,
                alignItems: 'center',
                shadowColor: contextMessage.urgency === 'critical' ? '#F44336' : theme.colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
                marginBottom: 15
              }}
            >
              {isProcessing ? (
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                  Activation en cours...
                </Text>
              ) : (
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                  {contextMessage.urgency === 'critical' ? 'DÉBLOQUER MAINTENANT' : 
                   selectedPlan === 'yearly' ? 'Économiser 17% - Commencer' : 'Commencer l\'essai'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Garantie */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 15,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#4CAF50',
            marginBottom: 20
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.ink, marginLeft: 8 }}>
                Garantie 30 jours
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.colors.sub, textAlign: 'center' }}>
              Pas satisfait ? Remboursement intégral sous 30 jours, sans question.
            </Text>
          </View>

          {/* Informations légales */}
          <Text style={{ fontSize: 12, color: theme.colors.sub, textAlign: 'center', lineHeight: 18 }}>
            L'abonnement se renouvelle automatiquement. Annulation possible à tout moment depuis les paramètres.
            {'\n'}Paiement sécurisé. Données personnelles protégées.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}