import * as FileSystem from 'expo-file-system';
import { File, Directory, Paths } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface PDFDownloadMessage {
  action: 'downloadPDF';
  data: string; // Base64 string
  filename: string;
}

/**
 * Sanitizes filename to remove invalid characters
 */
const sanitizeFilename = (filename: string): string => {
  console.log('🧹 Sanitizing filename:', filename);
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255); // Limit filename length
  console.log('✅ Sanitized filename:', sanitized);
  return sanitized;
};

/**
 * Validates Base64 string
 */
const isValidBase64 = (str: string): boolean => {
  try {
    console.log('🔍 Validating Base64 string (length:', str.length, ')');
    // Check if string matches base64 pattern
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    const isValid = base64Regex.test(str) && str.length > 0;
    console.log('✅ Base64 validation result:', isValid);
    return isValid;
  } catch (error) {
    console.error('❌ Base64 validation error:', error);
    return false;
  }
};

/**
 * Cleans up old PDF files to prevent storage bloat
 */
const cleanupOldPDFs = async (maxAge: number = 24 * 60 * 60 * 1000): Promise<void> => {
  try {
    console.log('🧹 Starting cleanup of old PDFs...');

    const directory = new Directory(Paths.document);
    console.log('📁 Scanning directory:', directory.uri);

    if (!directory.exists) {
      console.warn('⚠️ Document directory does not exist, skipping cleanup');
      return;
    }

    const items = directory.list();
    console.log('📋 Found', items.length, 'items');

    const now = Date.now();
    let cleanedCount = 0;

    for (const item of items) {
      if (item instanceof File && item.uri.endsWith('.pdf')) {
        console.log('📄 Checking PDF:', item.uri);

        const modificationTime = item.modificationTime;
        if (modificationTime) {
          const fileAge = now - modificationTime;
          console.log('⏰ File age:', Math.round(fileAge / 1000 / 60), 'minutes');

          if (fileAge > maxAge) {
            item.delete();
            cleanedCount++;
            console.log('🗑️ Deleted old PDF:', item.uri);
          }
        }
      }
    }

    console.log('✅ Cleanup complete. Removed', cleanedCount, 'old files');
  } catch (error) {
    console.warn('⚠️ Error cleaning up old PDFs:', error);
  }
};

/**
 * Downloads a PDF from a URL and shares it
 * @param url - The URL of the PDF file (can be relative or absolute)
 * @param filename - The desired filename for the PDF
 * @param baseURL - Optional base URL to prepend if url is relative
 */
export const downloadPDFFromURL = async (
  url: string,
  filename: string,
  baseURL?: string
): Promise<void> => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 PDF DOWNLOAD FROM URL STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const baseUrl = 'https://storage.tramontosereno.it/tramonto/_cache_/';

  try {
    // Build full URL if relative
    const fullURL = url.startsWith('http') ? url : `${baseUrl}${url.split('/').pop()}`;
    console.log('🌐 Full URL:', fullURL);
    console.log('📄 Original filename:', filename);

    // Sanitize and ensure .pdf extension
    const sanitizedFilename = sanitizeFilename(filename);
    const pdfFilename = sanitizedFilename.endsWith('.pdf')
      ? sanitizedFilename
      : `${sanitizedFilename}.pdf`;

    console.log('📝 Final filename:', pdfFilename);

    // Clean up old PDFs before downloading new one
    await cleanupOldPDFs();

    // Download using new File.downloadFileAsync API
    console.log('⏳ Downloading file...');
    const downloadStart = Date.now();

    // Create target file
    const file = new File(Paths.document, pdfFilename);

    // Download file with idempotent option to overwrite if exists
    const downloadedFile = await File.downloadFileAsync(fullURL, file, { idempotent: true });
    const downloadEnd = Date.now();

    console.log('✅ File downloaded in', downloadEnd - downloadStart, 'ms');
    console.log('💾 File URI:', downloadedFile.uri);
    console.log('📏 File size:', downloadedFile.size, 'bytes (', Math.round(downloadedFile.size / 1024), 'KB )');
    console.log('✅ File exists:', downloadedFile.exists);

    // Check sharing availability
    console.log('🔍 Checking sharing availability...');
    const sharingAvailable = await Sharing.isAvailableAsync();
    console.log('📤 Sharing available:', sharingAvailable);

    // Share/Open the file with native apps
    if (sharingAvailable) {
      console.log('📱 Opening share dialog...');

      const shareStart = Date.now();
      await Sharing.shareAsync(downloadedFile.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Apri o condividi il PDF',
        UTI: 'com.adobe.pdf',
      });
      const shareEnd = Date.now();

      console.log('✅ Share dialog completed in', shareEnd - shareStart, 'ms');
    } else {
      console.warn('⚠️ Sharing not available on this device');
      Alert.alert(
        'PDF Salvato',
        `Il PDF è stato salvato in: ${downloadedFile.uri}`,
        [{ text: 'OK' }]
      );
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PDF DOWNLOAD FROM URL COMPLETED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ PDF DOWNLOAD FROM URL FAILED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const errorMessage = error instanceof Error
      ? error.message
      : 'Errore sconosciuto';

    Alert.alert(
      'Errore',
      `Impossibile scaricare il PDF: ${errorMessage}`,
      [{ text: 'OK' }]
    );

    throw error;
  }
};

/**
 * Downloads and shares a PDF file from Base64 data
 * @param base64Data - The Base64 encoded PDF data (without the data:application/pdf;base64, prefix)
 * @param filename - The desired filename for the PDF
 */
export const downloadPDF = async (
  base64Data: string,
  filename: string
): Promise<void> => {


  return;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 PDF DOWNLOAD STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 Platform:', Platform.OS);
  console.log('📱 Platform Version:', Platform.Version);
  console.log('🔧 Is Device:', Platform.isTV ? 'TV' : 'Mobile/Tablet');
  console.log('🔧 __DEV__:', __DEV__);
  console.log('📁 Document Directory:', FileSystem.documentDirectory);
  console.log('📄 Original filename:', filename);
  console.log('📊 Base64 data length:', base64Data.length, 'characters');
  console.log('📊 Estimated file size:', Math.round((base64Data.length * 3 / 4) / 1024), 'KB');

  try {
    // Validate base64 data
    if (!isValidBase64(base64Data)) {
      throw new Error('Invalid Base64 data');
    }

    // Sanitize and ensure .pdf extension
    const sanitizedFilename = sanitizeFilename(filename);
    const pdfFilename = sanitizedFilename.endsWith('.pdf')
      ? sanitizedFilename
      : `${sanitizedFilename}.pdf`;

    console.log('📝 Final filename:', pdfFilename);

    // Clean up old PDFs before saving new one
    await cleanupOldPDFs();

    // Save the PDF to the device's document directory
    const fileUri = `${FileSystem.documentDirectory}${pdfFilename}`;
    console.log('💾 Target file URI:', fileUri);
    console.log('⏳ Writing file...');

    const writeStart = Date.now();
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const writeEnd = Date.now();

    console.log('✅ File written in', writeEnd - writeStart, 'ms');

    // Verify file was created
    console.log('🔍 Verifying file creation...');
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log('📊 File info:', JSON.stringify(fileInfo, null, 2));

    if (!fileInfo.exists) {
      throw new Error('File was not created successfully');
    }

    console.log('✅ File exists:', fileInfo.exists);
    console.log('📏 File size:', fileInfo.size, 'bytes (', Math.round(fileInfo.size / 1024), 'KB )');
    console.log('📅 Modification time:', fileInfo.modificationTime ? new Date(fileInfo.modificationTime * 1000).toISOString() : 'unknown');

    // In development, verify content integrity
    if (__DEV__) {
      console.log('🔬 DEV MODE: Verifying content integrity...');
      try {
        const readContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const contentMatches = readContent === base64Data;
        console.log('🔬 Content verification:', contentMatches ? '✅ PASS' : '❌ FAIL');
        if (!contentMatches) {
          console.warn('⚠️ Written content does not match original!');
          console.log('📊 Original length:', base64Data.length);
          console.log('📊 Read length:', readContent.length);
        }
      } catch (verifyError) {
        console.warn('⚠️ Could not verify content:', verifyError);
      }
    }

    // Check sharing availability
    console.log('🔍 Checking sharing availability...');
    const sharingAvailable = await Sharing.isAvailableAsync();
    console.log('📤 Sharing available:', sharingAvailable);

    // Share/Open the file with native apps
    if (sharingAvailable) {
      console.log('📱 Opening share dialog...');
      console.log('📤 Share options:', {
        mimeType: 'application/pdf',
        dialogTitle: 'Salva o condividi il PDF',
        UTI: 'com.adobe.pdf',
      });

      const shareStart = Date.now();
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Salva o condividi il PDF',
        UTI: 'com.adobe.pdf',
      });
      const shareEnd = Date.now();

      console.log('✅ Share dialog completed in', shareEnd - shareStart, 'ms');
    } else {
      console.warn('⚠️ Sharing not available on this device');
      console.log('ℹ️ Showing file location alert instead');

      Alert.alert(
        'PDF Salvato',
        `Il PDF è stato salvato in: ${fileUri}`,
        [{ text: 'OK' }]
      );
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PDF DOWNLOAD COMPLETED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ PDF DOWNLOAD FAILED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const errorMessage = error instanceof Error
      ? error.message
      : 'Errore sconosciuto';

    Alert.alert(
      'Errore',
      `Impossibile scaricare il PDF: ${errorMessage}`,
      [{ text: 'OK' }]
    );

    throw error; // Re-throw for caller to handle if needed
  }
};

export interface WebViewMessageHandlers {
  onGoBack?: () => void;
  onNavigate?: (route: string) => void;
  onData?: (data: any) => void;
  [key: string]: ((arg?: any) => void) | undefined;
}

/**
 * Handles messages from the WebView, including PDF downloads
 * @param event - The WebView message event
 * @param handlers - Optional callbacks for different actions (onGoBack, onNavigate, onData, custom actions)
 */
export const handleWebViewMessage = async (
  event: any,
  handlers?: WebViewMessageHandlers | (() => void)
): Promise<void> => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📨 WEBVIEW MESSAGE RECEIVED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const rawData = event.nativeEvent.data;
    console.log('📦 Raw message data type:', typeof rawData);
    console.log('📦 Raw message length:', rawData?.length || 0);

    if (!rawData) {
      console.warn('⚠️ Received empty message from webview');
      return;
    }

    console.log('🔍 Parsing JSON...');
    const data = JSON.parse(rawData);
    console.log('✅ JSON parsed successfully');
    console.log('📋 Message data:', JSON.stringify(data, (key, value) => {
      // Truncate base64 data in logs
      if (key === 'data' && typeof value === 'string' && value.length > 100) {
        return `[Base64 data: ${value.length} chars]`;
      }
      return value;
    }, 2));

    // Support legacy callback format (just a function for onGoBack)
    const messageHandlers: WebViewMessageHandlers = typeof handlers === 'function'
      ? { onGoBack: handlers }
      : handlers || {};

    // Support legacy type-based messages by converting to action-based
    const action = data.action || data.type;

    // Map legacy type values to action values
    const actionMap: Record<string, string> = {
      'close': 'goBack',
      'navigation': 'navigate',
    };
    const normalizedAction = actionMap[action] || action;

    console.log('🎯 Action:', normalizedAction, data.action !== normalizedAction ? `(mapped from: ${action})` : '');

    switch (normalizedAction) {
      case 'goBack':
        console.log('⬅️ Handling goBack action');
        if (messageHandlers.onGoBack) {
          console.log('✅ Executing onGoBack callback');
          messageHandlers.onGoBack();
        } else {
          console.warn('⚠️ No onGoBack callback provided');
        }
        break;

      case 'navigate':
        console.log('🧭 Handling navigate action');
        if (data.route && messageHandlers.onNavigate) {
          console.log('✅ Executing onNavigate callback with route:', data.route);
          messageHandlers.onNavigate(data.route);
        } else if (!data.route) {
          console.error('❌ Missing route in navigate message');
        } else {
          console.warn('⚠️ No onNavigate callback provided');
        }
        break;

      case 'data':
        console.log('📊 Handling data action');
        if (messageHandlers.onData) {
          console.log('✅ Executing onData callback');
          messageHandlers.onData(data.data);
        } else {
          console.log('ℹ️ No onData callback provided, data:', data.data);
        }
        break;

      case 'downloadPDF':
        console.log('📥 Handling downloadPDF action');

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
          const { APP_BASE_URL } = await import('@/utils/api');
          await downloadPDFFromURL(data.filename, data.filename, APP_BASE_URL);
        }
        break;

      default:
        // Check for custom action handlers
        const customHandler = messageHandlers[data.action];
        if (customHandler && typeof customHandler === 'function') {
          console.log('🔧 Handling custom action:', data.action);
          customHandler(data);
        } else {
          console.warn('⚠️ Unknown action received:', data.action);
          console.warn('📋 Full message data:', JSON.stringify(data, null, 2));
        }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ WEBVIEW MESSAGE HANDLED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ WEBVIEW MESSAGE HANDLING FAILED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));

    if (error instanceof SyntaxError) {
      console.error('❌ Invalid JSON received from webview');
      console.error('📦 Raw data received:', event.nativeEvent.data);
    }

    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  }
};
