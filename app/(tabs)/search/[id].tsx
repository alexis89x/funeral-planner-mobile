import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getSecurityHeaders } from '@/utils/security';
import { TramontoSerenoLogo } from '@/components/TramontoSerenoLogo';

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
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <TramontoSerenoLogo width={140} color={BaseColors.main} />
        </View>

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

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <ThemedText style={styles.ctaButtonText}>
            Acquista una pianificazione
          </ThemedText>
        </TouchableOpacity>

        {/* Description */}
        {partner.description && (
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionText}>
              {stripHtml(partner.description)}
            </ThemedText>
          </View>
        )}

        {/* Contatti Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Contatti</ThemedText>

          <View style={styles.contactsGrid}>
            {/* Email */}
            {partner.email && (
              <TouchableOpacity
                style={styles.contactCard}
                onPress={handleEmail}
                activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <ThemedText style={styles.iconText}>✉️</ThemedText>
                </View>
                <ThemedText style={styles.contactLabel}>E-mail</ThemedText>
                <ThemedText style={styles.contactLink} numberOfLines={1}>
                  {partner.email}
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* Phone */}
            {partner.phone && (
              <TouchableOpacity
                style={styles.contactCard}
                onPress={handleCall}
                activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <ThemedText style={styles.iconText}>📞</ThemedText>
                </View>
                <ThemedText style={styles.contactLabel}>Telefono</ThemedText>
                <ThemedText style={styles.contactLink}>
                  {partner.phone}
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* Website */}
            {partner.url && (
              <TouchableOpacity
                style={styles.contactCard}
                onPress={handleWebsite}
                activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <ThemedText style={styles.iconText}>🌐</ThemedText>
                </View>
                <ThemedText style={styles.contactLabel}>Sito web</ThemedText>
                <ThemedText style={styles.contactLink} numberOfLines={1}>
                  Vai al sito
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Social Media */}
        {(partner.facebook || partner.instagram) && (
          <View style={styles.socialGrid}>
            {partner.facebook && (
              <TouchableOpacity
                style={styles.socialCard}
                onPress={handleFacebook}
                activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <ThemedText style={styles.iconText}>📘</ThemedText>
                </View>
                <ThemedText style={styles.contactLabel}>Facebook</ThemedText>
                <ThemedText style={styles.contactLink}>Profilo</ThemedText>
              </TouchableOpacity>
            )}

            {partner.instagram && (
              <TouchableOpacity
                style={styles.socialCard}
                onPress={handleInstagram}
                activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <ThemedText style={styles.iconText}>📷</ThemedText>
                </View>
                <ThemedText style={styles.contactLabel}>Instagram</ThemedText>
                <ThemedText style={styles.contactLink}>Profilo</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Indirizzo Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Indirizzo</ThemedText>
          <TouchableOpacity onPress={handleMaps} activeOpacity={0.8}>
            <ThemedText style={styles.addressText}>
              {partner.full_address}
            </ThemedText>
          </TouchableOpacity>

          {/* Map Placeholder */}
          <TouchableOpacity
            style={styles.mapPlaceholder}
            onPress={handleMaps}
            activeOpacity={0.8}>
            <ThemedText style={styles.mapText}>
              📍 Apri in Mappe
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Bottom CTA */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <ThemedText style={styles.ctaButtonText}>
            Acquista una pianificazione
          </ThemedText>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}>
          <ThemedText style={styles.backButtonText}>← Indietro</ThemedText>
        </TouchableOpacity>
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
  contactsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  contactCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconText: {
    fontSize: 32,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactLink: {
    fontSize: 12,
    color: BaseColors.main,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 15,
    color: BaseColors.main,
    textAlign: 'center',
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mapText: {
    fontSize: 16,
    color: BaseColors.main,
    fontWeight: '600',
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