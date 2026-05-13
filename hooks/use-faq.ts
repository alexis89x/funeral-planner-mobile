import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '@/utils/api';
import localFaqData from '@/assets/faq.json';

const CACHE_KEY = '@faq_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day in ms

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  faqs: FaqItem[];
}

export interface FaqData {
  categories: FaqCategory[];
}

interface CachedFaq {
  data: FaqData;
  timestamp: number;
}

export function useFaq() {
  const [faqData, setFaqData] = useState<FaqData>(localFaqData as FaqData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFaq() {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedFaq = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            if (!cancelled) setFaqData(parsed.data);
            return;
          }
        }
      } catch {
        // ignore cache read errors
      }

      try {
        const response = await ApiService.get<FaqData>('faq-get', undefined, {
          manualErrorManagement: true,
        });
        if (response?.data?.categories?.length) {
          const entry: CachedFaq = { data: response.data, timestamp: Date.now() };
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry)).catch(() => {});
          if (!cancelled) setFaqData(response.data);
        }
      } catch {
        // fall back to local data (already set as default state)
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFaq();
    return () => { cancelled = true; };
  }, []);

  return { faqData, loading };
}
