// components/ScientificTooltip.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

export default function ScientificTooltip({ fact, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(10, 22, 40, 0.8)',
          padding: theme.spacing(3)
        }}>
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.xl,
            padding: theme.spacing(3),
            width: '100%',
            maxWidth: 400,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 5,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(2) }}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
              <Text style={{ 
                fontWeight: '700', 
                color: theme.colors.ink, 
                marginLeft: theme.spacing(1),
                fontSize: 18
              }}>
                Le saviez-vous ?
              </Text>
            </View>
            
            <Text style={{ 
              color: theme.colors.ink, 
              lineHeight: 22,
              marginBottom: theme.spacing(3),
              fontSize: 16
            }}>
              {fact}
            </Text>
            
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: theme.spacing(2),
                borderRadius: theme.radius.l,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: theme.colors.primaryInk, fontWeight: '600' }}>
                J'ai compris !
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}