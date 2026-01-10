import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { api, APP_BASE_URL } from '@/utils/api';

interface ServiceItem {
  id: string;
  url: string;
  title: string;
  desc: string;
  icon: string;
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
  'list': 'list.bullet',
  'person': 'person.fill',
  'phone': 'phone.fill',
  'info': 'info.circle.fill',
  'gear': 'gearshape.fill',
  'envelope': 'envelope.fill',
  'star': 'star.fill',
  'bookmark': 'bookmark.fill',
};

export default function ServicesScreen() {
  const colorScheme = useColorScheme();
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ServicesResponse>('services-available');

      if (response.result === 'ok' && response.data) {
        setServices(response.data);
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
      const fullUrl = `${APP_BASE_URL}${service.url}?forceMode=mobile`;
      router.push({
        pathname: `/services/webview`,
        params: {
          url: fullUrl,
          title: service.title
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
        <ThemedView style={styles.header}>
          <ThemedText style={styles.subtitle}>
            Scegli il servizio di cui hai bisogno
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.servicesContainer}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={service.id || index}
              style={[
                styles.serviceCard,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  borderColor: BaseColors.borderLight,
                },
              ]}
              onPress={() => handleServicePress(service)}
              activeOpacity={0.7}>
              <ThemedView style={styles.serviceCardContent}>
                <ThemedView
                  style={[
                    styles.iconContainer,
                    { backgroundColor: BaseColors.mainLightest },
                  ]}>
                  <IconSymbol
                    name={getIconName(service.icon) as any}
                    size={32}
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
