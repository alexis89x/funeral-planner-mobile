import { downloadPDF, downloadPDFFromURL } from './pdf-downloader';
import { APP_BASE_URL } from "@/utils/api";

export interface WebViewMessageHandlers {
  onGoBack?: () => void;
  onNavigate?: (route: string) => void;
  [key: string]: ((arg?: any) => void) | undefined;
}

/**
 * Handles messages from the WebView, including PDF downloads
 * @param event - The WebView message event
 * @param handlers - Optional callbacks for different actions (onGoBack, onNavigate, onData, custom actions)
 */
export const handleWebViewMessage = async (
  event: any,
  handlers: WebViewMessageHandlers
): Promise<void> => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📨 WEBVIEW MESSAGE RECEIVED');
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const rawData = event.nativeEvent.data;
    console.log('📦 Raw message data type:', typeof rawData);
    // console.log('📦 Raw message length:', rawData?.length || 0);

    if (!rawData) {
      console.warn('⚠️ Received empty message from webview');
      return;
    }

    // console.log('🔍 Parsing JSON...');
    const data = JSON.parse(rawData);
    // console.log('✅ JSON parsed successfully');
    console.log('📋 Message data:', JSON.stringify(data, (key, value) => {
      // Truncate base64 data in logs
      if (key === 'data' && typeof value === 'string' && value.length > 100) {
        return `[Base64 data: ${value.length} chars]`;
      }
      return value;
    }, 2));

    console.log('🎯 Action:', data.action);
    console.log('DATA RECEIVED', data);
    switch (data.action) {
      case 'goBack':
        // console.log('⬅️ Handling goBack action');
        if (handlers.onGoBack) {
          // console.log('✅ Executing onGoBack callback');
          handlers.onGoBack();
        } else {
          console.warn('⚠️ No onGoBack callback provided');
        }
        break;
      case 'navigate':
        // console.log('🧭 Handling navigate action');
        if (data.route && handlers.onNavigate) {
          // console.log('✅ Executing onNavigate callback with route:', data.route);
          handlers.onNavigate(data.route);
        } else if (!data.route) {
          console.error('❌ Missing route in navigate message');
        } else {
          console.warn('⚠️ No onNavigate callback provided');
        }
        break;
      case 'downloadPDF':
        // console.log('📥 Handling downloadPDF action');
        if (!data.filename) {
          console.error('❌ Missing filename in message');
          throw new Error('Missing filename');
        }
        console.log('📄 PDF filename:', data.filename);
        // Check if we have base64 data or a URL
        if (data.data && typeof data.data === 'string' && data.data.length > 0) {
          // Legacy: Base64 data provided
          console.log('📊 PDF data length:', data.data.length);
          console.log('💾 Using Base64 download method');
          await downloadPDF(data.data, data.filename);
        } else {
          // New: filename contains the URL/path
          console.log('🌐 Using URL download method');
          console.log('📊 URL/Path:', data.filename);
          // Import APP_BASE_URL dynamically or pass it as parameter
          // const { APP_BASE_URL } = await import('@/utils/api');
          await downloadPDFFromURL(data.filename, data.filename, APP_BASE_URL);
        }
        break;
      default:
        // Check for custom action handlers
        const customHandler = handlers[data.action];
        if (customHandler && typeof customHandler === 'function') {
          console.log('🔧 Handling custom action:', data.action);
          customHandler(data);
        } else {
          console.warn('⚠️ Unknown action received:', data.action);
          console.warn('📋 Full message data:', JSON.stringify(data, null, 2));
        }
    }

    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // console.log('✅ WEBVIEW MESSAGE HANDLED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ WEBVIEW MESSAGE HANDLING FAILED');
    console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof SyntaxError) {
      console.error('❌ Invalid JSON received from webview');
      console.error('📦 Raw data received:', event.nativeEvent.data);
    }
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
};
