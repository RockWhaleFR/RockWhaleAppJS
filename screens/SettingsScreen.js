// screens/SettingsScreen.js
// screens/SettingsScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../store/useUserStore';
import useHabitsStore from '../store/useHabitsStore';
import theme from '../theme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, resetOnboarding } = useUserStore();
  const { resetHabitsToSeed } = useHabitsStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [hapticsEnabled, setHapticsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleResetOnboarding = async () => {
    // 1. Réinitialiser les données
    await resetOnboarding();
    await resetHabitsToSeed();
    
    // 2. Navigation vers l'onboarding
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      })
    );
  };

  const settingsItems = [
  {
    title: 'Notifications',
    subtitle: 'Activer/désactiver les rappels',
    icon: 'notifications-outline',
    value: notificationsEnabled,
    onValueChange: setNotificationsEnabled,
  },
  {
    title: 'Retour haptique',
    subtitle: 'Vibrations lors des interactions',
    icon: 'phone-portrait-outline', // Icône corrigée
    value: hapticsEnabled,
    onValueChange: setHapticsEnabled,
  },
  {
    title: 'Son',
    subtitle: 'Activer/désactiver les sons',
    icon: 'volume-medium-outline',
    value: soundEnabled,
    onValueChange: setSoundEnabled,
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

      {/* Section Préférences */}
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