import React from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { BaseColors } from '@/constants/theme';
import { EmergencyContact } from '@/contexts/AuthContext';
import { DocumentTypes, DocumentType } from '@/constants/document-types';

export function DocumentTypePicker({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (type: DocumentType) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Tipo documento</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={BaseColors.greyMedium} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={DocumentTypes}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelect(item)}
              activeOpacity={0.6}>
              <ThemedText style={styles.itemText}>{item.name}</ThemedText>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

export function ContactsPicker({
  visible,
  contacts,
  selectedIds,
  visibleToAll,
  onToggle,
  onSelectAll,
  onClose,
}: {
  visible: boolean;
  contacts: EmergencyContact[];
  selectedIds: number[];
  visibleToAll: boolean;
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Visibile a</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={BaseColors.greyMedium} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={contacts}
          keyExtractor={item => String(item.id)}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          ListHeaderComponent={
            <>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={onSelectAll}
                activeOpacity={0.6}>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.itemText}>Tutti i contatti</ThemedText>
                  <ThemedText style={styles.contactSub}>Opzione predefinita</ThemedText>
                </View>
                <Ionicons
                  name={visibleToAll ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={visibleToAll ? BaseColors.main : BaseColors.grey}
                />
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          }
          renderItem={({ item }) => {
            const selected = !visibleToAll && selectedIds.includes(item.id);
            return (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => onToggle(item.id)}
                activeOpacity={0.6}>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.itemText}>{item.name}</ThemedText>
                  {!!item.relationship && (
                    <ThemedText style={styles.contactSub}>{item.relationship}</ThemedText>
                  )}
                </View>
                <Ionicons
                  name={selected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={selected ? BaseColors.main : BaseColors.grey}
                />
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: BaseColors.borderLight,
  },
  title: { fontSize: 17, fontWeight: '700' },
  closeBtn: { padding: 4 },
  item: { paddingHorizontal: 20, paddingVertical: 15 },
  itemText: { fontSize: 15 },
  divider: { height: 1, backgroundColor: BaseColors.borderLight, marginHorizontal: 20 },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  contactInfo: { flex: 1, marginRight: 12 },
  contactSub: { fontSize: 13, color: BaseColors.grey, marginTop: 2 },
});