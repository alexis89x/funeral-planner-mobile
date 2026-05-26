import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface EmergenzaItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  route: string;
  url?: string;
}

const EMERGENZA_ITEMS: EmergenzaItem[] = [
  {
    id: 'numeri-utili',
    title: 'Numeri Utili',
    desc: 'Contatti e numeri di emergenza',
    icon: 'phone.fill',
    route: '/emergenza/numeri-utili',
  },
  {
    id: 'contatto-emergenza',
    title: 'Contatti di Emergenza',
    desc: 'Assistenza immediata in caso di necessità',
    icon: 'exclamationmark.shield.fill',
    route: '/emergenza/contatti',
  },
  /*{
    id: 'risarcimento-danni',
    title: 'Risarcimento Danni',
    desc: 'Informazioni e richieste di risarcimento',
    icon: 'doc.text.fill',
    route: '/emergenza/webview',
    url: 'https://app.tramontosereno.it',
  },*/
];

export default function EmergenzaScreen() {
  const handleItemPress = (item: EmergenzaItem) => {
    if (item.url) {
      router.push({
        pathname: '/emergenza/webview',
        params: { url: item.url, title: item.title },
      });
    } else {
      router.push(item.route as any);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.subtitle}>
            Assistenza e supporto di emergenza
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.itemsContainer}>
          {EMERGENZA_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemRow,
                { borderBottomColor: BaseColors.borderLight },
              ]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}>
              <ThemedView style={styles.itemRowContent}>
                <ThemedView
                  style={[
                    styles.iconContainer,
                    { backgroundColor: BaseColors.mainLightest },
                  ]}>
                  <IconSymbol
                    name={item.icon as any}
                    size={28}
                    color={BaseColors.main}
                  />
                </ThemedView>
                <ThemedView style={styles.textContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.itemDescription}>
                    {item.desc}
                  </ThemedText>
                </ThemedView>
                <IconSymbol
                  name="chevron.right"
                  size={20}
                  color={BaseColors.greyMedium}
                />
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
  },
  itemsContainer: {
    paddingBottom: 40,
  },
  itemRow: {
    borderBottomWidth: 1,
  },
  itemRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
});
