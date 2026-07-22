import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api, APP_BASE_URL } from '@/utils/api';

interface ProductDetail {
  id: number;
  product_name: string;
  description: string;
  short_description: string;
  price: number;
  was_price: number;
  image_url: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('products-get', { id });
      if (response.data) {
        setProduct(response.data as unknown as ProductDetail);
      } else {
        setError('Prodotto non trovato');
      }
    } catch (err) {
      console.error('Errore nel caricamento del prodotto:', err);
      setError('Impossibile caricare il prodotto');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      (async () => {
        await loadProduct();
      })();
    }
  }, [id, loadProduct]);

  // Update title when product is loaded
  /*useEffect(() => {
    if (product) {
      navigation.setOptions({
        title: product.product_name,
        headerBackTitle: 'Indietro',
      });
    }
  }, [product, navigation]);*/

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const handleBuy = async () => {
    if (!product) return;
    try {
      setBuying(true);
      await api.post('cart-add-item', { id_product: product.id, quantity: 1 });
      const checkoutUrl = `${APP_BASE_URL}/shop/checkout?standalone=true&forceMode=mobile`;
      router.push({
        pathname: '/services/webview',
        params: { url: checkoutUrl, title: 'Checkout' },
      });
    } catch (err) {
      console.error('Errore aggiunta al carrello:', err);
      Alert.alert('Errore', 'Impossibile aggiungere il prodotto al carrello.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={BaseColors.main} />
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.centered}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={BaseColors.main} />
        <ThemedText style={styles.errorText}>{error || 'Prodotto non trovato'}</ThemedText>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: BaseColors.main }]}
          onPress={loadProduct}>
          <ThemedText style={styles.retryButtonText}>Riprova</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={[styles.imageContainer, { backgroundColor: BaseColors.mainLightest }]}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="contain" />
          ) : (
            <ThemedView style={styles.placeholderImage}>
              <IconSymbol name={"bag.fill" as any} size={48} color={BaseColors.greyDark} />
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {product.product_name}
          </ThemedText>
          <ThemedView style={styles.priceRow}>
            <ThemedText type="defaultSemiBold" style={styles.price}>
              {formatPrice(product.price)}
            </ThemedText>
            {product.was_price > 0 && product.was_price !== product.price && (
              <ThemedText style={styles.wasPrice}>
                {formatPrice(product.was_price)}
              </ThemedText>
            )}
          </ThemedView>

          {product.description ? (
            <ThemedText style={styles.description}>
              {product.description}
            </ThemedText>
          ) : null}
        </ThemedView>
      </ScrollView>

      <ThemedView style={styles.buyBar}>
        <TouchableOpacity
          style={[styles.buyButton, buying && styles.buyButtonDisabled]}
          onPress={handleBuy}
          disabled={buying}
          activeOpacity={0.8}>
          {buying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.buyButtonText}>Acquista</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 228,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    color: BaseColors.main,
  },
  wasPrice: {
    fontSize: 18,
    color: BaseColors.grey,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  buyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  buyButton: {
    backgroundColor: BaseColors.main,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
