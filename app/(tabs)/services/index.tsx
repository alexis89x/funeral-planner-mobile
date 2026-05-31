import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api, APP_BASE_URL } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

export const SERVICES_STORAGE_KEY = '@funeral_planner_services';

interface ServiceItem {
  id: string;
  url: string;
  title: string;
  desc: string;
  icon: string;
  minVersion?: number;
}

interface ServicesResponse {
  result: string;
  count: number;
  data: ServiceItem[];
  status: number;
  lastActivity: number;
}

// Mappa per le icone
const iconMap: Record<string, string> = {
  'heart': 'heart.fill',
  'calendar': 'calendar',
  'save': 'doc.text.fill',
  'doc': 'doc.fill',
  'document': 'doc.text.fill',
  'seal': 'seal.fill',
  'list': 'list.bullet',
  'person': 'person.fill',
  'phone': 'phone.fill',
  'info': 'info.circle.fill',
  'gear': 'gearshape.fill',
  'envelope': 'envelope.fill',
  'star': 'star.fill',
  'bookmark': 'bookmark.fill',
  'building': 'building.2.fill',
  'bag': 'bag.fill',
  'home': 'house.fill'
};

export default function ServicesScreen() {
  const colorScheme = useColorScheme();
  const { userProfile } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get app version
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appMajorVersion = parseInt(appVersion.split('.')[0], 10);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Controlla prima se ci sono servizi in cache
      const cachedServices = await AsyncStorage.getItem(SERVICES_STORAGE_KEY);
      if (cachedServices) {
        console.log('📦 Caricamento servizi dalla cache');
        setServices(JSON.parse(cachedServices));
        setLoading(false);
        return;
      }

      // Se non ci sono servizi in cache, fai la chiamata API
      console.log('🌐 Caricamento servizi da API');
      const response = await api.get<ServicesResponse>('services-available');
      console.log(response);
      if (response.data) {
        const servicesData = response.data as unknown as ServiceItem[];
        setServices(servicesData);
        // Salva i servizi in cache
        await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesData));
        console.log('💾 Servizi salvati in cache');
      } else {
        setError('Errore nel caricamento dei servizi');
      }
    } catch (err) {
      console.error('Errore nel caricamento dei servizi:', err);
      setError('Impossibile caricare i servizi');
    } finally {
      setLoading(false);
    }
  };

  const handleServicePress = (service: ServiceItem) => {
    // Se l'URL inizia con /, naviga su webview con set-token
    if (service.url.startsWith('/')) {

      const fullUrl = `${APP_BASE_URL}${service.url}?standalone=true&forceMode=mobile`;
      router.push({
        pathname: `/services/webview`,
        params: {
          url: fullUrl,
          title: service.title,
          ...(service.id === 'dat' && { showPlanSwitcher: 'true' }),
        }
      });
    }
    // Se l'URL ha una chiocciola (@), togli la chiocciola e naviga localmente
    else if (service.url.includes('@')) {
      const localRoute = service.url.replace('@', '');
      router.push(localRoute as any);
    }
  };

  const getIconName = (iconName: string): string => {
    return iconMap[iconName] || 'circle.fill';
  };

  // Filter services based on minVersion
  const filteredServices = services.filter(service => {
    // If no minVersion specified, always show
    if (!service.minVersion) return true;
    // Show only if app version is >= minVersion
    return appMajorVersion >= service.minVersion;
  });

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BaseColors.main} />
          <ThemedText style={styles.loadingText}>Caricamento servizi...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={BaseColors.main} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: BaseColors.main }]}
            onPress={loadServices}>
            <ThemedText style={styles.retryButtonText}>Riprova</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.servicesContainer}>
          <TouchableOpacity
            style={[styles.serviceRow, { borderBottomColor: BaseColors.borderLight }]}
            onPress={() => router.push('/(tabs)/services/uploads')}
            activeOpacity={0.7}>
            <ThemedView style={styles.serviceRowContent}>
              <ThemedView style={[styles.iconContainer, { backgroundColor: BaseColors.mainLightest }]}>
                <IconSymbol name="arrow.up.doc.fill" size={28} color={BaseColors.main} />
              </ThemedView>
              <ThemedView style={styles.textContainer}>
                <ThemedText type="defaultSemiBold" style={styles.serviceTitle}>
                  Documenti digitali
                </ThemedText>
                <ThemedText style={styles.serviceDescription}>
                  Gestisci i tuoi documenti e allegati
                </ThemedText>
              </ThemedView>
              <IconSymbol name="chevron.right" size={20} color={BaseColors.greyMedium} />
            </ThemedView>
          </TouchableOpacity>
          {!userProfile?.user?.id_partner_referral && (
            <TouchableOpacity
              style={[styles.serviceRow, { borderBottomColor: BaseColors.borderLight }]}
              onPress={() => router.push('/cerca-onoranze')}
              activeOpacity={0.7}>
              <ThemedView style={styles.serviceRowContent}>
                <ThemedView style={[styles.iconContainer, { backgroundColor: BaseColors.mainLightest }]}>
                  <IconSymbol name="magnifyingglass" size={28} color={BaseColors.main} />
                </ThemedView>
                <ThemedView style={styles.textContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.serviceTitle}>
                    Cerca onoranze funebri
                  </ThemedText>
                  <ThemedText style={styles.serviceDescription}>
                    Trova un'onoranza funebre vicino a te
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color={BaseColors.greyMedium} />
              </ThemedView>
            </TouchableOpacity>
          )}
          {filteredServices.map((service, index) => (
            <TouchableOpacity
              key={service.id || index}
              style={[
                styles.serviceRow,
                { borderBottomColor: BaseColors.borderLight },
              ]}
              onPress={() => handleServicePress(service)}
              activeOpacity={0.7}>
              <ThemedView style={styles.serviceRowContent}>
                <ThemedView
                  style={[
                    styles.iconContainer,
                    { backgroundColor: BaseColors.mainLightest },
                  ]}>
                  <IconSymbol
                    name={getIconName(service.icon) as any}
                    size={28}
                    color={BaseColors.main}
                  />
                </ThemedView>
                <ThemedView style={styles.textContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.serviceTitle}>
                    {service.title}
                  </ThemedText>
                  <ThemedText style={styles.serviceDescription}>
                    {service.desc}
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
  servicesContainer: {
    paddingBottom: 40,
  },
  serviceRow: {
    borderBottomWidth: 1,
  },
  serviceRowContent: {
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
  serviceTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
