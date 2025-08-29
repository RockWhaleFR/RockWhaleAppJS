import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import theme from '../theme';

export default function ScientificModal({ visible, fact, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center', 
        backgroundColor: 'rgba(10, 22, 40, 0.7)' 
      }}>
        <View style={{ 
          backgroundColor: theme.colors.card, 
          padding: 20,
          borderRadius: theme.radius.xl, 
          width: '85%',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <Text style={{ 
            fontSize: 18, 
            marginBottom: 16,
            color: theme.colors.ink,
            lineHeight: 24
          }}>{fact}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              borderRadius: theme.radius.l,
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              color: theme.colors.primaryInk, 
              fontWeight: '600',
              fontSize: 16
            }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}