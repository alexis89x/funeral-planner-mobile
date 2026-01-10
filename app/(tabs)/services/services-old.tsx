import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TramontoSerenoLogo } from '@/components/TramontoSerenoLogo';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  route: string;
}

const services: ServiceItem[] = [
  {
    title: 'Consulto Psicologico',
    description: 'Supporto psicologico professionale per te e la tua famiglia',
    icon: 'heart.fill',
    route: '/services/consulto-psicologico',
  },
  {
    title: 'Pianificazione con Lisa',
    description: 'Assistenza personalizzata per pianificare ogni dettaglio',
    icon: 'calendar',
    route: '/services/pianificazione-lisa',
  },
  {
    title: 'I Miei Piani',
    description: 'Visualizza e gestisci i tuoi piani salvati',
    icon: 'doc.text.fill',
    route: '/services/miei-piani',
  },
];

export default function ServicesScreen() {
  const colorScheme = useColorScheme();

  const handleServicePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.header}>
          <TramontoSerenoLogo width={120} color={BaseColors.main} />
          <ThemedText type="title" style={styles.title}>
            I Nostri Servizi
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Scegli il servizio di cui hai bisogno
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.servicesContainer}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.serviceCard,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  borderColor: BaseColors.borderLight,
                },
              ]}
              onPress={() => handleServicePress(service.route)}
              activeOpacity={0.7}>
              <ThemedView style={styles.serviceCardContent}>
                <ThemedView
                  style={[
                    styles.iconContainer,
                    { backgroundColor: BaseColors.mainLightest },
                  ]}>
                  <IconSymbol
                    name={service.icon as any}
                    size={32}
                    color={BaseColors.main}
                  />
                </ThemedView>
                <ThemedView style={styles.textContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.serviceTitle}>
                    {service.title}
                  </ThemedText>
                  <ThemedText style={styles.serviceDescription}>
                    {service.description}
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
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  serviceCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});