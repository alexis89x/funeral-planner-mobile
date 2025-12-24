import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { readLogsFromFile, clearLogFile, getLogFilePath } from '@/utils/file-logger';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function DebugLogsScreen() {
  const [logs, setLogs] = useState<string>('Loading...');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const content = await readLogsFromFile();
    setLogs(content);
    setLastRefresh(new Date());
  };

  const handleClearLogs = async () => {
    await clearLogFile();
    await loadLogs();
  };

  const handleShareLogs = async () => {
    try {
      await Share.share({
        message: logs,
        title: 'API Request Logs',
      });
    } catch (error) {
      console.error('Error sharing logs:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Debug Logs</ThemedText>
        <ThemedText style={styles.subtitle}>
          Last refresh: {lastRefresh.toLocaleTimeString()}
        </ThemedText>
        <ThemedText style={styles.path}>
          File: {getLogFilePath()}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={loadLogs}>
          <IconSymbol name="arrow.clockwise" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>Refresh</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={handleShareLogs}>
          <IconSymbol name="square.and.arrow.up" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>Share</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF3B30' }]}
          onPress={handleClearLogs}>
          <IconSymbol name="trash" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>Clear</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logsContainer}>
        <ThemedText style={styles.logsText}>{logs}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  path: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.5,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    padding: 16,
  },
  logsText: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
  },
});
