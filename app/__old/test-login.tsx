import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { API_BASE_URL } from '@/utils/api';
import { getSecurityHeaders } from '@/utils/security';
import { getDeviceInfo } from '@/utils/device';
import { logRequest, logResponse, logFormData } from '@/utils/http-logger';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TestLoginScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log('\n🧪 ===== TEST LOGIN =====');

      // Get device info
      const deviceInfo = await getDeviceInfo();

      // Create FormData
      const formData = new FormData();
      formData.append('username', 'a.piana89+5@gmail.com');
      formData.append('password', 'test');
      formData.append('role', '100');
      formData.append('device', deviceInfo.device);
      formData.append('os', deviceInfo.os);
      formData.append('browser', deviceInfo.browser);
      formData.append('user_agent', deviceInfo.userAgent);

      // Log FormData
      console.log('\n📦 FormData Contents:');
      logFormData(formData, 'Test Login FormData');

      // Get security headers
      const securityHeaders = getSecurityHeaders(undefined);
      console.log('\n🔒 Security Headers:', JSON.stringify(securityHeaders, null, 2));

      const headers: Record<string, string> = {
        ...securityHeaders,
      };

      const url = `${API_BASE_URL}/api-gateway.php?api=login`;
      console.log('\n🌐 Request URL:', url);

      const requestOptions: RequestInit = {
        method: 'POST',
        body: formData,
        headers,
      };

      // Log request
      const logEntry = logRequest('POST', url, requestOptions);

      console.log('\n🚀 Sending request...');

      // Make request
      const response = await fetch(url, requestOptions);

      console.log('\n📡 Response received:');
      console.log('Status:', response.status, response.statusText);

      // Read response
      const responseText = await response.text();
      console.log('\n📄 Raw Response:', responseText);

      let data: any;
      try {
        data = JSON.parse(responseText);
        console.log('\n✅ Parsed JSON:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('\n❌ JSON Parse Error:', parseError);
        data = { error: 'Invalid JSON', raw: responseText };
      }

      // Log response
      await logResponse(logEntry, response, data);

      // Set result
      setResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: data,
      });

      console.log('\n✅ ===== TEST COMPLETE =====\n');
    } catch (err: any) {
      console.error('\n❌ ===== TEST ERROR =====');
      console.error('Error:', err);
      console.error('Error Message:', err.message);
      console.error('Error Stack:', err.stack);
      console.error('===== END TEST ERROR =====\n');

      setError(err.message || 'Unknown error');
      setResult({ error: err.message, details: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Test Login API</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test diretto della chiamata API di login
        </ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={testLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Test Login</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#ffebee' }]}>
            <ThemedText style={[styles.errorText, { color: '#c62828' }]}>
              ❌ Error: {error}
            </ThemedText>
          </View>
        )}

        {result && (
          <View style={styles.jsonContainer}>
            <ThemedText type="subtitle" style={styles.resultTitle}>
              Risultato API:
            </ThemedText>
            <View style={[styles.jsonBox, { backgroundColor: colors.cardBackground }]}>
              <ThemedText style={styles.jsonText}>
                {JSON.stringify(result, null, 2)}
              </ThemedText>
            </View>
          </View>
        )}

        {!result && !error && !loading && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Premi Test Login per fare una chiamata di test alle API
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  errorBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  jsonContainer: {
    marginBottom: 20,
  },
  resultTitle: {
    marginBottom: 12,
  },
  jsonBox: {
    padding: 16,
    borderRadius: 8,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
  },
});
