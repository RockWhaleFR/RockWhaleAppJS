import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';
import Constants from 'expo-constants';
import WelcomeScreen from './screens/WelcomeScreen';
import ConversationalOnboarding from './screens/ConversationalOnboarding';
import Navigation from './navigation';
import { initNotifications, scheduleDailyReminder } from './services/notifications';
import useUserStore from './store/useUserStore';
import useHabitsStore from './store/useHabitsStore';
import { StatusBar } from 'expo-status-bar';
import theme from './theme';


const Stack = createNativeStackNavigator();

// Composant de loading amélioré
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.colors.bg
  }}>
    <StatusBar style="auto" translucent={true} />
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
  const { loadHabits } = useHabitsStore();
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        // Charger les données utilisateur
        await Promise.all([loadUser(), loadHabits()]);
        
        // Attendre que le store soit hydraté
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted) return;

        // Initialiser les notifications seulement si l'utilisateur est onboardé
        const currentUser = useUserStore.getState().user;
        // On vérifie aussi qu'on n'est pas dans Expo Go pour éviter les warnings
        if (currentUser?.hasOnboarded && Constants.executionEnvironment !== 'storeClient') {
          try {
            const notificationsEnabled = await initNotifications();
            
            if (notificationsEnabled && !currentUser.notificationsScheduled) {
              await scheduleDailyReminder(
                currentUser.preferredReminderTime?.hour || 9,
                currentUser.preferredReminderTime?.minute || 0
              );
              
              // Marquer les notifications comme programmées
              useUserStore.getState().updateUser({
                notificationsScheduled: true
              });
            }
          } catch (notifError) {
            console.warn('Notifications non disponibles:', notifError);
            // Continue sans bloquer l'app
          }
        }
        
        if (mounted) {
          setAppReady(true);
        }
        
      } catch (error) {
        console.error('Erreur initialisation app:', error);
        if (mounted) {
          setInitError(error.message);
          setAppReady(true); // On continue malgré l'erreur
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []); // Pas de dépendance user pour éviter les re-initialisations

  // Loading state amélioré
  if (!appReady || isLoading) {
    return <LoadingScreen />;
  }

  // Écran d'erreur optionnel
  if (initError) {
    console.log('App initialisée avec erreurs:', initError);
    // Tu peux ajouter un écran d'erreur ici si nécessaire
  }

  const initialRouteName = user?.hasOnboarded ? 'Main' : 'Welcome';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right', // Animation plus fluide
            animationDuration: 250
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="Onboarding" 
            component={ConversationalOnboarding}
            options={{
              gestureEnabled: false // Empêche le retour accidentel
            }}
          />
          <Stack.Screen 
            name="Main" 
            component={Navigation}
            options={{
              gestureEnabled: false
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}