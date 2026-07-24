// App.js - AVEC MONITORING NOTIFICATIONS INTÉGRÉ
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';

// Écrans existants
import WelcomeScreen from './screens/WelcomeScreen';
import NameWelcomeScreen from './screens/NameWelcomeScreen';
import Navigation from './navigation';

// Écrans diagnostic
import EnhancedDiagnosticScreen from './screens/EnhancedDiagnosticScreen';
import EnhancedResultsScreen from './screens/EnhancedResultsScreen';
import PremiumPaywallScreen from './screens/PremiumPaywallScreen';

// Services et stores
import useUserStore from './store/useUserStore';
import useHabitsStore from './store/useHabitsStore';
import smartNotifications from './services/smartNotifications';
import biometricService from './services/biometricService';
import { StatusBar } from 'expo-status-bar';
import theme from './theme/enhancedTheme';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.colors.bg
  }}>
    <StatusBar style="auto" translucent={true} />
    
    <View style={{
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }}>
      <Text style={{ fontSize: 40, color: '#FFFFFF' }}>🧠</Text>
    </View>
    
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text style={{ 
      marginTop: 16, 
      fontSize: 16, 
      color: theme.colors.sub,
      fontWeight: '500' 
    }}>
      Initialisation de votre assistant...
    </Text>
  </View>
);

export default function App() {
  const { loadUser, user, isLoading } = useUserStore();
  const { loadHabits, habits } = useHabitsStore();
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState(null);
  
  // 🔥 Ref pour navigation (deep links)
  const navigationRef = useRef(null);
  
  // 🔥 AppState monitoring
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation app...');
        
        // 1. Charger user + habits
        await Promise.all([loadUser(), loadHabits()]);
        
        // 2. 🔥 Initialiser biométrie
        try {
          console.log('💓 Init biométrie...');
          await biometricService.initialize();
        } catch (bioError) {
          console.warn('⚠️ Biométrie non disponible:', bioError.message);
        }
        
        // 3. 🔥 Initialiser notifications + monitoring
        try {
          console.log('🔔 Init notifications...');
          await smartNotifications.initialize();
          console.log('✅ Notifications initialisées');
        } catch (notifError) {
          console.warn('⚠️ Notifications non disponibles (normal en Expo Go):', notifError.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted) return;

        console.log('✅ App initialisée');
        
        if (mounted) {
          setAppReady(true);
        }
        
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
        if (mounted) {
          setInitError(error.message);
          setAppReady(true);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔥 MONITORING APPSTATE (pause/reprise monitoring)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    console.log('📱 AppState:', appState.current, '→', nextAppState);
    
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App revient en foreground
      console.log('🔄 App en foreground - Reprise monitoring');
      smartNotifications.startMonitoring();
    } else if (nextAppState.match(/inactive|background/)) {
      // App passe en background
      console.log('⏸️ App en background - Pause monitoring');
      smartNotifications.stopMonitoring();
    }
    
    appState.current = nextAppState;
  };

  // 🔥 LISTENER DEEP LINKS NOTIFICATIONS
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('📱 Notification cliquée:', data);
      
      handleNotificationAction(data);
    });

    return () => subscription.remove();
  }, [appReady, habits]);

  /**
   * 🔥 HANDLER ACTIONS NOTIFICATIONS
   */
  const handleNotificationAction = (data) => {
    if (!navigationRef.current || !appReady) {
      console.warn('⚠️ Navigation pas prête');
      return;
    }

    try {
      switch (data.action) {
        case 'open_technique':
          // Chercher technique dans habits OU fallback map
          let technique = habits?.find(h => h.id === data.techniqueId);
          
          // 🔥 Fallback: techniques de base si pas dans habits
          if (!technique) {
            technique = getBasicTechnique(data.techniqueId);
          }
          
          if (technique) {
            navigationRef.current.navigate('Main', {
              screen: 'Home',
              params: {
                screen: 'HabitDetail',
                params: { 
                  habit: technique,
                  fromNotification: true,
                  notificationData: data
                }
              }
            });
          } else {
            // Fallback: ouvrir bibliothèque
            navigationRef.current.navigate('Main', {
              screen: 'Library'
            });
          }
          break;

        case 'open_profile':
          navigationRef.current.navigate('Main', {
            screen: 'Profile',
            params: { screen: 'ProfileMain' }
          });
          break;

        case 'open_biometric_details':
          navigationRef.current.navigate('Main', {
            screen: 'Home',
            params: { screen: 'BiometricDetails' }
          });
          break;

        case 'open_sleep_tips':
          // Pour l'instant, rediriger vers home
          navigationRef.current.navigate('Main', {
            screen: 'Home'
          });
          break;

        case 'open_paywall':
          navigationRef.current.navigate('PremiumPaywall', {
            source: 'notification',
            trigger: data.trigger
          });
          break;

        default:
          console.log('ℹ️ Action non gérée:', data.action);
          navigationRef.current.navigate('Main', {
            screen: 'Home'
          });
      }
    } catch (error) {
      console.error('❌ Erreur navigation deep link:', error);
    }
  };

  /**
   * 🔥 MAP TECHNIQUES DE BASE (fallback)
   */
  const getBasicTechnique = (techniqueId) => {
    const techniquesMap = {
      'physiological-sigh': {
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
      },
      'box-breathing': {
        id: 'box-breathing',
        title: 'Respiration Carrée',
        category: 'breathing',
        duration: 3,
        isPremium: false,
        description: 'Technique de cohérence cardiaque utilisée par les Navy SEALs pour gérer le stress.',
        instructions: [
          'Inspire pendant 4 secondes',
          'Retiens ta respiration 4 secondes',
          'Expire pendant 4 secondes',
          'Pause poumons vides 4 secondes',
          'Répète pendant 3 minutes'
        ],
        scientificBasis: 'Équilibre le système nerveux autonome',
        benefits: ['Réduit anxiété', 'Améliore concentration', 'Régule rythme cardiaque']
      },
      '4-7-8-breathing': {
        id: '4-7-8-breathing',
        title: 'Respiration 4-7-8',
        category: 'breathing',
        duration: 2,
        isPremium: false,
        description: 'Technique d\'endormissement du Dr. Andrew Weil, surnommée "tranquillisant naturel".',
        instructions: [
          'Expire complètement par la bouche',
          'Inspire silencieusement par le nez pendant 4 secondes',
          'Retiens ta respiration pendant 7 secondes',
          'Expire bruyamment par la bouche pendant 8 secondes',
          'Répète 3-4 cycles'
        ],
        scientificBasis: 'Favorise la relaxation et l\'endormissement',
        benefits: ['Facilite sommeil', 'Réduit anxiété', 'Calme mental']
      },
      'cold-water-face': {
        id: 'cold-water-face',
        title: 'Eau Froide Visage',
        category: 'physical',
        duration: 0.5,
        isPremium: false,
        description: 'Active le réflexe de plongée des mammifères pour un reset physiologique instantané.',
        instructions: [
          'Remplis un lavabo d\'eau froide',
          'Plonge ton visage 30 secondes',
          'Ou applique un gant froid sur le visage',
          'Respire calmement'
        ],
        scientificBasis: 'Active le nerf vague, baisse rythme cardiaque instantanément',
        benefits: ['Boost circadien', 'Reset physiologique', 'Éveil rapide']
      },
      'power-posing': {
        id: 'power-posing',
        title: 'Power Posing',
        category: 'physical',
        duration: 2,
        isPremium: false,
        description: 'Postures de puissance qui modifient ta chimie hormonale en 2 minutes.',
        instructions: [
          'Tiens-toi debout, bien droit',
          'Épaules en arrière, torse ouvert',
          'Mains sur les hanches (Wonder Woman) ou bras levés en V',
          'Maintiens la posture 2 minutes complètes',
          'Respire profondément'
        ],
        scientificBasis: 'Augmente testostérone, réduit cortisol, booste confiance',
        benefits: ['Confiance instantanée', 'Réduit stress', 'Prépare à un défi']
      },
      'body-scan': {
        id: 'body-scan',
        title: 'Scan Corporel',
        category: 'mindfulness',
        duration: 5,
        isPremium: false,
        description: 'Technique de relaxation progressive par balayage mental du corps.',
        instructions: [
          'Allonge-toi confortablement',
          'Ferme les yeux',
          'Porte attention à tes pieds, relâche les tensions',
          'Remonte progressivement: chevilles, mollets, cuisses...',
          'Continue jusqu\'au sommet du crâne',
          'Prends 5-10 minutes'
        ],
        scientificBasis: 'Réduit tension musculaire et anxiété par conscience corporelle',
        benefits: ['Relaxation profonde', 'Meilleur sommeil', 'Réduit tensions']
      },
      'sun-exposure': {
        id: 'sun-exposure',
        title: 'Exposition Solaire',
        category: 'physical',
        duration: 10,
        isPremium: false,
        description: 'Reset circadien matinal par exposition à la lumière naturelle.',
        instructions: [
          'Dans les 30 minutes après réveil',
          'Sors à l\'extérieur 10 minutes',
          'Pas besoin de regarder le soleil directement',
          'Par temps couvert: 20 minutes',
          'Pas à travers une fenêtre'
        ],
        scientificBasis: 'Stoppe production de mélatonine, booste cortisol et dopamine',
        benefits: ['Éveil optimal', 'Meilleur sommeil le soir', 'Régule horloge interne']
      },
      'light-exposure': {
        id: 'light-exposure',
        title: 'Exposition Lumière',
        category: 'physical',
        duration: 5,
        isPremium: false,
        description: 'Combat le creux circadien de l\'après-midi par la lumière.',
        instructions: [
          'Entre 14h et 16h',
          'Sors 5 minutes à l\'extérieur',
          'Ou place-toi près d\'une fenêtre lumineuse',
          'Évite écrans sombres',
          'Regarde au loin'
        ],
        scientificBasis: 'Contrecarre baisse naturelle d\'éveil post-déjeuner',
        benefits: ['Combat somnolence', 'Maintient éveil', 'Booste énergie']
      },
      'progressive-muscle-relaxation': {
        id: 'progressive-muscle-relaxation',
        title: 'Relaxation Musculaire Progressive',
        category: 'physical',
        duration: 10,
        isPremium: false,
        description: 'Technique de tension-relâchement pour relaxation profonde.',
        instructions: [
          'Assis ou allongé confortablement',
          'Contracte un groupe musculaire 5 secondes',
          'Relâche complètement 10 secondes',
          'Commence par les pieds, remonte progressivement',
          'Termine par le visage'
        ],
        scientificBasis: 'Réduit tension physique et mentale par contraste',
        benefits: ['Relaxation profonde', 'Meilleur sommeil', 'Conscience corporelle']
      }
    };
    
    return techniquesMap[techniqueId] || null;
  };

  if (!appReady || isLoading) {
    return <LoadingScreen />;
  }

  if (initError) {
    console.log('⚠️ App initialisée avec erreurs:', initError);
  }

  const getInitialRouteName = () => {
    if (!user?.hasOnboarded) {
      return 'Welcome';
    }
    
    if (!user.stressProfile) {
      return 'StressDiagnostic';
    }
    
    return 'Main';
  };

  const initialRouteName = getInitialRouteName();

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: false
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ gestureEnabled: false }}
          />
          
          <Stack.Screen 
            name="NameWelcome" 
            component={NameWelcomeScreen}
            options={{ gestureEnabled: false }}
          />
          
          <Stack.Screen 
            name="StressDiagnostic" 
            component={EnhancedDiagnosticScreen}
            options={{ gestureEnabled: false }}
          />
          
          <Stack.Screen 
            name="DiagnosticResults" 
            component={EnhancedResultsScreen}
            options={{
              gestureEnabled: false,
              animation: 'fade'
            }}
          />
          
          <Stack.Screen 
            name="PremiumPaywall" 
            component={PremiumPaywallScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />

          <Stack.Screen 
            name="Main" 
            component={Navigation}
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}