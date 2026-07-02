import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, Redirect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors, THEMES, ACTIVE_THEME } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Studio3ABanner } from '@/components/Studio3ABanner';

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
    desc: 'Definisci chi può accedere alle tue informazioni',
    icon: 'exclamationmark.shield.fill',
    route: '/emergenza/contatti',
  },
];

export default function EmergenzaScreen() {
  // Domani Sicuro: la tab "Emergenza" apre direttamente i contatti di emergenza.
  if (THEMES[ACTIVE_THEME].tabLayout === 'documenti-contatti') {
    return <Redirect href="/(tabs)/emergenza/contatti" />;
  }

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
        {ACTIVE_THEME === 'studio3a' && <Studio3ABanner />}

        <ThemedView style={styles.itemsContainer}>
          {EMERGENZA_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, { borderBottomColor: BaseColors.borderLight }]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}>
              <ThemedView style={styles.itemRowContent}>
                <ThemedView style={[styles.iconContainer, { backgroundColor: BaseColors.mainLightest }]}>
                  <IconSymbol name={item.icon as any} size={28} color={BaseColors.main} />
                </ThemedView>
                <ThemedView style={styles.textContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.itemDescription}>
                    {item.desc}
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color={BaseColors.greyMedium} />
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