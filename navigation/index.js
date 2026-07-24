// navigation/index.js - Navigation CORRIGÉE
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Écrans
import SmartHomeScreen from '../screens/SmartHomeScreen';
import TechniquesLibraryScreen from '../screens/TechniquesLibraryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryTimelineScreen from '../screens/HistoryTimelineScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import ActivityScreen from '../screens/ActivityScreen';
import PremiumPaywallScreen from '../screens/PremiumPaywallScreen';
import GuidedTechniqueScreen from '../screens/GuidedTechniqueScreen';
import EnhancedDiagnosticScreen from '../screens/EnhancedDiagnosticScreen';

// 🔥 Écrans détails
import BiometricDetailsScreen from '../screens/BiometricDetailsScreen';
import MentalDetailsScreen from '../screens/MentalDetailsScreen';

import theme from '../theme/enhancedTheme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Stack Home
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={SmartHomeScreen} />
      <HomeStack.Screen name="BiometricDetails" component={BiometricDetailsScreen} />
      <HomeStack.Screen name="MentalDetails" component={MentalDetailsScreen} />
      <HomeStack.Screen name="HabitDetail" component={HabitDetailScreen} />
      <HomeStack.Screen name="Activity" component={ActivityScreen} />
      <HomeStack.Screen name="TechniquesLibrary" component={TechniquesLibraryScreen} />
      <HomeStack.Screen name="PremiumPaywall" component={PremiumPaywallScreen} />
      <HomeStack.Screen name="GuidedTechnique" component={GuidedTechniqueScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      {/* 🔥 Ajout RetakeDiagnostic dans HomeStack */}
      <HomeStack.Screen 
        name="RetakeDiagnostic" 
        component={EnhancedDiagnosticScreen}
        initialParams={{ isRetake: true }}
      />
    </HomeStack.Navigator>
  );
}

// Stack History
function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryMain" component={HistoryScreen} />
      <HistoryStack.Screen name="HistoryTimeline" component={HistoryTimelineScreen} />
    </HistoryStack.Navigator>
  );
}

// Stack Profile
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="HistoryTimeline" component={HistoryTimelineScreen} />
      <ProfileStack.Screen name="MentalDetails" component={MentalDetailsScreen} />
      {/* 🔥 Ajout RetakeDiagnostic dans ProfileStack */}
      <ProfileStack.Screen 
        name="RetakeDiagnostic" 
        component={EnhancedDiagnosticScreen}
        initialParams={{ isRetake: true }}
      />
    </ProfileStack.Navigator>
  );
}

export default function Navigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.sub,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.chipBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 30 : 25,
          height: Platform.OS === 'ios' ? 95 : 85,
          position: 'absolute',
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryStackScreen}
        options={{ tabBarLabel: 'Historique' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}