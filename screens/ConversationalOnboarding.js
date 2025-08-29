// screens/ConversationalOnboarding.js - Version Marketing & Science-Based
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, ScrollView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../store/useUserStore';
import useHabitsStore from '../store/useHabitsStore';
import allHabits from '../data/habits';
import theme from '../theme';

const logoSource = require('../assets/Logo.png');

// Configuration des couleurs scientifiquement optimisées pour le bien-être
const WELLNESS_COLORS = {
  energy: "#FFB84D",    // Orange chaleureux - stimule l'énergie sans agressivité
  calm: "#7DD3FC",      // Bleu ciel - réduit cortisol et favorise la sérénité  
  focus: "#34D399",     // Vert nature - améliore concentration et réduit fatigue oculaire
  rest: "#A78BFA",      // Violet doux - favorise relaxation et récupération
  balance: "#F472B6",   // Rose équilibrant - stimule créativité et réconfort
  grounding: "#94A3B8"  // Gris naturel - stabilité et ancrage
};

// Variables psychologiques pour le design thérapeutique
const PSYCHOLOGY = {
  borderRadius: {
    gentle: theme.radius.l,     // 14px - Formes douces réduisent l'anxiété
    comfort: theme.radius.xl,   // 20px - Formes très douces pour maximum réconfort
    energy: theme.radius.m      // 10px - Légèrement angulaires pour stimuler action
  },
  shadows: {
    soft: {
      shadowColor: theme.colors.ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4
    },
    warm: {
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6
    }
  }
};

const questions = [
  {
    id: 1,
    text: "Quel est votre principal défi professionnel actuellement ?",
    subtitle: "Nous adapterons votre parcours en fonction de vos besoins prioritaires",
    options: [
      { 
        label: "Manque d'énergie au quotidien", 
        value: 'énergie', 
        emoji: "⚡", 
        color: WELLNESS_COLORS.energy,
        bgColor: `${WELLNESS_COLORS.energy}15`,
        description: "Retrouvez votre vitalité naturelle"
      },
      { 
        label: "Stress et anxiété", 
        value: 'mental', 
        emoji: "🧠", 
        color: WELLNESS_COLORS.calm,
        bgColor: `${WELLNESS_COLORS.calm}15`,
        description: "Développez votre sérénité mentale"
      },
      { 
        label: "Difficultés de concentration", 
        value: 'productivité', 
        emoji: "🎯", 
        color: WELLNESS_COLORS.focus,
        bgColor: `${WELLNESS_COLORS.focus}15`,
        description: "Optimisez votre focus et efficacité"
      },
      { 
        label: "Troubles du sommeil", 
        value: 'sommeil', 
        emoji: "😴", 
        color: WELLNESS_COLORS.rest,
        bgColor: `${WELLNESS_COLORS.rest}15`,
        description: "Améliorez la qualité de votre repos"
      },
    ],
    type: "single"
  },
  {
    id: 2,
    text: "Décrivez votre rythme de travail",
    subtitle: "Pour des recommandations parfaitement adaptées à votre planning",
    options: [
      { label: "Horaires fixes (9h-17h)", value: '9-17', emoji: "🏢", color: WELLNESS_COLORS.grounding, bgColor: `${WELLNESS_COLORS.grounding}15`, description: "Structure traditionnelle" },
      { label: "Flexibilité modérée (8h-19h)", value: 'flexible', emoji: "⏰", color: WELLNESS_COLORS.energy, bgColor: `${WELLNESS_COLORS.energy}15`, description: "Équilibre et adaptabilité" },
      { label: "Freelance/Entrepreneur", value: 'irregular', emoji: "✨", color: WELLNESS_COLORS.balance, bgColor: `${WELLNESS_COLORS.balance}15`, description: "Rythme créatif et libre" },
      { label: "Équipes de nuit (20h-6h)", value: 'night', emoji: "🌙", color: WELLNESS_COLORS.rest, bgColor: `${WELLNESS_COLORS.rest}15`, description: "Optimisation nocturne" },
    ],
    type: "single"
  },
  {
    id: 3,
    text: "Votre environnement de travail principal ?",
    subtitle: "Chaque environnement nécessite des stratégies spécifiques",
    options: [
      { label: "Bureau en entreprise", value: 'office', emoji: "🏢", color: WELLNESS_COLORS.grounding, bgColor: `${WELLNESS_COLORS.grounding}15`, description: "Environnement corporate" },
      { label: "Télétravail à domicile", value: 'home', emoji: "🏠", color: WELLNESS_COLORS.calm, bgColor: `${WELLNESS_COLORS.calm}15`, description: "Confort de votre foyer" },
      { label: "Espaces de coworking", value: 'coworking', emoji: "☕", color: WELLNESS_COLORS.energy, bgColor: `${WELLNESS_COLORS.energy}15`, description: "Dynamisme collaboratif" },
      { label: "En déplacement constant", value: 'mobile', emoji: "✈️", color: WELLNESS_COLORS.focus, bgColor: `${WELLNESS_COLORS.focus}15`, description: "Mobilité professionnelle" },
    ],
    type: "single"
  },
  {
    id: 4,
    text: "Évaluez votre niveau de stress actuel",
    subtitle: "Une évaluation honnête nous aide à personnaliser votre accompagnement",
    options: [
      { label: "Généralement serein(e)", value: 'low', emoji: "😌", color: WELLNESS_COLORS.focus, bgColor: `${WELLNESS_COLORS.focus}15`, description: "Maintenir cet équilibre" },
      { label: "Stress modéré et gérable", value: 'medium', emoji: "😐", color: WELLNESS_COLORS.energy, bgColor: `${WELLNESS_COLORS.energy}15`, description: "Optimisation préventive" },
      { label: "Souvent sous pression", value: 'high', emoji: "😰", color: theme.colors.primary, bgColor: theme.colors.chipBg, description: "Techniques anti-stress intensives" },
      { label: "Proche du burnout", value: 'critical', emoji: "🆘", color: WELLNESS_COLORS.rest, bgColor: `${WELLNESS_COLORS.rest}15`, description: "Support d'urgence nécessaire" },
    ],
    type: "single"
  },
  {
    id: 5,
    text: "À quel moment êtes-vous le plus performant(e) ?",
    subtitle: "Synchronisons vos habitudes avec votre rythme biologique naturel",
    options: [
      { label: "Très tôt le matin (6h-9h)", value: 'early-morning', emoji: "🌅", color: WELLNESS_COLORS.energy, bgColor: `${WELLNESS_COLORS.energy}15`, description: "Énergie matinale maximale" },
      { label: "En matinée (9h-12h)", value: 'morning', emoji: "☕", color: theme.colors.primary, bgColor: theme.colors.chipBg, description: "Pic de productivité classique" },
      { label: "Après-midi (14h-17h)", value: 'afternoon', emoji: "☀️", color: WELLNESS_COLORS.focus, bgColor: `${WELLNESS_COLORS.focus}15`, description: "Second souffle journalier" },
      { label: "En soirée (18h-22h)", value: 'evening', emoji: "🌆", color: WELLNESS_COLORS.balance, bgColor: `${WELLNESS_COLORS.balance}15`, description: "Créativité nocturne" },
    ],
    type: "single"
  },
  {
    id: 6,
    text: "Quelle pause vous ressource le mieux ?",
    subtitle: "Découvrons votre méthode de récupération optimale",
    options: [
      { label: "Méditation & respiration", value: 'meditation', emoji: "🧘", color: WELLNESS_COLORS.rest, bgColor: `${WELLNESS_COLORS.rest}15`, description: "Calme mental profond" },
      { label: "Mouvement & étirements", value: 'movement', emoji: "🤸", color: WELLNESS_COLORS.energy, bgColor: `${WELLNESS_COLORS.energy}15`, description: "Énergie par le corps" },
      { label: "Interactions sociales", value: 'social', emoji: "💬", color: WELLNESS_COLORS.balance, bgColor: `${WELLNESS_COLORS.balance}15`, description: "Connexion humaine" },
      { label: "Contact avec la nature", value: 'nature', emoji: "🌳", color: WELLNESS_COLORS.focus, bgColor: `${WELLNESS_COLORS.focus}15`, description: "Ressourcement naturel" },
    ],
    type: "single"
  },
  {
    id: 7,
    text: "Combien de temps pouvez-vous dédier quotidiennement ?",
    subtitle: "Définissons un engagement réaliste et durable pour vous",
    options: [
      { label: "1-2 minutes (micro-habitudes)", value: '≤2min', emoji: "ⱕ", color: WELLNESS_COLORS.calm, bgColor: `${WELLNESS_COLORS.calm}15`, description: "Impact maximum, effort minimum" },
      { label: "5 minutes (routines courtes)", value: '5min', emoji: "🧘", color: theme.colors.accent, bgColor: `${theme.colors.accent}15`, description: "Équilibre efficacité/résultats" },
      { label: "10-15 min (transformation réelle)", value: '15min', emoji: "⏰", color: theme.colors.primary, bgColor: theme.colors.chipBg, description: "Changement profond et durable" },
    ],
    type: "single"
  }
];

export default function ConversationalOnboarding() {
  const navigation = useNavigation();
  const { updateUser } = useUserStore();
  const { setHabits } = useHabitsStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
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
  }, [currentStep]);

  const handleAnswer = (questionId, answer) => {
    // Animation de sortie douce
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      const newAnswers = { ...answers, [questionId]: answer };
      setAnswers(newAnswers);

      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        finishOnboarding(newAnswers);
      }
    });
  };

  const finishOnboarding = async (answers) => {
    // Logique existante préservée
    const objectives = answers[1] ? [answers[1]] : [];
    const workingHours = answers[2] || 'flexible';
    const environment = answers[3] || 'office';
    const stressLevel = answers[4] || 'medium';
    const productiveTime = answers[5] || 'morning';
    const preferredBreak = answers[6] || 'meditation';
    const timeAvailable = answers[7] || '≤2min';

    const preferences = {
      workingHours: getWorkingHoursConfig(workingHours),
      environment,
      stressLevel,
      productiveTime,
      preferredBreak,
      reminderTime: getReminderTime(productiveTime),
      breakPreferences: getBreakPreferences(preferredBreak, stressLevel),
      notifications: {
        enabled: true,
        contextual: true,
        frequency: stressLevel === 'high' || stressLevel === 'critical' ? 'high' : 'smart'
      }
    };

    await updateUser({
      objectives,
      timeAvailable,
      preferences,
      hasOnboarded: true,
      behaviorData: {
        mostActiveHours: [getActiveHour(productiveTime)],
        preferredActivities: {},
        completionRate: 0,
        stressPatterns: [{ level: stressLevel, timestamp: new Date().toISOString() }]
      }
    });

    const filteredHabits = getSmartHabitSelection(objectives, preferences, timeAvailable);
    setHabits(filteredHabits);
    
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  // Fonctions utilitaires préservées
  const getWorkingHoursConfig = (type) => {
    switch(type) {
      case '9-17': return { start: 9, end: 17, flexible: false };
      case 'flexible': return { start: 8, end: 19, flexible: true };
      case 'irregular': return { start: 6, end: 23, flexible: true };
      case 'night': return { start: 20, end: 6, flexible: false };
      default: return { start: 9, end: 17, flexible: false };
    }
  };

  const getReminderTime = (productiveTime) => {
    switch(productiveTime) {
      case 'early-morning': return { hour: 6, minute: 30 };
      case 'morning': return { hour: 9, minute: 15 };
      case 'afternoon': return { hour: 14, minute: 0 };
      case 'evening': return { hour: 18, minute: 30 };
      default: return { hour: 9, minute: 0 };
    }
  };

  const getBreakPreferences = (mainPref, stressLevel) => {
    const base = [mainPref];
    if (stressLevel === 'high' || stressLevel === 'critical') {
      base.push('meditation', 'breathing');
    }
    if (mainPref !== 'movement') {
      base.push('stretch');
    }
    return [...new Set(base)];
  };

  const getActiveHour = (productiveTime) => {
    switch(productiveTime) {
      case 'early-morning': return 7;
      case 'morning': return 10;
      case 'afternoon': return 15;
      case 'evening': return 19;
      default: return 10;
    }
  };

  const getSmartHabitSelection = (objectives, preferences, timeAvailable) => {
    const mapping = {
      'énergie': ['Énergie'],
      'mental': ['Humeur', 'Stress'],
      'productivité': ['Énergie', 'Focus'],
      'sommeil': ['Sommeil'],
    };

    const wantedCategories = new Set(
      objectives.flatMap((o) => mapping[o] || [])
    );

    const timeFilter = timeAvailable === '≤2min' ? 
      (h) => h.duration.includes('min') && parseInt(h.duration) <= 2 :
      timeAvailable === '5min' ?
      (h) => h.duration.includes('min') && parseInt(h.duration) <= 5 :
      () => true;

    const breakFilter = (h) => {
      if (preferences.preferredBreak === 'meditation') {
        return h.tags?.includes('meditation') || h.category === 'Stress';
      }
      if (preferences.preferredBreak === 'movement') {
        return h.tags?.includes('movement') || h.category === 'Énergie';
      }
      return true;
    };

    return allHabits.filter((h) => 
      wantedCategories.has(h.category) && 
      timeFilter(h) && 
      breakFilter(h)
    );
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.colors.bg,
      background: `linear-gradient(135deg, ${theme.colors.bg} 0%, ${theme.colors.chipBg} 100%)`
    }}>
      {/* Éléments de fond organiques pour réduire le stress */}
      <View style={{
        position: 'absolute',
        top: theme.spacing(10),
        left: theme.spacing(10),
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: `${theme.colors.accent}30`,
        opacity: 0.3
      }} />
      <View style={{
        position: 'absolute',
        bottom: theme.spacing(10),
        right: theme.spacing(10),
        width: 360,
        height: 360,
        borderRadius: 180,
        backgroundColor: theme.colors.chipBg,
        opacity: 0.4
      }} />

      <ScrollView contentContainerStyle={{ 
        padding: theme.spacing(3), 
        paddingTop: theme.spacing(6) 
      }}>
        {/* Header - Design thérapeutique */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing(4) }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: PSYCHOLOGY.borderRadius.comfort,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing(2),
            ...PSYCHOLOGY.shadows.warm
          }}>
            <Image source={logoSource} style={{ width: 50, height: 50 }} resizeMode="contain" />
          </View>
          <Text style={{ 
            marginTop: theme.spacing(1), 
            color: theme.colors.ink, 
            fontSize: 28, 
            fontWeight: '700',
            textAlign: 'center'
          }}>
            Votre Assistant Bien-être
          </Text>
          <Text style={{ 
            color: theme.colors.sub, 
            fontSize: 16, 
            fontWeight: '500',
            textAlign: 'center',
            marginTop: 4
          }}>
            Créons ensemble votre parcours personnalisé
          </Text>
        </View>

        {/* Progress bar scientifiquement optimisée */}
        <View style={{ marginBottom: theme.spacing(4) }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: theme.spacing(2)
          }}>
            <Text style={{ 
              color: theme.colors.ink, 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              Étape {currentStep + 1} sur {questions.length}
            </Text>
            <Text style={{ 
              color: theme.colors.primary, 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              {Math.round(progress)}% complété
            </Text>
          </View>
          <View style={{ 
            height: 8, 
            backgroundColor: theme.colors.chipBg, 
            borderRadius: PSYCHOLOGY.borderRadius.gentle,
            overflow: 'hidden'
          }}>
            <Animated.View style={{ 
              height: '100%', 
              width: `${progress}%`, 
              backgroundColor: theme.colors.primary,
              borderRadius: PSYCHOLOGY.borderRadius.gentle,
              ...PSYCHOLOGY.shadows.warm
            }} />
          </View>
        </View>

        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}>
          {/* Question Card - Formes thérapeutiques */}
          <View style={{
            backgroundColor: theme.colors.card,
            padding: theme.spacing(4),
            borderRadius: PSYCHOLOGY.borderRadius.comfort,
            marginBottom: theme.spacing(3),
            ...PSYCHOLOGY.shadows.soft
          }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '700', 
              color: theme.colors.ink, 
              marginBottom: theme.spacing(2),
              textAlign: 'center',
              lineHeight: 32
            }}>
              {currentQuestion.text}
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: theme.colors.sub, 
              textAlign: 'center',
              marginBottom: theme.spacing(4),
              lineHeight: 22,
              fontWeight: '500'
            }}>
              {currentQuestion.subtitle}
            </Text>

            {/* Options avec couleurs scientifiquement optimisées */}
            <View style={{ marginBottom: theme.spacing(2) }}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option.value;
                
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleAnswer(currentQuestion.id, option.value)}
                    style={{
                      backgroundColor: isSelected ? option.bgColor : theme.colors.card,
                      padding: theme.spacing(3),
                      borderRadius: PSYCHOLOGY.borderRadius.gentle,
                      marginBottom: theme.spacing(2),
                      flexDirection: 'row',
                      alignItems: 'center',
                      ...PSYCHOLOGY.shadows.soft,
                      borderWidth: 2,
                      borderColor: isSelected ? option.color : theme.colors.chipBorder,
                      transform: [{ scale: isSelected ? 0.98 : 1 }]
                    }}
                  >
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: PSYCHOLOGY.borderRadius.energy,
                      backgroundColor: option.color,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(3),
                      ...PSYCHOLOGY.shadows.warm
                    }}>
                      <Text style={{ fontSize: 28 }}>
                        {option.emoji}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: isSelected ? option.color : theme.colors.ink, 
                        fontWeight: '700', 
                        fontSize: 16,
                        marginBottom: 4
                      }}>
                        {option.label}
                      </Text>
                      <Text style={{ 
                        color: isSelected ? option.color : theme.colors.sub, 
                        fontSize: 13,
                        fontWeight: '500'
                      }}>
                        {option.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={28} color={option.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Navigation améliorée */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {currentStep > 0 && (
              <TouchableOpacity
                onPress={() => setCurrentStep(currentStep - 1)}
                style={{
                  paddingVertical: theme.spacing(2),
                  paddingHorizontal: theme.spacing(3),
                  borderRadius: PSYCHOLOGY.borderRadius.gentle,
                  backgroundColor: theme.colors.chipBg,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="chevron-back" size={20} color={theme.colors.sub} />
                <Text style={{ 
                  color: theme.colors.sub, 
                  fontWeight: '600', 
                  marginLeft: 4,
                  fontSize: 16
                }}>
                  Précédent
                </Text>
              </TouchableOpacity>
            )}
            
            {currentStep === questions.length - 1 && answers[currentQuestion.id] && (
              <TouchableOpacity
                onPress={() => finishOnboarding(answers)}
                style={{
                  paddingVertical: theme.spacing(3),
                  paddingHorizontal: theme.spacing(4),
                  borderRadius: PSYCHOLOGY.borderRadius.gentle,
                  backgroundColor: theme.colors.primary,
                  marginLeft: 'auto',
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...PSYCHOLOGY.shadows.warm
                }}
              >
                <Text style={{ 
                  color: theme.colors.primaryInk, 
                  fontWeight: '700', 
                  marginRight: 6,
                  fontSize: 16
                }}>
                  Créer mon profil
                </Text>
                <Ionicons name="sparkles" size={20} color={theme.colors.primaryInk} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Social proof thérapeutique */}
        <View style={{ marginTop: theme.spacing(4), alignItems: 'center' }}>
          <Text style={{ 
            color: theme.colors.sub, 
            fontSize: 14, 
            fontWeight: '500',
            textAlign: 'center'
          }}>
            ✨ Rejoignez plus de{' '}
            <Text style={{ fontWeight: '700', color: theme.colors.primary }}>
              50,000 professionnels
            </Text>
            {' '}qui transforment leur quotidien
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}