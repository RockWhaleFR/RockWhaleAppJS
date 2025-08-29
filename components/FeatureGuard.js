// components/FeatureGuard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSubscription } from '../hooks/useSubscription';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const FeatureGuard = ({ 
  feature, 
  children, 
  fallbackComponent = null,
  showUpgradePrompt = true 
}) => {
  const { hasFeature, currentPlan, isFree } = useSubscription();

  if (hasFeature(feature)) {
    return children;
  }

  if (fallbackComponent) {
    return fallbackComponent;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <View style={{
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      padding: theme.spacing(3),
      borderRadius: theme.radius.l,
      marginVertical: theme.spacing(2),
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(1) }}>
        <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
        <Text style={{ 
          fontWeight: '600', 
          color: theme.colors.ink, 
          marginLeft: theme.spacing(1),
          fontSize: 16
        }}>
          Fonctionnalité Premium
        </Text>
      </View>
      
      <Text style={{ 
        color: theme.colors.sub, 
        marginBottom: theme.spacing(2),
        fontSize: 14
      }}>
        Cette fonctionnalité n'est pas disponible avec votre abonnement actuel.
      </Text>

      <TouchableOpacity
        onPress={() => {/* Navigation vers abonnement */}}
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: theme.spacing(1.5),
          paddingHorizontal: theme.spacing(2),
          borderRadius: theme.radius.m,
          alignSelf: 'flex-start'
        }}
      >
        <Text style={{ 
          color: theme.colors.primaryInk, 
          fontWeight: '600',
          fontSize: 14
        }}>
          Passer à {isFree ? 'Freemium' : 'Premium'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FeatureGuard;