import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';
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

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        await Promise.all([loadUser(), loadHabits()]);
        
        // 🔥 Initialiser notifications
        try {
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

  // 🔥 NOUVEAU : Listener Deep Links Notifications
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
          // Navigation vers HabitDetail
          const technique = habits?.find(h => h.id === data.techniqueId);
          if (technique) {
            navigationRef.current.navigate('Main', {
              screen: 'Home',
              params: {
                screen: 'HabitDetail',
                params: { 
                  habit: technique,
                  fromNotification: true 
                }
              }
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

        case 'open_paywall':
          navigationRef.current.navigate('Main', {
            screen: 'Home',
            params: { screen: 'PremiumPaywall' }
          });
          break;

        default:
          console.log('Action non gérée:', data.action);
      }
    } catch (error) {
      console.error('❌ Erreur navigation deep link:', error);
    }
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