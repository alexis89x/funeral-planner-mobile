import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 ore
const WEBVIEW_LOAD_TIMES_KEY = '@webview_load_times';

const normalizeUrl = (url: string): string => url.split('?')[0];

/**
 * Ritorna true se la cache per questo URL è scaduta (o non esiste).
 * In quel caso il chiamante deve aggiungere un timestamp alla URL per forzare il refresh.
 */
export const isWebviewCacheStale = async (url: string): Promise<boolean> => {
  try {
    const stored = await AsyncStorage.getItem(WEBVIEW_LOAD_TIMES_KEY);
    if (!stored) {
      console.log("Webview cache not found");
      return true;
    };
    const times: Record<string, number> = JSON.parse(stored);
    const lastLoad = times[normalizeUrl(url)];
    if (!lastLoad) {
      console.log("Webview cache not found last load");
      return true;
    }
    const cached = Date.now() - lastLoad > CACHE_DURATION_MS;
    console.log("Cached?", cached);
    return cached;
  } catch {
    return true;
  }
};

/**
 * Cancella tutti i timestamp di cache (da chiamare al logout).
 */
export const clearWebviewCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WEBVIEW_LOAD_TIMES_KEY);
  } catch {
    // ignore
  }
};

/**
 * Segna l'URL come caricato adesso, resettando il timer di cache.
 */
export const markWebviewLoaded = async (url: string): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(WEBVIEW_LOAD_TIMES_KEY);
    const times: Record<string, number> = stored ? JSON.parse(stored) : {};
    times[normalizeUrl(url)] = Date.now();
    await AsyncStorage.setItem(WEBVIEW_LOAD_TIMES_KEY, JSON.stringify(times));
  } catch {
    // ignore
  }
};
