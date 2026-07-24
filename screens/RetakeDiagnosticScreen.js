// screens/RetakeDiagnosticScreen.js - SIMPLIFIÉE
import React from 'react';
import EnhancedDiagnosticScreen from './EnhancedDiagnosticScreen';

/**
 * 🔥 Wrapper pour refaire le test depuis le profil
 * Passe automatiquement isRetake=true
 */
export default function RetakeDiagnosticScreen({ navigation, route }) {
  return (
    <EnhancedDiagnosticScreen 
      navigation={navigation} 
      route={{ ...route, params: { ...route?.params, isRetake: true } }}
    />
  );
}