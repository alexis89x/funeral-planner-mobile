import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ThemedText } from '@/components/themed-text';
import { BaseColors } from '@/constants/theme';
import { ApiService } from '@/utils/api';

const DOWNLOAD_URL = 'https://www.tramontosereno.it/download';
const STORAGE_KEY = '@update_banner_dismissed_version';

function isNewerVersion(remote: string, current: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const [rMaj, rMin, rPatch] = parse(remote);
  const [cMaj, cMin, cPatch] = parse(current);
  if (rMaj !== cMaj) return rMaj > cMaj;
  if (rMin !== cMin) return rMin > cMin;
  return rPatch > cPatch;
}

export function UpdateBanner() {
  const [visible, setVisible] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.get<string>('latest-app-update', undefined, { manualErrorManagement: true });
        const remote = res.version;
        if (!remote) return;

        const current = Constants.expoConfig?.version ?? '0.0.0';
        if (!isNewerVersion(remote, current)) return;

        const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
        if (dismissed === remote) return;

        setRemoteVersion(remote);
        setVisible(true);
      } catch {
        // silently ignore — update check is non-critical
      }
    })();
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    AsyncStorage.setItem(STORAGE_KEY, remoteVersion);
  };

  const handleUpdate = () => {
    setVisible(false);
    AsyncStorage.setItem(STORAGE_KEY, remoteVersion);
    Linking.openURL(DOWNLOAD_URL);
  };

  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <ThemedText style={styles.title}>Aggiornamento disponibile</ThemedText>
      <ThemedText style={styles.text}>
        È disponibile la versione {remoteVersion} dell'app. Aggiorna per ricevere le ultime novità.
      </ThemedText>
      <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
        <ThemedText style={styles.updateText}>Aggiorna ora</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <ThemedText style={styles.closeText}>✕</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BaseColors.main,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 16,
    padding: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
  },
  updateButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  updateText: {
    color: BaseColors.main,
    fontSize: 15,
    fontWeight: '700',
  },
});