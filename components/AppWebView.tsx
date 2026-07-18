import React, { forwardRef } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { WebView, WebViewProps } from 'react-native-webview';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Colors, ACTIVE_THEME } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { handleWebViewMessage } from '@/utils/webview-message-handler';

type AppWebViewProps = {
  uri: string | null;
  injectToken?: boolean;
  injectedJavaScript?: string;
  onLoadEnd?: () => void;
  onRefreshUser?: () => Promise<void>;
  onData?: (data: any) => void;
  style?: WebViewProps['style'];
};

const AppWebView = forwardRef<WebView, AppWebViewProps>(
  ({ uri, injectToken = false, injectedJavaScript, onLoadEnd, onRefreshUser, onData, style }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { token, userProfile } = useAuth();

    const handleMessage = async (event: any) => {
      await handleWebViewMessage(event, {
        onGoBack: () => router.back(),
        onNavigate: (route) => router.push(route as any),
        userProfile,
        ...(onRefreshUser && { onRefreshUser }),
        ...(onData && { onData }),
      });
    };

    const tokenInjection = injectToken
      ? `const user = { token: "${token}", role: 150, status: 310 };
  localStorage.setItem('uinfo', JSON.stringify(user));`
      : '';

    const appVersion = Constants.expoConfig?.version ?? '0.0.0';

    const fullInjection = `(function() {
  window.tsMobileApp = true;
  window.tsMobileAppVersion = "${appVersion}";
  window.tsTheme = "${ACTIVE_THEME}";
  ${tokenInjection}
  ${injectedJavaScript ?? ''}
  true;
})();`;

    if (!uri) return null;

    console.log('[AppWebView] loading URL:', uri);

    return (
      <WebView
        ref={ref}
        source={{ uri }}
        style={[styles.webview, style]}
        startInLoadingState={false}
        javaScriptEnabled={true}
        cacheEnabled={true}
        sharedCookiesEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        injectedJavaScriptBeforeContentLoaded={fullInjection}
        onMessage={handleMessage}
        onLoadEnd={onLoadEnd}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        )}
      />
    );
  }
);

AppWebView.displayName = 'AppWebView';

export default AppWebView;

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
