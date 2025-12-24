/**
 * File Logger - Saves logs to file for persistent debugging
 */

import * as FileSystem from 'expo-file-system/legacy';

const LOG_DIR = `${FileSystem.documentDirectory}logs/`;
const LOG_FILE = `${LOG_DIR}api-requests.log`;

/**
 * Ensure log directory exists
 */
const ensureLogDir = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(LOG_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOG_DIR, { intermediates: true });
      console.log('📁 Created log directory:', LOG_DIR);
    }
  } catch (error) {
    console.error('Error creating log directory:', error);
  }
};

/**
 * Write log to file
 */
export const writeLogToFile = async (message: string) => {
  try {
    await ensureLogDir();

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    await FileSystem.writeAsStringAsync(LOG_FILE, logEntry, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log('💾 Log written to file:', LOG_FILE);
  } catch (error) {
    console.error('Error writing log to file:', error);
  }
};

/**
 * Append log to file
 */
export const appendLogToFile = async (message: string) => {
  try {
    await ensureLogDir();

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);

    if (fileInfo.exists) {
      // Append to existing file
      const existingContent = await FileSystem.readAsStringAsync(LOG_FILE);
      await FileSystem.writeAsStringAsync(LOG_FILE, existingContent + logEntry, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else {
      // Create new file
      await FileSystem.writeAsStringAsync(LOG_FILE, logEntry, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    console.log('💾 Log appended to file');
  } catch (error) {
    console.error('Error appending log to file:', error);
  }
};

/**
 * Read logs from file
 */
export const readLogsFromFile = async (): Promise<string> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);

    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(LOG_FILE);
      return content;
    } else {
      return 'No logs found';
    }
  } catch (error) {
    console.error('Error reading logs from file:', error);
    return `Error reading logs: ${error}`;
  }
};

/**
 * Clear log file
 */
export const clearLogFile = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(LOG_FILE);
      console.log('🗑️ Log file cleared');
    }
  } catch (error) {
    console.error('Error clearing log file:', error);
  }
};

/**
 * Get log file path
 */
export const getLogFilePath = () => LOG_FILE;

/**
 * Share log file (for debugging)
 */
export const shareLogFile = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);

    if (fileInfo.exists) {
      // TODO: Implement sharing functionality
      console.log('Log file available at:', LOG_FILE);
      return LOG_FILE;
    } else {
      console.log('No log file to share');
      return null;
    }
  } catch (error) {
    console.error('Error sharing log file:', error);
    return null;
  }
};
