import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api } from '@/utils/api';

const PRODUCTS_STORAGE_KEY = '@funeral_planner_products';
const PRODUCTS_CACHE_TTL = 24 * 60 * 60 * 1000;

interface Product {
  id: number;
  product_name: string;
  short_description: string;
  description: string;
  price: number;
  was_price: number;
  image_url: string;
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const cached = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < PRODUCTS_CACHE_TTL) {
          setProducts(cachedData);
          setLoading(false);
          return;
        }
      }

      const response = await api.post('products-search', { category: '', page: 1 });
      if (response.data) {
        const data = response.data as unknown as Product[];
        setProducts(data);
        await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      } else {
        setError('Errore nel caricamento dei prodotti');
      }
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti:', err);
      setError('Impossibile caricare i prodotti');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/services/product-detail' as any, params: { id: item.id } })}
      activeOpacity={0.7}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.productImage} resizeMode="cover" />
      ) : (
        <ThemedView style={styles.placeholderImage}>
          <IconSymbol name={"bag.fill" as any} size={32} color={BaseColors.greyDark} />
        </ThemedView>
      )}
      <ThemedView style={styles.productInfo}>
        <ThemedText type="defaultSemiBold" style={styles.productName} numberOfLines={2}>
          {item.product_name}
        </ThemedText>
        {item.short_description ? (
          <ThemedText style={styles.productDescription} numberOfLines={2}>
            {item.short_description}
          </ThemedText>
        ) : null}
        <ThemedView style={styles.priceRow}>
          <ThemedText type="defaultSemiBold" style={styles.price}>
            {formatPrice(item.price)}
          </ThemedText>
          {item.was_price > 0 && item.was_price !== item.price && (
            <ThemedText style={styles.wasPrice}>
              {formatPrice(item.was_price)}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={BaseColors.main} />
        <ThemedText style={styles.loadingText}>Caricamento prodotti...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={BaseColors.main} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: BaseColors.main }]}
          onPress={loadProducts}>
          <ThemedText style={styles.retryButtonText}>Riprova</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  productCard: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29, 51, 74, 0.1)',
    paddingBottom: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    color: BaseColors.main,
  },
  wasPrice: {
    fontSize: 14,
    color: BaseColors.grey,
    textDecorationLine: 'line-through',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
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
