import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { getSecurityHeaders } from '@/utils/security';

interface PartnerDetail {
  id: number;
  shop_name: string;
  description: string;
  full_address: string;
  street: string;
  street_number: string;
  city: string;
  province: string;
  zip_code: string;
  region: string;
  phone: string;
  email: string;
  pec: string;
  url: string;
  facebook: string;
  instagram: string;
  logo: string;
  can_manage_plans: number;
  lat: number;
  lng: number;
}

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const { token } = useAuth();
  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartnerDetails();
  }, [id]);

  const fetchPartnerDetails = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      api: 'partner-get',
      id: id,
    });

    try {
      const securityHeaders = getSecurityHeaders(token);

      const response = await fetch(
        `https://api.tramontosereno.it/api-gateway.php?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...securityHeaders,
          },
        }
      );
      const data = await response.json();

      if (data.result === 'ok' && data.data) {
        setPartner(data.data);
      } else {
        setError('Partner non trovato');
      }
    } catch (err) {
      setError('Errore durante il caricamento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (partner?.phone) {
      Linking.openURL(`tel:${partner.phone}`);
    }
  };

  const handleEmail = () => {
    if (partner?.email) {
      Linking.openURL(`mailto:${partner.email}`);
    }
  };

  const handleWebsite = () => {
    if (partner?.url) {
      Linking.openURL(partner.url);
    }
  };

  const handleFacebook = () => {
    if (partner?.facebook) {
      const url = partner.facebook.startsWith('http')
        ? partner.facebook
        : `https://www.facebook.com/${partner.facebook}`;
      Linking.openURL(url);
    }
  };

  const handleInstagram = () => {
    if (partner?.instagram) {
      const url = `https://www.instagram.com/${partner.instagram}`;
      Linking.openURL(url);
    }
  };

  const handleMaps = () => {
    if (partner?.lat && partner?.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${partner.lat},${partner.lng}`;
      Linking.openURL(url);
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '');
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BaseColors.main} />
      </ThemedView>
    );
  }

  if (error || !partner) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>
          {error || 'Partner non trovato'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.content}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {partner.shop_name}
            </ThemedText>
            {partner.can_manage_plans === 1 && (
              <View
                style={[styles.badge, { backgroundColor: BaseColors.mainLight }]}>
                <ThemedText style={styles.badgeText}>
                  Partner Certificato
                </ThemedText>
              </View>
            )}
          </ThemedView>

          {/* Description */}
          {partner.description && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Descrizione
              </ThemedText>
              <ThemedText style={styles.description}>
                {stripHtml(partner.description)}
              </ThemedText>
            </ThemedView>
          )}

          {/* Contact Info */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Contatti
            </ThemedText>

            {/* Address */}
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleMaps}
              activeOpacity={0.7}>
              <ThemedText style={styles.contactLabel}>Indirizzo</ThemedText>
              <ThemedText style={styles.contactValue}>
                {partner.full_address}
              </ThemedText>
            </TouchableOpacity>

            {/* Phone */}
            {partner.phone && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleCall}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactLabel}>Telefono</ThemedText>
                <ThemedText style={[styles.contactValue, styles.link]}>
                  {partner.phone}
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* Email */}
            {partner.email && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleEmail}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactLabel}>Email</ThemedText>
                <ThemedText style={[styles.contactValue, styles.link]}>
                  {partner.email}
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* PEC */}
            {partner.pec && (
              <View style={styles.contactItem}>
                <ThemedText style={styles.contactLabel}>PEC</ThemedText>
                <ThemedText style={styles.contactValue}>{partner.pec}</ThemedText>
              </View>
            )}

            {/* Website */}
            {partner.url && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleWebsite}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactLabel}>Sito Web</ThemedText>
                <ThemedText style={[styles.contactValue, styles.link]}>
                  {partner.url}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>

          {/* Social Media */}
          {(partner.facebook || partner.instagram) && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Social Media
              </ThemedText>
              <View style={styles.socialContainer}>
                {partner.facebook && (
                  <TouchableOpacity
                    style={[
                      styles.socialButton,
                      { backgroundColor: '#1877F2' },
                    ]}
                    onPress={handleFacebook}
                    activeOpacity={0.8}>
                    <ThemedText style={styles.socialButtonText}>
                      Facebook
                    </ThemedText>
                  </TouchableOpacity>
                )}
                {partner.instagram && (
                  <TouchableOpacity
                    style={[
                      styles.socialButton,
                      { backgroundColor: '#E4405F' },
                    ]}
                    onPress={handleInstagram}
                    activeOpacity={0.8}>
                    <ThemedText style={styles.socialButtonText}>
                      Instagram
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </ThemedView>
          )}

          {/* Action Buttons */}
          <ThemedView style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: BaseColors.main }]}
              onPress={handleCall}
              activeOpacity={0.8}>
              <ThemedText style={styles.actionButtonText}>
                Chiama Ora
              </ThemedText>
            </TouchableOpacity>

            {partner.url && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.actionButtonSecondary,
                  { borderColor: BaseColors.main },
                ]}
                onPress={handleWebsite}
                activeOpacity={0.8}>
                <ThemedText
                  style={[styles.actionButtonText, { color: BaseColors.main }]}>
                  Visita Sito
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: BaseColors.mainDark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  contactItem: {
    marginBottom: 16,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
  },
  link: {
    color: BaseColors.main,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: BaseColors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});