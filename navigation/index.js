// navigation/index.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import theme from '../theme';

enableScreens();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Stack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={{ title: 'Détail habitude' }}
      />
    </Stack.Navigator>
  );
}

export default function Navigation({ route }) {
  const currentRoute = route?.state?.routes?.[route.state.index] ?? { name: 'HomeMain' };
  const routeName = currentRoute.name;
  const hideTabs = routeName === 'HabitDetail';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: hideTabs ? { display: 'none' } : {
          backgroundColor: theme.colors.card,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.sub,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "bar-chart" : "bar-chart-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}