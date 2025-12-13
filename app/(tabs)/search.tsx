import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Partner {
  id: number;
  shop_name: string;
  full_address: string;
  street: string;
  street_number: string;
  city: string;
  province: string;
  zip_code: string;
  region: string;
  distance_km: number;
  phone: string;
  email: string;
  url: string;
  logo: string;
  category: string;
  lat: number;
  lng: number;
  can_manage_plans: number;
}

interface SearchParams {
  q: string;
  distance: number;
  city: string;
  province: string;
  category: string;
}

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [distance, setDistance] = useState('5');
  const [results, setResults] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPartners = async () => {
    if (!city || !province) {
      setError('Inserisci città e provincia');
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      api: 'partner-search',
      q: searchQuery || '',
      distance: distance,
      city: city,
      category: 'funeral_operator',
      province: province,
      excludeExternal: '0',
      page: '1',
      itemsPerPage: '10',
      userEmail: '',
      forWhom: '',
    });

    try {
      const response = await fetch(
        `https://api.tramontosereno.it/api-gateway.php?${params.toString()}`
      );
      const data = await response.json();

      if (data.result === 'ok' && data.data && data.data.length > 0) {
        setResults(data.data);
      } else {
        setError('Nessun risultato trovato');
        setResults([]);
      }
    } catch (err) {
      setError('Errore durante la ricerca');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderPartner = ({ item }: { item: Partner }) => (
    <ThemedView style={styles.partnerCard}>
      <ThemedText type="defaultSemiBold" style={styles.partnerName}>
        {item.shop_name}
      </ThemedText>

      <ThemedText style={styles.partnerDetail}>
        {item.full_address}
      </ThemedText>

      {item.distance_km !== undefined && (
        <ThemedText style={styles.distance}>
          {item.distance_km.toFixed(1)} km di distanza
        </ThemedText>
      )}

      {item.phone && (
        <ThemedText style={styles.partnerDetail}>
          Tel: {item.phone}
        </ThemedText>
      )}

      {item.url && (
        <ThemedText style={[styles.partnerDetail, styles.link]}>
          {item.url}
        </ThemedText>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Ricerca Onoranze Funebri
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.searchForm}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Nome (opzionale)</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].icon,
                },
              ]}
              placeholder="Cerca per nome..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <ThemedText style={styles.label}>Città *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                  },
                ]}
                placeholder="es. Milano"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <ThemedText style={styles.label}>Provincia *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                  },
                ]}
                placeholder="es. MI"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                value={province}
                onChangeText={(text) => setProvince(text.toUpperCase())}
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Distanza (km)</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].icon,
                },
              ]}
              placeholder="5"
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.searchButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint },
            ]}
            onPress={searchPartners}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.searchButtonText}>Cerca</ThemedText>
            )}
          </TouchableOpacity>

          {error && (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.resultsContainer}>
          {results.length > 0 && (
            <ThemedText type="subtitle" style={styles.resultsTitle}>
              Risultati ({results.length})
            </ThemedText>
          )}
          <FlatList
            data={results}
            renderItem={renderPartner}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
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
  },
  title: {
    fontSize: 28,
  },
  searchForm: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  searchButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#ff4444',
    marginTop: 12,
    textAlign: 'center',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsTitle: {
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  partnerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 18,
    marginBottom: 8,
  },
  partnerDetail: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  distance: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
    opacity: 0.7,
  },
  link: {
    color: '#0066cc',
  },
});