// screens/SmartHomeScreen.js - VERSION OPTIMISÉE FINALE
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import useUserStore from "../store/useUserStore";
import useHabitsStore from "../store/useHabitsStore";
import biometricService from "../services/biometricService";
import intelligentRecommendationsService from "../services/intelligentRecommendationsService";
import contextualDataService from "../services/contextualDataService";
import smartNotifications from "../services/smartNotifications";
import theme from "../theme/enhancedTheme";

// 🔥 CACHE INTELLIGENT
const DATA_CACHE = {
  biometric: { data: null, timestamp: null, ttl: 60 * 60 * 1000 },
  context: { data: null, timestamp: null, ttl: 30 * 60 * 1000 },
  hrvMorning: { data: null, date: null }
};

const isCacheValid = (cacheKey) => {
  const cache = DATA_CACHE[cacheKey];
  if (!cache.data || !cache.timestamp) return false;
  return (Date.now() - cache.timestamp) < cache.ttl;
};

const isHRVMorningCacheValid = () => {
  const cache = DATA_CACHE.hrvMorning;
  if (!cache.data || !cache.date) return false;
  return cache.date === new Date().toDateString();
};

export default function SmartHomeScreen() {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const { habits } = useHabitsStore();
  
  const [biometricData, setBiometricData] = useState(null);
  const [biometricStatus, setBiometricStatus] = useState('checking');
  const [contextualData, setContextualData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectingBiometric, setIsConnectingBiometric] = useState(false);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFullContext();
    }, [])
  );

  const loadFullContext = async () => {
    setIsLoading(true);
    
    try {
      console.log('📊 Chargement contexte avec cache...');
      
      // 1. DONNÉES BIOMÉTRIQUES
      let bioData = null;
      
      if (isCacheValid('biometric')) {
        console.log('✅ Biométrie depuis cache');
        bioData = DATA_CACHE.biometric.data;
      } else {
        console.log('🔄 Rafraîchissement biométrie...');
        try {
          const status = await biometricService.checkStatus();
          setBiometricStatus(status.isConnected ? 'connected' : 'disconnected');
          
          if (status.platform === 'GoogleFit' && status.isConnected) {
            const [sleepData, restingHR] = await Promise.all([
              biometricService.getSleepData().catch(e => ({ success: false })),
              biometricService.getRestingHR().catch(e => ({ success: false }))
            ]);
            
            // HRV DUAL avec cache
            let hrvDual;
            if (isHRVMorningCacheValid()) {
              console.log('✅ HRV Morning depuis cache journalier');
              const cachedMorning = DATA_CACHE.hrvMorning.data;
              const current = await biometricService.getHRVCurrent();
              
              hrvDual = {
                morning: cachedMorning,
                current: current.success ? current : null,
                hasBaseline: !!cachedMorning,
                hasCurrent: current.success
              };
              
              if (cachedMorning && current.success) {
                const deviation = ((current.value - cachedMorning.value) / cachedMorning.value) * 100;
                hrvDual.deviation = {
                  percentage: Math.round(deviation),
                  absolute: current.value - cachedMorning.value,
                  status: biometricService.getDeviationStatus(deviation),
                  interpretation: biometricService.getDeviationInterpretation(deviation)
                };
              }
            } else {
              console.log('🔄 Refresh HRV Dual complet');
              hrvDual = await biometricService.getHRVDual();
              
              if (hrvDual.morning) {
                DATA_CACHE.hrvMorning = {
                  data: hrvDual.morning,
                  date: new Date().toDateString()
                };
                console.log('💾 HRV Morning mis en cache');
              }
            }
            
            if (sleepData.success && restingHR.success) {
              const hrvValue = hrvDual?.morning?.value || hrvDual?.current?.value || null;
              const hrvStatus = hrvValue ? biometricService.getHRVQuality(hrvValue) : 'unavailable';
              
              const stressScore = await biometricService.calculateStressScore(
                sleepData, 
                restingHR, 
                { value: hrvValue, status: hrvStatus }
              );
              
              bioData = {
                sleep: sleepData,
                restingHR: restingHR,
                hrv: { value: hrvValue, status: hrvStatus },
                hrvDual: hrvDual,
                stressScore: stressScore,
                isConnected: true,
                lastUpdate: new Date().toISOString()
              };
              
              DATA_CACHE.biometric = {
                data: bioData,
                timestamp: Date.now(),
                ttl: DATA_CACHE.biometric.ttl
              };
              
              console.log('✅ Biométrie chargée');
            } else {
              bioData = { isConnected: false, reason: 'incomplete_data' };
              setBiometricStatus('error');
            }
          } else {
            bioData = { isConnected: false, reason: 'not_connected' };
            setBiometricStatus('disconnected');
          }
        } catch (bioError) {
          console.warn('⚠️ Erreur biométrie:', bioError.message);
          bioData = { isConnected: false, reason: 'error' };
          setBiometricStatus('error');
        }
      }
      
      setBiometricData(bioData);
      
      // 2. CONTEXTE ENVIRONNEMENTAL
      let contextData = null;
      
      if (isCacheValid('context')) {
        console.log('✅ Contexte depuis cache');
        contextData = DATA_CACHE.context.data;
      } else {
        console.log('🔄 Rafraîchissement contexte...');
        try {
          contextData = await contextualDataService.getFullContext();
          
          DATA_CACHE.context = {
            data: contextData,
            timestamp: Date.now(),
            ttl: DATA_CACHE.context.ttl
          };
          
          console.log('✅ Contexte chargé');
        } catch (contextError) {
          console.warn('⚠️ Erreur contexte:', contextError.message);
          contextData = {
            weather: contextualDataService.getMockWeather(),
            location: null,
            calendar: null,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      setContextualData(contextData);
      
      // 3. RECOMMANDATIONS
      console.log('🎯 Génération recommandations...');
      
      if (bioData?.isConnected || user.stressProfile || user.wellbeingProfile) {
        try {
          const smartRecs = await intelligentRecommendationsService.generateSmartRecommendations(
            bioData || {},
            contextData || {},
            user.history || [],
            user
          );
          
          // 🔥 DEBUG: Voir la structure des recommandations
          console.log('📋 Recommandations brutes:', JSON.stringify(smartRecs, null, 2));
          
          console.log(`✅ ${smartRecs.length} recommandations reçues`);
          setRecommendations(smartRecs);
        } catch (recError) {
          console.error('❌ Erreur recommandations:', recError);
          setRecommendations([]);
        }
      } else {
        console.warn('⚠️ Données insuffisantes pour recommandations');
        setRecommendations([]);
      }
      
      console.log('✅ Chargement terminé');
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      
      setBiometricData({ isConnected: false, reason: 'error' });
      setBiometricStatus('error');
      setContextualData({
        weather: contextualDataService.getMockWeather(),
        location: null,
        calendar: null,
        timestamp: new Date().toISOString()
      });
      setRecommendations([]);
      
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 CONNEXION GOOGLE FIT
  const handleConnectBiometric = async () => {
    setIsConnectingBiometric(true);
    
    try {
      const result = await biometricService.initialize();
      
      if (result.success && result.platform === 'GoogleFit') {
        Alert.alert(
          '✅ Connexion réussie',
          'Google Fit est maintenant connecté. Récupération des données...',
          [{ text: 'OK', onPress: () => {
            DATA_CACHE.biometric = { data: null, timestamp: null, ttl: 60 * 60 * 1000 };
            DATA_CACHE.hrvMorning = { data: null, date: null };
            loadFullContext();
          }}]
        );
      } else {
        Alert.alert(
          '⚠️ Connexion impossible',
          'Veuillez accepter les permissions Google Fit dans les paramètres Android.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: () => handleConnectBiometric() }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setIsConnectingBiometric(false);
    }
  };

  const handlePanicMode = async () => {
    console.log('🚨 Mode Panic activé');
    
    // Technique d'urgence immédiate
    const emergencyTechnique = {
      id: 'physiological-sigh',
      title: 'Soupir Physiologique',
      category: 'breathing',
      duration: 1,
      isPremium: false,
      description: 'Technique d\'urgence pour stress aigu. Double inspiration suivie d\'une longue expiration pour calmer instantanément le système nerveux.',
      instructions: [
        'Prends une grande inspiration par le nez',
        'Sans expirer, prends une deuxième petite inspiration',
        'Expire lentement et complètement par la bouche',
        'Répète 2-3 fois'
      ],
      scientificBasis: 'Active le nerf vague et réduit la réponse au stress en 90 secondes',
      benefits: ['Réduit stress aigu', 'Calme instantané', 'Reset physiologique']
    };
    
    // Log pour analytics
    try {
      await AsyncStorage.setItem('last_panic_mode', new Date().toISOString());
    } catch (error) {
      console.error('Erreur log panic:', error);
    }
    
    // Navigation immédiate vers la technique
    navigation.navigate('HabitDetail', { 
      habit: emergencyTechnique,
      fromPanic: true,
      panicContext: {
        timestamp: new Date().toISOString(),
        hrvData: biometricData?.hrvDual || null
      }
    });
  };

  const handleRecommendationPress = (rec) => {
    console.log('🎯 Recommandation cliquée:', rec.type);
    
    // 🔥 DEBUG: Vérifier structure
    console.log('📋 Structure rec:', JSON.stringify(rec, null, 2));
    
    if (rec.techniques && rec.techniques.length > 0) {
      const topTechnique = rec.techniques[0];
      
      if (topTechnique.isPremium && !user.isPremium) {
        navigation.navigate('PremiumPaywall', {
          source: 'recommendation',
          technique: topTechnique
        });
        return;
      }
      
      navigation.navigate('HabitDetail', { 
        habit: topTechnique,
        fromRecommendation: true,
        recommendationContext: {
          priority: rec.priority,
          reason: rec.reason,
          matchScore: topTechnique.matchScore
        }
      });
    } else {
      navigation.navigate('TechniquesLibrary', {
        filterType: rec.type,
        recommendation: rec
      });
    }
  };

  const handleMentalScorePress = () => {
    const daysSince = calculateDaysSince(user.stressProfile?.completedAt);
    
    if (daysSince >= 14) {
      // Refaire le test - Navigation vers le wizard de diagnostic
      navigation.navigate('StressDiagnostic', { isRetake: true });
    } else {
      // Voir détails
      navigation.navigate('MentalDetails', { user });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user.name || 'là';
    
    if (hour < 12) return `Bonjour ${name}`;
    if (hour < 18) return `Bon après-midi ${name}`;
    return `Bonsoir ${name}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Analyse en cours...</Text>
      </View>
    );
  }

  // 🔥 LOGIQUE D'AFFICHAGE OPTIMISÉE
  const showBiometricFirst = biometricData?.isConnected && biometricData?.hrvDual?.deviation;
  const showMentalScore = user.stressProfile && user.wellbeingProfile;
  const daysSinceTest = calculateDaysSince(user.stressProfile?.completedAt);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>
              {recommendations.length > 0 ? `${recommendations.length} recommandations pour toi` : 'Ton tableau de bord'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.ink} />
          </TouchableOpacity>
        </View>

        {/* 🔥 PRIORITÉ 1: BIOMÉTRIE LIVE (si données disponibles ET déviation) */}
        {showBiometricFirst && (
          <TouchableOpacity
            style={[
              styles.primaryCard,
              biometricData.hrvDual.deviation.percentage < -10 
                ? styles.primaryCardAlert 
                : styles.primaryCardNormal
            ]}
            onPress={() => navigation.navigate('BiometricDetails', { biometricData, contextualData })}
            activeOpacity={0.8}
          >
            <View style={styles.primaryCardHeader}>
              <View style={styles.primaryCardIcon}>
                <Ionicons 
                  name={biometricData.hrvDual.deviation.percentage < -10 ? "warning" : "heart"} 
                  size={28} 
                  color={biometricData.hrvDual.deviation.percentage < -10 ? "#EF4444" : "#10B981"} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.primaryCardLabel}>État Physique</Text>
                <Text style={styles.primaryCardTitle}>
                  {typeof biometricData.hrvDual.deviation.interpretation === 'string' 
                    ? biometricData.hrvDual.deviation.interpretation 
                    : biometricData.hrvDual.deviation.interpretation?.message || 'Analyse en cours'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.ink} />
            </View>

            <View style={styles.hrvGrid}>
              <View style={styles.hrvColumn}>
                <Text style={styles.hrvLabel}>HRV Matin</Text>
                <Text style={styles.hrvValue}>
                  {biometricData.hrvDual.morning.value}ms
                </Text>
              </View>
              
              <View style={styles.hrvDivider} />
              
              <View style={styles.hrvColumn}>
                <Text style={styles.hrvLabel}>HRV Actuelle</Text>
                <Text style={styles.hrvValue}>
                  {biometricData.hrvDual.current.value}ms
                </Text>
              </View>
              
              <View style={styles.hrvDivider} />
              
              <View style={styles.hrvColumn}>
                <Text style={styles.hrvLabel}>Évolution</Text>
                <View style={[
                  styles.deviationBadge,
                  { backgroundColor: biometricData.hrvDual.deviation.percentage < -10 ? '#EF4444' : '#10B981' }
                ]}>
                  <Text style={styles.deviationText}>
                    {biometricData.hrvDual.deviation.percentage > 0 ? '+' : ''}
                    {biometricData.hrvDual.deviation.percentage}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.recoveryScoreRow}>
              <Text style={styles.recoveryScoreLabel}>Score de Récupération</Text>
              <Text style={styles.recoveryScoreValue}>
                {biometricData.stressScore?.recoveryScore || 0}/100
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 🔥 PRIORITÉ 2: CONNEXION GOOGLE FIT (si non connecté) */}
        {biometricStatus === 'disconnected' && (
          <TouchableOpacity 
            style={styles.connectBiometricCard}
            onPress={handleConnectBiometric}
            disabled={isConnectingBiometric}
            activeOpacity={0.7}
          >
            <View style={styles.connectBiometricIcon}>
              <Ionicons name="fitness" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.connectBiometricContent}>
              <Text style={styles.connectBiometricTitle}>
                Connecter Google Fit
              </Text>
              <Text style={styles.connectBiometricSubtitle}>
                📊 Recommandations 2× plus précises avec tes données santé
              </Text>
            </View>
            {!isConnectingBiometric ? (
              <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
            ) : (
              <Text style={{ color: theme.colors.primary }}>...</Text>
            )}
          </TouchableOpacity>
        )}

        {/* 🔥 PRIORITÉ 3: SCORE MENTAL (toujours affiché si profil existe) */}
        {showMentalScore && (
          <TouchableOpacity 
            style={[
              styles.mentalScoreCard,
              daysSinceTest >= 14 && styles.mentalScoreCardStale
            ]}
            onPress={handleMentalScorePress}
            activeOpacity={0.7}
          >
            <View style={styles.mentalScoreIcon}>
              <Ionicons 
                name={daysSinceTest >= 14 ? "refresh" : "bulb"} 
                size={24} 
                color={daysSinceTest >= 14 ? theme.colors.accent : theme.colors.primary} 
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={styles.mentalScoreLabel}>Bien-être Mental (PERMA)</Text>
              <Text style={styles.mentalScoreValue}>
                {Math.round(user.wellbeingProfile.overallScore * 20)}/100
              </Text>
              <Text style={styles.mentalScoreDate}>
                {daysSinceTest >= 14 
                  ? `⚠️ Test à refaire (${daysSinceTest} jours)` 
                  : `📅 Évalué il y a ${daysSinceTest} jours`
                }
              </Text>
              {daysSinceTest < 14 && (
                <Text style={styles.mentalScoreSubtext}>
                  📊 Suivi scientifique : évaluations tous les 14j recommandées
                </Text>
              )}
            </View>
            
            <View style={styles.mentalScoreAction}>
              <Text style={styles.mentalScoreActionText}>
                {daysSinceTest >= 14 ? 'Refaire' : 'Voir'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
            </View>
          </TouchableOpacity>
        )}

        {/* 🔥 NOUVEAU : Invitation au test PERMA si jamais fait */}
        {!showMentalScore && !showBiometricFirst && (
          <TouchableOpacity 
            style={styles.permaInvitationCard}
            onPress={() => navigation.navigate('StressDiagnostic')}
            activeOpacity={0.7}
          >
            <View style={styles.permaInvitationIcon}>
              <Ionicons name="analytics" size={32} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.permaInvitationTitle}>
                📊 Évalue ton Bien-être Mental
              </Text>
              <Text style={styles.permaInvitationSubtitle}>
                Test PERMA scientifique • 2 minutes • Suivi personnalisé
              </Text>
              <Text style={styles.permaInvitationDetail}>
                Mesure validée par Seligman (2011) : 5 dimensions du bien-être
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
        )}

        {/* 🔥 NOUVEAU: BOUTON PANIC MODE */}
        <TouchableOpacity 
          style={styles.panicButton}
          onPress={handlePanicMode}
          activeOpacity={0.8}
        >
          <View style={styles.panicButtonContent}>
            <Ionicons name="warning" size={24} color="#FFFFFF" />
            <Text style={styles.panicButtonText}>Mode Urgence</Text>
          </View>
          <Text style={styles.panicButtonSubtext}>
            Je me sens stressé maintenant
          </Text>
        </TouchableOpacity>

        {/* RECOMMANDATIONS */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎯 Pour Toi Maintenant</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TechniquesLibrary')}>
                <Text style={styles.seeAllButton}>Bibliothèque</Text>
              </TouchableOpacity>
            </View>
            
            {recommendations.slice(0, 3).map((rec, index) => (
              <RecommendationCard 
                key={index}
                recommendation={rec}
                onPress={() => handleRecommendationPress(rec)}
                user={user}
              />
            ))}
          </View>
        )}

        {/* CONTEXTE */}
        {contextualData && (
          <View style={styles.contextSection}>
            <Text style={styles.sectionTitle}>🌍 Ton Environnement</Text>
            
            <View style={styles.contextGrid}>
              {contextualData.weather && (
                <View style={styles.contextCard}>
                  <Ionicons name="sunny" size={24} color={theme.colors.primary} />
                  <Text style={styles.contextValue}>
                    {Math.round(contextualData.weather.temperature)}°C
                  </Text>
                  <Text style={styles.contextLabel}>
                    {contextualData.weather.weatherDescription}
                  </Text>
                </View>
              )}

              {contextualData.location && (
                <View style={styles.contextCard}>
                  <Ionicons name="location" size={24} color={theme.colors.primary} />
                  <Text style={styles.contextValue}>
                    {contextualData.location.city}
                  </Text>
                  <Text style={styles.contextLabel}>
                    {contextualData.location.isDefault ? 'Par défaut' : 'Ta position'}
                  </Text>
                </View>
              )}

              {contextualData.calendar && (
                <View style={styles.contextCard}>
                  <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                  <Text style={styles.contextValue}>
                    {contextualData.calendar.todayMeetingsCount}
                  </Text>
                  <Text style={styles.contextLabel}>
                    Réunions aujourd'hui
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* PREMIUM TEASING */}
        {!user.isPremium && user.history && user.history.length >= 2 && (
          <TouchableOpacity 
            style={styles.premiumTeaser}
            onPress={() => navigation.navigate('PremiumPaywall')}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={24} color="#FFD700" />
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={styles.premiumTeaserTitle}>
                ✨ Débloquer Premium
              </Text>
              <Text style={styles.premiumTeaserSubtitle}>
                Techniques avancées • Analyse IA • Prédictions stress
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFD700" />
          </TouchableOpacity>
        )}

      </Animated.View>
    </ScrollView>
  );
}

function calculateDaysSince(date) {
  if (!date) return 14;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function RecommendationCard({ recommendation, onPress, user }) {
  const priorityColors = {
    critical: '#EF4444',
    high: '#F59E0B',
    moderate: '#3B82F6',
    low: '#10B981'
  };

  // 🔥 FIX: Extraire la priorité si c'est un objet
  const priorityValue = typeof recommendation.priority === 'string' 
    ? recommendation.priority 
    : recommendation.priority?.value || 'moderate';

  const isPremium = recommendation.techniques?.some(t => t.isPremium);
  const isLocked = isPremium && !user.isPremium;

  return (
    <TouchableOpacity 
      style={[styles.recommendationCard, { borderLeftColor: priorityColors[priorityValue] }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.recHeader}>
        <View style={[styles.recBadge, { backgroundColor: priorityColors[priorityValue] + '20' }]}>
          <Text style={[styles.recBadgeText, { color: priorityColors[priorityValue] }]}>
            {priorityValue.toUpperCase()}
          </Text>
        </View>
        {isLocked && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.premiumText}>PRO</Text>
          </View>
        )}
        <Text style={styles.recTiming}>
          {typeof recommendation.timing === 'string' ? recommendation.timing : 'Maintenant'}
        </Text>
      </View>

      <Text style={styles.recTitle}>
        {typeof recommendation.title === 'string' ? recommendation.title : 'Recommandation'}
      </Text>
      <Text style={styles.recReason}>
        {typeof recommendation.reason === 'string' ? recommendation.reason : ''}
      </Text>

      {recommendation.scientificRationale && typeof recommendation.scientificRationale === 'string' && (
        <View style={styles.scientificBox}>
          <Ionicons name="flask-outline" size={14} color={theme.colors.accent} />
          <Text style={styles.scientificText}>
            {recommendation.scientificRationale}
          </Text>
        </View>
      )}

      <View style={styles.recFooter}>
        <Text style={styles.recDuration}>
          <Ionicons name="time-outline" size={12} /> {typeof recommendation.duration === 'string' ? recommendation.duration : '5 min'}
        </Text>
        <View style={styles.recActionBadge}>
          <Text style={styles.recActionText}>
            {isLocked ? 'Débloquer' : 'Voir techniques'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.sub,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.sub,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.psychology.shadows.soft,
  },

  // 🔥 CARTE PRIMAIRE (Biométrie Live)
  primaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...theme.psychology.shadows.soft,
  },
  primaryCardAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  primaryCardNormal: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  primaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  primaryCardLabel: {
    fontSize: 12,
    color: theme.colors.sub,
    marginBottom: 4,
  },
  primaryCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  hrvGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hrvColumn: {
    flex: 1,
    alignItems: 'center',
  },
  hrvDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.chipBg,
  },
  hrvLabel: {
    fontSize: 11,
    color: theme.colors.sub,
    marginBottom: 4,
  },
  hrvValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  deviationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  deviationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recoveryScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.chipBg,
  },
  recoveryScoreLabel: {
    fontSize: 14,
    color: theme.colors.sub,
  },
  recoveryScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // CONNEXION BIOMÉTRIQUE
  connectBiometricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    borderStyle: 'dashed',
    ...theme.psychology.shadows.soft,
  },
  connectBiometricIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  connectBiometricContent: {
    flex: 1,
  },
  connectBiometricTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 4,
  },
  connectBiometricSubtitle: {
    fontSize: 13,
    color: theme.colors.sub,
    lineHeight: 18,
  },

  // SCORE MENTAL
  mentalScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.psychology.shadows.soft,
  },
  mentalScoreCardStale: {
    borderLeftColor: theme.colors.accent,
  },
  mentalScoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mentalScoreLabel: {
    fontSize: 12,
    color: theme.colors.sub,
    marginBottom: 2,
  },
  mentalScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 2,
  },
  mentalScoreDate: {
    fontSize: 11,
    color: theme.colors.sub,
  },
  mentalScoreSubtext: {
    fontSize: 10,
    color: theme.colors.accent,
    marginTop: 4,
    fontStyle: 'italic',
  },
  mentalScoreAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mentalScoreActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },

  // 🔥 NOUVEAU: INVITATION PERMA
  permaInvitationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.colors.accent + '30',
    ...theme.psychology.shadows.soft,
  },
  permaInvitationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permaInvitationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 4,
  },
  permaInvitationSubtitle: {
    fontSize: 13,
    color: theme.colors.sub,
    marginBottom: 4,
  },
  permaInvitationDetail: {
    fontSize: 11,
    color: theme.colors.accent,
    fontStyle: 'italic',
  },

  // RECOMMANDATIONS
  recommendationsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  recommendationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...theme.psychology.shadows.soft,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  recBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
  recTiming: {
    fontSize: 12,
    color: theme.colors.sub,
    marginLeft: 'auto',
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 8,
  },
  recReason: {
    fontSize: 14,
    color: theme.colors.sub,
    lineHeight: 20,
    marginBottom: 12,
  },
  scientificBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.accent + '10',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  scientificText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.accent,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recDuration: {
    fontSize: 12,
    color: theme.colors.sub,
  },
  recActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  recActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // CONTEXTE
  contextSection: {
    marginBottom: 24,
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contextCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...theme.psychology.shadows.soft,
  },
  contextValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginVertical: 8,
  },
  contextLabel: {
    fontSize: 12,
    color: theme.colors.sub,
    textAlign: 'center',
  },

  // PREMIUM TEASING
  premiumTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumTeaserTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 4,
  },
  premiumTeaserSubtitle: {
    fontSize: 13,
    color: theme.colors.sub,
  },

  // 🔥 PANIC BUTTON
  panicButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...theme.psychology.shadows.warm,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  panicButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 12,
  },
  panicButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  panicButtonSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});