/**
 * Device information utility
 * Similar to Angular's DeviceDetectorService
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
  userAgent: string;
}

/**
 * Get device information for API requests
 * Used in login and other authentication calls
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const deviceName = Device.deviceName || 'Unknown Device';
  const osName = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';
  const osVersion = Device.osVersion || Platform.Version.toString();
  const modelName = Device.modelName || 'Unknown Model';

  // For mobile, "browser" is the app name
  const appName = Constants.expoConfig?.name || 'Tramonto Sereno';
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return {
    device: `${deviceName} (${modelName})`,
    os: `${osName} ${osVersion}`,
    browser: `${appName} v${appVersion}`,
    userAgent: `${appName}/${appVersion} (${Platform.OS}; ${osName} ${osVersion})`,
  };
};
