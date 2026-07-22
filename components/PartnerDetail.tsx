import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  View,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getSecurityHeaders } from '@/utils/security';
import { TramontoSerenoLogo } from '@/components/TramontoSerenoLogo';
import { API_BASE_URL } from "@/utils/api";

interface PartnerDetailData {
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
  category: string;
}

interface PartnerDetailProps {
  partnerId: string | number;
  showBackButton?: boolean;
  showPurchaseButton?: boolean;
}

export function PartnerDetail({ partnerId, showBackButton = true, showPurchaseButton = false }: PartnerDetailProps) {
  const { token } = useAuth();
  const [partner, setPartner] = useState<PartnerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerDetails = useCallback(async () => {
    if (!partnerId) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      api: 'partner-get',
      id: String(partnerId),
    });

    try {
      const securityHeaders = getSecurityHeaders(token);

      const response = await fetch(
        `${API_BASE_URL}/api-gateway.php?${params.toString()}`,
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
  }, [partnerId, token]);

  useEffect(() => {
    (async () => {
      await fetchPartnerDetails();
    })();
  }, [fetchPartnerDetails]);

  const handleCall = () => {
    if (partner?.phone) {
      const phones = partner.phone.split(';').map(p => p.trim()).filter(Boolean);
      if (phones.length > 0) {
        Linking.openURL(`tel:${phones[0].replace(/\s/g, '')}`);
      }
    }
  };

  const handleEmail = () => {
    const email = partner?.email || partner?.pec;
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleWebsite = () => {
    if (partner?.url) {
      Alert.alert(
        'Apertura browser esterno',
        'Stai per aprire il sito web in un browser esterno. Vuoi continuare?',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Apri', onPress: () => Linking.openURL(partner.url) }
        ]
      );
    }
  };

  const handleFacebook = () => {
    if (partner?.facebook) {
      const url = partner.facebook.startsWith('http')
        ? partner.facebook
        : `https://www.facebook.com/${partner.facebook}`;
      Alert.alert(
        'Apertura app esterna',
        'Stai per aprire Facebook. Vuoi continuare?',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Apri', onPress: () => Linking.openURL(url) }
        ]
      );
    }
  };

  const handleInstagram = () => {
    if (partner?.instagram) {
      const cleanInstagram = partner.instagram.replace(/\/$/, '');
      const url = `https://www.instagram.com/${cleanInstagram}`;
      Alert.alert(
        'Apertura app esterna',
        'Stai per aprire Instagram. Vuoi continuare?',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Apri', onPress: () => Linking.openURL(url) }
        ]
      );
    }
  };

  const handleMaps = () => {
    if (partner?.full_address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.full_address)}`;
      Linking.openURL(url);
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<br\s*\/?>/gi, '\n\n').replace(/<\/?[^>]+(>|$)/g, '');
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
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Logo Header - only if logo exists */}
        {partner.logo && (
          <View style={styles.logoContainer}>
            <TramontoSerenoLogo width={140} color={BaseColors.main} />
          </View>
        )}

        {/* Title */}
        <ThemedText style={styles.title}>{partner.shop_name}</ThemedText>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          <View style={styles.badgeGrey}>
            <ThemedText style={styles.badgeGreyText}>Onoranza funebre</ThemedText>
          </View>
          {partner.can_manage_plans === 1 && (
            <View style={styles.badgeBlue}>
              <ThemedText style={styles.badgeBlueText}>Partner affiliato</ThemedText>
            </View>
          )}
        </View>

        {/* CTA Button - Hidden for now */}
        {showPurchaseButton && (
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
            <ThemedText style={styles.ctaButtonText}>
              Acquista una pianificazione
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Description - Hide for funeral_operator */}
        {partner.description && partner.category !== 'funeral_operator' && (
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionText}>
              {stripHtml(partner.description)}
            </ThemedText>
          </View>
        )}

        {/* Contatti Section - Unified with Address first */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Contatti</ThemedText>

          <View style={styles.contactsList}>
            {/* Address - Priority first */}
            {partner.full_address && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleMaps}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactIcon}>📍</ThemedText>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactValue} numberOfLines={2}>
                    {partner.full_address}
                  </ThemedText>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </TouchableOpacity>
            )}

            {/* Email */}
            {(partner.email || partner.pec) && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleEmail}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactIcon}>✉️</ThemedText>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactValue} numberOfLines={1}>
                    {partner.email || partner.pec}
                  </ThemedText>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </TouchableOpacity>
            )}

            {/* Phone */}
            {partner.phone && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleCall}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactIcon}>📞</ThemedText>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactValue}>
                    {partner.phone.split(';')[0].trim()}
                  </ThemedText>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </TouchableOpacity>
            )}

            {/* Website */}
            {partner.url && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleWebsite}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactIcon}>🌐</ThemedText>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactValue} numberOfLines={1}>
                    Visita il sito web
                  </ThemedText>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </TouchableOpacity>
            )}

            {/* Facebook */}
            {partner.facebook && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleFacebook}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactIcon}>📘</ThemedText>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactValue}>Profilo Facebook</ThemedText>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </TouchableOpacity>
            )}

            {/* Instagram */}
            {partner.instagram && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleInstagram}
                activeOpacity={0.7}>
                <ThemedText style={styles.contactIcon}>📷</ThemedText>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactValue}>Profilo Instagram</ThemedText>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom CTA - Hidden for now */}
        {showPurchaseButton && (
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
            <ThemedText style={styles.ctaButtonText}>
              Acquista una pianificazione
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Back Button */}
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <ThemedText style={styles.backButtonText}>← Indietro</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollContent: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: BaseColors.main,
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  badgeGrey: {
    backgroundColor: '#e0e3e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeGreyText: {
    fontSize: 12,
    color: '#333',
  },
  badgeBlue: {
    backgroundColor: '#4B61D1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeBlueText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: BaseColors.main,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  contactsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: BaseColors.mainLight,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactValue: {
    fontSize: 16,
    color: BaseColors.main,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: BaseColors.main,
    fontWeight: '300',
    opacity: 0.5,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BaseColors.main,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  backButtonText: {
    fontSize: 15,
    color: BaseColors.main,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },
});
