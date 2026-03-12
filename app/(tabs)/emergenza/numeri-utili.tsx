import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface NumeroUtile {
  numero: string;
  titolo: string;
  descrizione: string;
}

const NUMERI_UTILI: NumeroUtile[] = [
  {
    numero: '112',
    titolo: 'Numero Unico di Emergenza',
    descrizione: 'Carabinieri, Polizia, Ambulanza, Vigili del Fuoco',
  },
  {
    numero: '113',
    titolo: 'Polizia di Stato',
    descrizione: 'Soccorso pubblico di emergenza',
  },
  {
    numero: '115',
    titolo: 'Vigili del Fuoco',
    descrizione: 'Incendi, soccorso e salvataggio',
  },
  {
    numero: '118',
    titolo: 'Emergenza Sanitaria',
    descrizione: 'Ambulanza e pronto soccorso',
  },
  {
    numero: '117',
    titolo: 'Guardia di Finanza',
    descrizione: 'Frodi, contrabbando e sicurezza economica',
  },
  {
    numero: '1522',
    titolo: 'Antiviolenza Donna',
    descrizione: 'Supporto per vittime di violenza e stalking',
  },
  {
    numero: '114',
    titolo: 'Telefono Azzurro',
    descrizione: 'Emergenze che coinvolgono minori',
  },
  {
    numero: '116117',
    titolo: 'Guardia Medica',
    descrizione: 'Assistenza medica non urgente fuori orario',
  }
  /*,
  {
    numero: '800274274',
    titolo: 'Croce Rossa Italiana',
    descrizione: 'Assistenza e soccorso umanitario',
  },*/
];

export default function NumeriUtiliScreen() {
  const handleCall = (numero: NumeroUtile) => {
    Alert.alert(
      `Chiamare ${numero.titolo}?`,
      numero.numero,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Chiama',
          onPress: () => Linking.openURL(`tel:${numero.numero}`),
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {NUMERI_UTILI.map((item, index) => (
          <TouchableOpacity
            key={item.numero}
            style={[
              styles.card,
              index < NUMERI_UTILI.length - 1 && styles.cardBorder,
            ]}
            onPress={() => handleCall(item)}
            activeOpacity={0.7}>
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: BaseColors.mainLightest }]}>
                <IconSymbol name="phone.fill" size={22} color={BaseColors.main} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText type="defaultSemiBold" style={styles.titolo}>
                  {item.titolo}
                </ThemedText>
                <ThemedText style={styles.descrizione}>
                  {item.descrizione}
                </ThemedText>
              </View>
              <ThemedText style={styles.numero}>{item.numero}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  card: {
    paddingVertical: 14,
  },
  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BaseColors.borderLight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titolo: {
    fontSize: 15,
    marginBottom: 2,
  },
  descrizione: {
    fontSize: 12,
    opacity: 0.65,
  },
  numero: {
    fontSize: 20,
    fontWeight: '700',
    color: BaseColors.main,
    minWidth: 64,
    textAlign: 'right',
  },
});
