// screens/SettingsScreen.js - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../store/useUserStore';
import useHabitsStore from '../store/useHabitsStore';
import biometricService from '../services/biometricService';
import theme from '../theme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, resetOnboarding, updateSetting } = useUserStore();
  const { resetHabitsToSeed } = useHabitsStore();
  
  const [biometricStatus, setBiometricStatus] = useState('Vérification...');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const status = await biometricService.checkStatus();
    setBiometricStatus(status.status);
  };

  const handleConnectBiometric = async () => {
    setIsConnecting(true);
    
    try {
      const result = await biometricService.initialize();

      if (result.success && result.platform === 'GoogleFit') {
        Alert.alert(
          '✅ Google Fit Connecté',
          'Les données de santé sont maintenant disponibles dans l\'app.',
          [{ text: 'Super !', onPress: () => checkBiometricStatus() }]
        );
      } else {
        Alert.alert(
          '⚠️ Connexion échouée',
          'Veuillez accepter les permissions Google Fit.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: handleConnectBiometric }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectBiometric = async () => {
    Alert.alert(
      'Déconnecter Google Fit ?',
      'Les prédictions IA seront moins précises.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await biometricService.disconnect();
            checkBiometricStatus();
          }
        }
      ]
    );
  };
  const handleResetOnboarding = async () => {
    // 1. Réinitialiser les données
    await resetOnboarding();
    await resetHabitsToSeed();
    
    // 2. Navigation vers l'onboarding
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      })
    );
  };

  const settingsItems = [
  {
    title: 'Notifications',
    subtitle: 'Activer/désactiver les rappels',
    icon: 'notifications-outline',
    value: user.preferences.notificationsEnabled,
    onValueChange: (value) => updateSetting('notificationsEnabled', value),
  },
  
  {
    title: 'Retour haptique',
    subtitle: 'Vibrations lors des interactions',
    icon: 'phone-portrait-outline', // Icône corrigée
    value: user.preferences.hapticsEnabled,
    onValueChange: (value) => updateSetting('hapticsEnabled', value),
  },
  {
    title: 'Son',
    subtitle: 'Activer/désactiver les sons',
    icon: 'volume-medium-outline',
    value: user.preferences.soundEnabled,
    onValueChange: (value) => updateSetting('soundEnabled', value),
  },
];

  return (
    <ScrollView 
      style={{ 
        flex: 1, 
        backgroundColor: theme.colors.bg,
      }}
      contentContainerStyle={{
        padding: theme.spacing(3),
        paddingBottom: theme.spacing(6),
      }}
    >
      {/* En-tête */}
      <View style={{ alignItems: 'center', marginBottom: theme.spacing(4), paddingTop: theme.spacing(2) }}>
        <Ionicons name="settings-outline" size={32} color={theme.colors.primary} />
        <Text style={{ 
          fontSize: 24, 
          fontWeight: '700', 
          color: theme.colors.ink, 
          marginTop: theme.spacing(2) 
        }}>
          Paramètres
        </Text>
      </View>
{/* 🔥 SECTION BIOMÉTRIQUE */}
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: theme.colors.ink, 
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1)
      }}>
        🔗 Intégrations
      </Text>
      
      <View style={{ 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.radius.xl,
        marginBottom: theme.spacing(4),
        ...theme.psychology.shadows.soft,
      }}>
        <View style={{ padding: theme.spacing(3) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(2) }}>
            <Ionicons name="heart-circle" size={28} color={theme.colors.primary} style={{ marginRight: theme.spacing(2) }} />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontWeight: '600', 
                color: theme.colors.ink,
                fontSize: 16,
                marginBottom: 4
              }}>
                Google Fit / Health Connect
              </Text>
              <Text style={{ 
                color: biometricStatus === 'Connecté' ? theme.colors.success : theme.colors.sub,
                fontSize: 14,
                fontWeight: '600'
              }}>
                {biometricStatus}
              </Text>
            </View>
            {biometricStatus === 'Connecté' && (
              <View style={{
                backgroundColor: theme.colors.success + '20',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.success }}>
                  Actif
                </Text>
              </View>
            )}
          </View>

          {/* Bénéfices */}
          <View style={{
            backgroundColor: theme.colors.chipBg,
            padding: theme.spacing(2),
            borderRadius: 12,
            marginBottom: theme.spacing(2),
          }}>
            <Text style={{ fontSize: 13, color: theme.colors.sub, marginBottom: 6 }}>
              ✨ <Text style={{ fontWeight: '600' }}>Avantages :</Text>
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.sub, lineHeight: 18 }}>
              • Analyse sommeil automatique{'\n'}
              • Fréquence cardiaque au repos{'\n'}
              • Prédictions IA 2× plus précises{'\n'}
              • Score de récupération personnalisé
            </Text>
          </View>

          {biometricStatus !== 'Connecté' ? (
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: theme.spacing(2),
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                ...theme.psychology.shadows.warm,
              }}
              onPress={handleConnectBiometric}
              disabled={isConnecting}
            >
              <Ionicons name="heart-circle" size={20} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '600', marginLeft: 8 }}>
                {isConnecting ? 'Connexion...' : 'Connecter Google Fit'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.error + '20',
                paddingVertical: theme.spacing(1.5),
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.error + '50',
              }}
              onPress={handleDisconnectBiometric}
            >
              <Text style={{ color: theme.colors.error, fontWeight: '600', fontSize: 14 }}>
                Déconnecter
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Section Préférences */}
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: theme.colors.ink, 
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1)
      }}>
        Permissions
      </Text>
      <View style={{ 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.radius.xl,
        marginBottom: theme.spacing(4),
        ...theme.psychology.shadows.soft,
      }}>
        <TouchableOpacity 
          style={styles.permissionRow}
          onPress={() => Alert.alert('Gérer la localisation', 'Pour modifier cette permission, allez dans les Réglages de votre téléphone > Rockwhale > Localisation.')}
        >
          <Ionicons name="location-outline" size={24} color={theme.colors.primary} style={styles.permissionIcon} />
          <View style={styles.permissionTextContainer}>
            <Text style={styles.permissionTitle}>Localisation</Text>
            <Text style={styles.permissionSubtitle}>Utilisée pour le contexte météo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.sub} />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity 
          style={styles.permissionRow}
          onPress={() => Alert.alert('Gérer le calendrier', 'Pour modifier cette permission, allez dans les Réglages de votre téléphone > Rockwhale > Calendrier.')}
        >
          <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} style={styles.permissionIcon} />
          <View style={styles.permissionTextContainer}>
            <Text style={styles.permissionTitle}>Calendrier</Text>
            <Text style={styles.permissionSubtitle}>Utilisé pour les recommandations proactives</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.sub} />
        </TouchableOpacity>
      </View>

      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: theme.colors.ink, 
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1)
      }}>
        Préférences
      </Text>
      
      <View style={{ 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.radius.xl,
        marginBottom: theme.spacing(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
        {settingsItems.map((item, index) => (
          <View key={index}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: theme.spacing(3),
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color={theme.colors.primary} 
                  style={{ marginRight: theme.spacing(2) }} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontWeight: '600', 
                    color: theme.colors.ink,
                    fontSize: 16,
                    marginBottom: 4
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{ 
                    color: theme.colors.sub,
                    fontSize: 14
                  }}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            {index < settingsItems.length - 1 && (
              <View style={{ 
                height: 1, 
                backgroundColor: theme.colors.chipBg,
                marginHorizontal: theme.spacing(3)
              }} />
            )}
          </View>
        ))}
      </View>

      {/* Section Compte */}
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: theme.colors.ink, 
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1)
      }}>
        Compte
      </Text>
      
      <View style={{ 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.radius.xl,
        marginBottom: theme.spacing(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
        <TouchableOpacity 
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: theme.spacing(3),
          }}
          onPress={handleResetOnboarding}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons 
              name="refresh-outline" 
              size={24} 
              color={theme.colors.primary} 
              style={{ marginRight: theme.spacing(2) }} 
            />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontWeight: '600', 
                color: theme.colors.ink,
                fontSize: 16,
                marginBottom: 4
              }}>
                Réinitialiser l'application
              </Text>
              <Text style={{ 
                color: theme.colors.sub,
                fontSize: 14
              }}>
                Recommencer l'onboarding et réinitialiser les données
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.sub} />
        </TouchableOpacity>
      </View>

      {/* Section Informations */}
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: theme.colors.ink, 
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1)
      }}>
        Informations
      </Text>
      
      <View style={{ 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.radius.xl,
        marginBottom: theme.spacing(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
        <TouchableOpacity style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: theme.spacing(3),
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons 
              name="document-text-outline" 
              size={24} 
              color={theme.colors.primary} 
              style={{ marginRight: theme.spacing(2) }} 
            />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontWeight: '600', 
                color: theme.colors.ink,
                fontSize: 16,
                marginBottom: 4
              }}>
                Politique de confidentialité
              </Text>
              <Text style={{ 
                color: theme.colors.sub,
                fontSize: 14
              }}>
                Comment nous protégeons vos données
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.sub} />
        </TouchableOpacity>
        
        <View style={{ 
          height: 1, 
          backgroundColor: theme.colors.chipBg,
          marginHorizontal: theme.spacing(3)
        }} />
        
        <TouchableOpacity style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: theme.spacing(3),
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons 
              name="reader-outline" 
              size={24} 
              color={theme.colors.primary} 
              style={{ marginRight: theme.spacing(2) }} 
            />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontWeight: '600', 
                color: theme.colors.ink,
                fontSize: 16,
                marginBottom: 4
              }}>
                Conditions d'utilisation
              </Text>
              <Text style={{ 
                color: theme.colors.sub,
                fontSize: 14
              }}>
                Modalités d'utilisation de l'application
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.sub} />
        </TouchableOpacity>
        
        <View style={{ 
          height: 1, 
          backgroundColor: theme.colors.chipBg,
          marginHorizontal: theme.spacing(3)
        }} />
        
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: theme.spacing(3),
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons 
              name="information-circle-outline" 
              size={24} 
              color={theme.colors.primary} 
              style={{ marginRight: theme.spacing(2) }} 
            />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontWeight: '600', 
                color: theme.colors.ink,
                fontSize: 16,
                marginBottom: 4
              }}>
                Version
              </Text>
              <Text style={{ 
                color: theme.colors.sub,
                fontSize: 14
              }}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Statistiques utilisateur */}
      <View style={{ 
        backgroundColor: theme.colors.card, 
        borderRadius: theme.radius.xl,
        padding: theme.spacing(3),
        marginBottom: theme.spacing(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '700', 
          color: theme.colors.ink, 
          marginBottom: theme.spacing(2),
          textAlign: 'center'
        }}>
          📊 Tes statistiques
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: theme.spacing(2) }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '700', 
              color: theme.colors.primary 
            }}>
              {user.streak || 0}
            </Text>
            <Text style={{ 
              color: theme.colors.sub,
              fontSize: 14
            }}>
              Jours de série
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '700', 
              color: theme.colors.primary 
            }}>
              {user.history?.length || 0}
            </Text>
            <Text style={{ 
              color: theme.colors.sub,
              fontSize: 14
            }}>
              Habitudes validées
            </Text>
          </View>
        </View>
        
        <Text style={{ 
          color: theme.colors.sub,
          fontSize: 14,
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Continue comme ça ! 🚀
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = {
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  permissionIcon: {
    marginRight: theme.spacing(2),
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontWeight: '600',
    color: theme.colors.ink,
    fontSize: 16,
    marginBottom: 4,
  },
  permissionSubtitle: {
    color: theme.colors.sub,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.chipBg,
    marginHorizontal: theme.spacing(3),
  },
};