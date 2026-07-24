// screens/EnhancedDiagnosticScreen.js - VERSION CORRIGÉE
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../store/useUserStore';
import useHabitsStore from '../store/useHabitsStore';
import { getPersonalizedTechniques } from '../utils/stressAnalysis';
import theme from '../theme';

// Questions PSS-4
const stressQuestions = [
  {
    id: 1,
    text: "Au cours du dernier mois, à quelle fréquence avez-vous senti que vous ne pouviez pas contrôler les choses importantes de votre vie ?",
    dimension: "control",
    options: [
      { label: "Jamais", value: 0, color: "#4CAF50" },
      { label: "Presque jamais", value: 1, color: "#8BC34A" },
      { label: "Parfois", value: 2, color: "#FFC107" },
      { label: "Assez souvent", value: 3, color: "#FF9800" },
      { label: "Très souvent", value: 4, color: "#F44336" }
    ]
  },
  {
    id: 2,
    text: "Au cours du dernier mois, à quelle fréquence vous êtes-vous senti(e) confiant(e) dans votre capacité à gérer vos problèmes personnels ?",
    dimension: "confidence",
    options: [
      { label: "Très souvent", value: 0, color: "#4CAF50" },
      { label: "Assez souvent", value: 1, color: "#8BC34A" },
      { label: "Parfois", value: 2, color: "#FFC107" },
      { label: "Presque jamais", value: 3, color: "#FF9800" },
      { label: "Jamais", value: 4, color: "#F44336" }
    ]
  },
  {
    id: 3,
    text: "Au cours du dernier mois, à quelle fréquence avez-vous senti que les choses allaient comme vous le souhaitiez ?",
    dimension: "satisfaction",
    options: [
      { label: "Très souvent", value: 0, color: "#4CAF50" },
      { label: "Assez souvent", value: 1, color: "#8BC34A" },
      { label: "Parfois", value: 2, color: "#FFC107" },
      { label: "Presque jamais", value: 3, color: "#FF9800" },
      { label: "Jamais", value: 4, color: "#F44336" }
    ]
  },
  {
    id: 4,
    text: "Au cours du dernier mois, à quelle fréquence avez-vous trouvé que vous ne pouviez pas faire face à toutes les choses que vous aviez à faire ?",
    dimension: "overwhelm",
    options: [
      { label: "Jamais", value: 0, color: "#4CAF50" },
      { label: "Presque jamais", value: 1, color: "#8BC34A" },
      { label: "Parfois", value: 2, color: "#FFC107" },
      { label: "Assez souvent", value: 3, color: "#FF9800" },
      { label: "Très souvent", value: 4, color: "#F44336" }
    ]
  }
];

// Questions PERMA
const permaQuestions = [
  {
    id: 5,
    key: 'positiveEmotions',
    dimension: 'Émotions Positives',
    text: "À quelle fréquence ressentez-vous des émotions positives au quotidien ?",
    explanation: "Les émotions positives élargissent votre champ d'action",
    options: [
      { label: "Rarement", value: 1, emoji: "😢" },
      { label: "Parfois", value: 2, emoji: "😐" },
      { label: "Souvent", value: 3, emoji: "🙂" },
      { label: "Très souvent", value: 4, emoji: "😊" },
      { label: "Presque toujours", value: 5, emoji: "😄" }
    ]
  },
  {
    id: 6,
    key: 'engagement',
    dimension: 'Engagement',
    text: "À quelle fréquence perdez-vous la notion du temps dans votre travail (état de flow) ?",
    explanation: "Le flow prédit votre capacité à vous concentrer profondément",
    options: [
      { label: "Jamais ou presque", value: 1, emoji: "😴" },
      { label: "Rarement", value: 2, emoji: "🤔" },
      { label: "Parfois", value: 3, emoji: "😊" },
      { label: "Souvent", value: 4, emoji: "🎯" },
      { label: "Très souvent", value: 5, emoji: "⚡" }
    ]
  },
  {
    id: 7,
    key: 'relationships',
    dimension: 'Relations',
    text: "Combien de conversations significatives avez-vous par semaine ?",
    explanation: "L'isolement social amplifie le stress perçu",
    options: [
      { label: "Aucune", value: 1, emoji: "😞" },
      { label: "1-2", value: 2, emoji: "🙂" },
      { label: "3-5", value: 3, emoji: "😊" },
      { label: "6-10", value: 4, emoji: "🤗" },
      { label: "Plus de 10", value: 5, emoji: "💬" }
    ]
  },
  {
    id: 8,
    key: 'meaning',
    dimension: 'Sens',
    text: "Votre travail a-t-il un impact positif sur les autres ou la société ?",
    explanation: "Le sens au travail réduit le burnout de 63%",
    options: [
      { label: "Pas du tout", value: 1, emoji: "😔" },
      { label: "Un peu", value: 2, emoji: "😕" },
      { label: "Modérément", value: 3, emoji: "🙂" },
      { label: "Beaucoup", value: 4, emoji: "😊" },
      { label: "Énormément", value: 5, emoji: "🌟" }
    ]
  },
  {
    id: 9,
    key: 'accomplishment',
    dimension: 'Accomplissement',
    text: "À quelle fréquence atteignez-vous vos objectifs professionnels ?",
    explanation: "Les petites victoires régulières boostent la résilience",
    options: [
      { label: "Rarement", value: 1, emoji: "😞" },
      { label: "Parfois", value: 2, emoji: "😕" },
      { label: "Souvent", value: 3, emoji: "🙂" },
      { label: "Presque toujours", value: 4, emoji: "😊" },
      { label: "Toujours", value: 5, emoji: "🏆" }
    ]
  }
];

// Chronotype
const chronotypeQuestions = [
  {
    id: 10,
    key: 'chronotype',
    text: "À quel moment de la journée vous sentez-vous le plus alerte et productif ?",
    explanation: "Votre rythme circadien influence l'efficacité des techniques",
    options: [
      { 
        label: "Très tôt le matin (5h-8h)", 
        value: 'extreme-morning', 
        emoji: "🌅",
        description: "Alouette prononcée"
      },
      { 
        label: "Le matin (8h-12h)", 
        value: 'morning', 
        emoji: "☀️",
        description: "Type matinal"
      },
      { 
        label: "L'après-midi (12h-17h)", 
        value: 'afternoon', 
        emoji: "🌤️",
        description: "Type intermédiaire"
      },
      { 
        label: "Le soir (17h-22h)", 
        value: 'evening', 
        emoji: "🌆",
        description: "Type vespéral"
      },
      { 
        label: "Tard le soir/nuit (22h-2h)", 
        value: 'extreme-evening', 
        emoji: "🌙",
        description: "Hibou prononcé"
      }
    ]
  },
  {
    id: 11,
    key: 'sleep-debt',
    text: "Actuellement, combien d'heures de sommeil vous manque-t-il par nuit ?",
    explanation: "La dette de sommeil amplifie le stress de 340%",
    options: [
      { label: "Aucune (7-9h/nuit)", value: 0, emoji: "😴", color: "#4CAF50" },
      { label: "< 1 heure", value: 1, emoji: "😪", color: "#8BC34A" },
      { label: "1-2 heures", value: 2, emoji: "😓", color: "#FFC107" },
      { label: "2-3 heures", value: 3, emoji: "😵", color: "#FF9800" },
      { label: "> 3 heures", value: 4, emoji: "🆘", color: "#F44336" }
    ]
  }
];

export default function EnhancedDiagnosticScreen({ route }) {
  const navigation = useNavigation();
  const { user, updateUser } = useUserStore();
  const { setHabits } = useHabitsStore();
  
  // 🔥 Détecter si c'est un retake (depuis route.params)
  const isRetake = route?.params?.isRetake || false;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [stressScore, setStressScore] = useState(0);
  const [permaScores, setPermaScores] = useState({});
  const [chronotypeData, setChronotypeData] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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

  const allQuestions = [...stressQuestions, ...permaQuestions, ...chronotypeQuestions];
  const currentQuestion = allQuestions[currentStep];
  const totalSteps = allQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (answer) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 200, useNativeDriver: true })
    ]).start(() => {
      if (currentStep < 4) {
        setStressScore(prev => prev + answer);
      } else if (currentStep < 9) {
        setPermaScores(prev => ({
          ...prev,
          [currentQuestion.key]: answer
        }));
      } else {
        setChronotypeData(prev => ({
          ...prev,
          [currentQuestion.key]: answer
        }));
      }
      
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        generateAdvancedDiagnostic(answer);
      }
    });
  };

  const generateAdvancedDiagnostic = async (lastAnswer) => {
    setIsAnalyzing(true);
    
    const finalChronotypeData = {
      ...chronotypeData,
      [currentQuestion.key]: lastAnswer
    };
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const stressLevel = getStressLevel(stressScore);
    const wellbeingProfile = calculateWellbeingProfile(permaScores);
    const optimalTiming = calculateOptimalTiming(finalChronotypeData);
    
    const personalizedData = await getPersonalizedTechniques(stressScore, {
      permaProfile: wellbeingProfile,
      chronotype: finalChronotypeData.chronotype,
      sleepDebt: finalChronotypeData['sleep-debt']
    });
    
    // 🔥 Mise à jour profil utilisateur
    await updateUser({
      hasOnboarded: true,
      stressProfile: {
        score: stressScore,
        level: stressLevel,
        pssBreakdown: {
          control: stressQuestions[0].dimension,
          confidence: stressQuestions[1].dimension,
          satisfaction: stressQuestions[2].dimension,
          overwhelm: stressQuestions[3].dimension
        },
        completedAt: new Date().toISOString(), // 🔥 Date de complétion
        lastAssessment: new Date().toISOString()
      },
      wellbeingProfile: wellbeingProfile,
      chronotype: {
        type: finalChronotypeData.chronotype,
        optimalPerformanceWindow: optimalTiming.peak,
        worstPerformanceWindow: optimalTiming.trough,
        recommendedTechniqueTimings: optimalTiming.recommendations
      },
      sleepHealth: {
        currentDebt: finalChronotypeData['sleep-debt'],
        needsRecoveryProtocol: finalChronotypeData['sleep-debt'] >= 2
      },
      preferences: {
        ...user.preferences,
        optimalTiming: optimalTiming,
        notificationsEnabled: true
      }
    });

    const allTechniques = [...personalizedData.freeTechniques, ...personalizedData.premiumTechniques];
    setHabits(allTechniques);
    
    // 🔥 Navigation selon contexte
    if (isRetake) {
      // Retour à l'écran principal après retake
      navigation.navigate('Main', { 
        screen: 'Profile',
        params: {
          screen: 'ProfileMain',
          params: { refreshed: true }
        }
      });
    } else {
      // Premier diagnostic → Résultats complets
      navigation.navigate('DiagnosticResults', { 
        stressLevel,
        score: stressScore,
        wellbeingProfile,
        chronotypeData: finalChronotypeData,
        optimalTiming,
        personalizedData,
        firstTechnique: personalizedData.recommendedFirst
      });
    }
  };

  const getStressLevel = (score) => {
    if (score <= 4) return 'low';
    if (score <= 8) return 'moderate';
    if (score <= 12) return 'high';
    return 'critical';
  };

  const calculateWellbeingProfile = (scores) => {
    const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
    const avgScore = totalScore / Object.keys(scores).length;
    
    const weakestDimension = Object.entries(scores)
      .sort((a, b) => a[1] - b[1])[0];
    
    const strongestDimension = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      overallScore: avgScore,
      level: avgScore >= 4 ? 'thriving' : avgScore >= 3 ? 'moderate' : 'struggling',
      positiveEmotions: scores.positiveEmotions || 3,
      engagement: scores.engagement || 3,
      relationships: scores.relationships || 3,
      meaning: scores.meaning || 3,
      accomplishment: scores.accomplishment || 3,
      weakestDimension: {
        name: weakestDimension[0],
        score: weakestDimension[1]
      },
      strongestDimension: {
        name: strongestDimension[0],
        score: strongestDimension[1]
      },
      recommendations: generatePermaRecommendations(weakestDimension[0])
    };
  };

  const generatePermaRecommendations = (weakness) => {
    const recommendations = {
      positiveEmotions: "Gratitude quotidienne, célébration petites victoires",
      engagement: "Techniques de focus et flow (NSDR, tunnel visuel)",
      relationships: "Rituel de transition travail-maison, communication consciente",
      meaning: "Gratitude quotidienne, réflexion sur impact",
      accomplishment: "Célébration petites victoires, objectifs SMART"
    };
    return recommendations[weakness] || "Équilibre général";
  };

  const calculateOptimalTiming = (chronotypeData) => {
    const type = chronotypeData.chronotype;
    
    const timingProfiles = {
      'extreme-morning': {
        peak: '6h-10h',
        trough: '14h-16h',
        recommendations: {
          techniques: 'Matin: techniques activantes. Après-midi: NSDR/sieste',
          notifications: '6h30 (réveil), 14h30 (creux circadien)'
        }
      },
      'morning': {
        peak: '9h-12h',
        trough: '14h-16h',
        recommendations: {
          techniques: 'Matin: focus. Après-midi: récupération',
          notifications: '9h00, 15h00'
        }
      },
      'afternoon': {
        peak: '14h-18h',
        trough: '9h-11h',
        recommendations: {
          techniques: 'Matin: activation douce. Après-midi: performance',
          notifications: '10h00, 16h00'
        }
      },
      'evening': {
        peak: '18h-22h',
        trough: '6h-10h',
        recommendations: {
          techniques: 'Matin: activation forte. Soir: techniques calmes',
          notifications: '8h00, 19h00'
        }
      },
      'extreme-evening': {
        peak: '20h-24h',
        trough: '6h-12h',
        recommendations: {
          techniques: 'Réveil: activation intense. Soir: éviter stimulation',
          notifications: '10h00, 20h00'
        }
      }
    };
    
    return timingProfiles[type] || timingProfiles['afternoon'];
  };

  if (isAnalyzing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.bg, padding: theme.spacing(3) }}>
        <Animated.View style={{ alignItems: 'center', opacity: fadeAnim }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing(4)
          }}>
            <Ionicons name="analytics-outline" size={50} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.ink, textAlign: 'center', marginBottom: theme.spacing(2) }}>
            Analyse Avancée en Cours
          </Text>
          <Text style={{ fontSize: 16, color: theme.colors.sub, textAlign: 'center', lineHeight: 24, paddingHorizontal: theme.spacing(3) }}>
            • Profil de stress PSS-4{'\n'}
            • Bien-être psychologique PERMA{'\n'}
            • Optimisation circadienne{'\n'}
            • Sélection techniques IA
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={{ padding: theme.spacing(3), paddingTop: theme.spacing(6), paddingBottom: theme.spacing(6) }}>
      {/* Progress bar */}
      <View style={{ marginBottom: theme.spacing(4) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing(2) }}>
          <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: '600' }}>
            Question {currentStep + 1} sur {totalSteps}
          </Text>
          <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600' }}>
            {Math.round(progress)}%
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: theme.colors.chipBg, borderRadius: 4, overflow: 'hidden' }}>
          <Animated.View style={{ height: '100%', width: `${progress}%`, backgroundColor: theme.colors.primary, borderRadius: 4 }} />
        </View>
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <View style={{
          backgroundColor: theme.colors.card,
          padding: theme.spacing(4),
          borderRadius: 20,
          marginBottom: theme.spacing(3),
          ...theme.psychology.shadows.soft,
        }}>
          {currentQuestion.dimension && (
            <View style={{
              backgroundColor: theme.colors.chipBg,
              paddingHorizontal: theme.spacing(2),
              paddingVertical: theme.spacing(1),
              borderRadius: 12,
              alignSelf: 'flex-start',
              marginBottom: theme.spacing(2)
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.accent }}>
                {currentQuestion.dimension}
              </Text>
            </View>
          )}

          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.ink, marginBottom: theme.spacing(2), lineHeight: 30 }}>
            {currentQuestion.text}
          </Text>
          
          {currentQuestion.explanation && (
            <View style={{ 
              flexDirection: 'row', 
              backgroundColor: theme.colors.chipBg, 
              padding: theme.spacing(2), 
              borderRadius: 12, 
              marginBottom: theme.spacing(3),
              alignItems: 'center'
            }}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.accent} />
              <Text style={{ fontSize: 13, color: theme.colors.sub, marginLeft: theme.spacing(1), flex: 1, lineHeight: 18 }}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}

          <View>
            {currentQuestion.options.map((option, index) => {
              const isStressQuestion = currentStep < 4;
              const bgColor = isStressQuestion 
                ? `${option.color}15` 
                : theme.colors.card;
              const borderColor = isStressQuestion 
                ? `${option.color}50` 
                : theme.colors.chipBorder;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswer(option.value)}
                  style={{
                    backgroundColor: bgColor,
                    padding: theme.spacing(3),
                    borderRadius: 12,
                    marginBottom: theme.spacing(2),
                    borderWidth: 1,
                    borderColor: borderColor,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  {option.emoji && (
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: theme.colors.chipBg,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2)
                    }}>
                      <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
                    </View>
                  )}
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      color: isStressQuestion ? option.color : theme.colors.ink, 
                      fontWeight: '600', 
                      fontSize: 16,
                      marginBottom: option.description ? 4 : 0
                    }}>
                      {option.label}
                    </Text>
                    {option.description && (
                      <Text style={{ fontSize: 13, color: theme.colors.sub }}>
                        {option.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {currentStep > 0 && currentStep <= 3 && (
          <View style={{
            backgroundColor: theme.colors.card,
            padding: theme.spacing(2),
            borderRadius: 12,
            alignItems: 'center',
            ...theme.psychology.shadows.soft
          }}>
            <Text style={{ fontSize: 14, color: theme.colors.sub, marginBottom: 4 }}>
              Score de stress actuel
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: getStressScoreColor(stressScore) }}>
              {stressScore} / 16
            </Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );

  function getStressScoreColor(score) {
    if (score <= 4) return '#4CAF50';
    if (score <= 8) return '#FFC107';
    if (score <= 12) return '#FF9800';
    return '#F44336';
  }
}