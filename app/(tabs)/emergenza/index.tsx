import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Linking, Image, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const STUDIO3A_PHONE = '800 09 02 10';

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

  const handleCallStudio3A = () => {
    Linking.openURL(`tel:${STUDIO3A_PHONE.replace(/\s/g, '')}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Studio 3A Banner */}
        <View style={styles.studio3aBanner}>
          <Image
            source={require('@/assets/images/logo-horizontal.png')}
            style={styles.studio3aLogo}
            resizeMode="contain"
          />
          <ThemedText style={styles.studio3aHeadline}>
            Sei vittima di un danno ed hai bisogno di assistenza?
          </ThemedText>
          <ThemedText style={styles.studio3aBody}>
            Studio 3A ti garantisce una{' '}
            <ThemedText style={styles.studio3aBold}>CONSULENZA GRATUITA</ThemedText>
            {' '}per ottenere il giusto risarcimento
          </ThemedText>
          <TouchableOpacity
            style={styles.studio3aCallButton}
            onPress={handleCallStudio3A}
            activeOpacity={0.8}>
            <IconSymbol name="phone.fill" size={18} color="#fff" />
            <ThemedText style={styles.studio3aCallButtonText}>
              Chiamaci per un consulto gratuito!
            </ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.studio3aPhone}>{STUDIO3A_PHONE}</ThemedText>
        </View>

        <ThemedView style={styles.itemsContainer}>
          {EMERGENZA_ITEMS.map((item) => (
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
  studio3aBanner: {
    backgroundColor: '#fff6ed',
    borderBottomWidth: 1,
    borderBottomColor: '#f5d9b8',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  studio3aLogo: {
    width: 180,
    height: 56,
    marginBottom: 4,
  },
  studio3aHeadline: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  studio3aBody: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  studio3aBold: {
    color: '#ef7d00',
    fontWeight: '700',
  },
  studio3aCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef7d00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  studio3aCallButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  studio3aPhone: {
    color: '#ef7d00',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
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
