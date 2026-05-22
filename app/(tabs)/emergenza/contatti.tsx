import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Linking, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { EmergencyContact, Plan } from '@/contexts/AuthContext';
import { ApiService } from '@/utils/api';

function ContactRow({
  contact,
  onDelete,
}: {
  contact: EmergencyContact;
  onDelete: (contact: EmergencyContact) => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);
  const hasPhone = !!contact.mobile_phone;
  const hasEmail = !!contact.email;

  const handleCall = () => {
    Alert.alert(
      'Chiama',
      `Vuoi chiamare ${contact.name} al ${contact.mobile_phone}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Chiama', onPress: () => Linking.openURL(`tel:${contact.mobile_phone}`) },
      ]
    );
  };

  const handleEmail = () => {
    Alert.alert(
      'Invia email',
      `Vuoi inviare un'email a ${contact.name} (${contact.email})?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Invia', onPress: () => Linking.openURL(`mailto:${contact.email}`) },
      ]
    );
  };

  const handleEdit = () => {
    swipeableRef.current?.close();
    router.push({
      pathname: '/(tabs)/emergenza/contatto-form',
      params: {
        contactId: String(contact.id),
        planId: String(contact.id_plan),
        name: contact.name,
        email: contact.email,
        phone: contact.mobile_phone,
      },
    });
  };

  const renderRightActions = (_: any, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(contact);
        }}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.contactRow}>
        <View style={styles.contactInfo}>
          <ThemedText style={styles.contactName}>{contact.name}</ThemedText>
        </View>
        <View style={styles.actions}>
          {hasPhone && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <IconSymbol name="phone.fill" size={20} color={BaseColors.main} />
            </TouchableOpacity>
          )}
          {hasEmail && (
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
              <IconSymbol name="envelope.fill" size={20} color={BaseColors.main} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <IconSymbol name="pencil" size={18} color={BaseColors.grey} />
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );
}

export default function ContattiEmergenzaScreen() {
  const { userProfile, reloadProfile } = useAuth();

  const plansWithContacts = (userProfile?.owned_plans ?? []).filter(
    (p: Plan) => p.emergencyContacts?.length > 0
  );

  const isFlat = plansWithContacts.length <= 1;

  const handleAdd = () => router.push('/(tabs)/emergenza/contatto-form');

  const handleDelete = (contact: EmergencyContact) => {
    Alert.alert(
      'Elimina contatto',
      `Vuoi eliminare ${contact.name}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.post('emergency-contact-remove', {
                id_emergency_contact: String(contact.id),
                id_plan: String(contact.id_plan),
              });
              await reloadProfile();
            } catch {
              Alert.alert('Errore', 'Impossibile eliminare il contatto. Riprova.');
            }
          },
        },
      ]
    );
  };

  const AddButton = () => (
    <TouchableOpacity onPress={handleAdd} style={styles.headerAdd}>
      <Ionicons name="add-circle-outline" size={28} color={BaseColors.main} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerRight: () => <AddButton /> }} />

      {plansWithContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="person.2.fill" size={48} color={BaseColors.greyLight} />
          <ThemedText style={styles.emptyText}>Nessun contatto di emergenza</ThemedText>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAdd}>
            <ThemedText style={styles.emptyButtonText}>Aggiungi contatto</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {isFlat ? (
            plansWithContacts[0].emergencyContacts.map((c: EmergencyContact) => (
              <React.Fragment key={c.id}>
                <ContactRow contact={c} onDelete={handleDelete} />
                <View style={styles.divider} />
              </React.Fragment>
            ))
          ) : (
            plansWithContacts.map((plan: Plan) => (
              <View key={plan.id}>
                <View style={styles.planHeader}>
                  <ThemedText style={styles.planName}>{plan.plan_for}</ThemedText>
                </View>
                {plan.emergencyContacts.map((c: EmergencyContact, i: number) => (
                  <React.Fragment key={c.id}>
                    <ContactRow contact={c} onDelete={handleDelete} />
                    {i < plan.emergencyContacts.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
                <View style={styles.planDivider} />
              </View>
            ))
          )}
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <ThemedText style={styles.addButtonText}>Salva contatto</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 32 },
  headerAdd: { marginRight: 16 },
  planHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  planName: {
    fontSize: 13,
    fontWeight: '600',
    color: BaseColors.main,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planDivider: {
    height: 8,
    backgroundColor: BaseColors.greyLightest,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BaseColors.mainLightest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: BaseColors.borderLight,
  },
  deleteAction: {
    backgroundColor: BaseColors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: BaseColors.grey,
  },
  emptyButton: {
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: BaseColors.main,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BaseColors.main,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
