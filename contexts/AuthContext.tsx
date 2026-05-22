import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { getDeviceInfo } from '@/utils/device';
import { api, API_BASE_URL, APP_BASE_URL } from '@/utils/api';
import { getSecurityHeaders } from "@/utils/security";
import { logRequest, logResponse, logError, logFormData } from '@/utils/http-logger';
import { isExpoGo } from "@/utils/utils";
import { clearWebviewCache } from "@/utils/webview.utils";

// Conditional import for Google Sign-In (only for device builds)
let GoogleSignin: any = null;
if (!isExpoGo) {
  try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSigninModule.GoogleSignin;
  } catch (error) {
    console.warn('Google Sign-In module not available:', error);
  }
}

export type LoadingState = 
  | 'initializing'
  | 'loading_storage' 
  | 'validating_token'
  | 'loading_profile'
  | 'completing'
  | 'timeout'
  | 'error'
  | 'completed';

export interface LoggedUser {
  token: string;
  role: number;
  status: number;
}

export interface EmergencyContact {
  id: number;
  id_plan: number;
  email: string;
  name: string;
  relationship: string;
  mobile_phone: string;
}

export interface Plan {
  id: number;
  id_user: number;
  id_funeralplanner: number;
  id_partner_referral: number;
  type: string;
  package_name: string;
  plan_for: string;
  emergency_contact_name: string;
  emergency_contact_email: string;
  emergency_contact_phone: string;
  status: number;
  payment_status: string;
  permission: string;
  managed_by: string;
  creator: string;
  deceased: string;
  discount_code: string;
  created: string;
  modified: string;
  emergencyContacts: EmergencyContact[];
}

export interface Partner {
  id: number;
  id_parent: number;
  email: string;
  referral_code: string;
  pec: string;
  shop_name: string;
  logo: string;
  description: string;
  category: string;
  subcategory: string;
  categories: string;
  street: string;
  street_number: string;
  zip_code: string;
  city: string;
  province: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  web_only: number;
  pet: number;
  phone: string;
  facebook: string;
  url: string;
  instagram: string;
  extra_info: string;
  status: number;
  level: number;
  full_address: string;
}

export interface UserProfile {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    lang: string;
    phone: string;
    id_current_plan: number;
    id_partner_referral: number;
    social_login: string;
    status: number;
    role: number;
  };
  owned_plans: Plan[];
  current_plan: Plan | null;
  favourites: Partner[];
  referralPartner: Partner | null;
  consents: {
    geolocalizationAndProfiling: number;
    ownAndThirdServices: number;
    thirdServicesEnrichment: number;
    thirdServicesTransfer: number;
  };
  cfg: {
    language: string;
  };
}

interface AuthContextType {
  currentUser: LoggedUser | null;
  userProfile: UserProfile | null;
  setCurrentUser: (user: LoggedUser | null) => void;
  token: string | undefined;
  login: (username: string, password: string, role?: string) => Promise<void>;
  googleLogin: (idToken: string, onSuccess?: (email: string, profile: UserProfile | null) => void, onRegistrationRequired?: (registrationUrl: string) => void) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  getUserProfile: () => Promise<UserProfile | null>;
  reloadProfile: () => Promise<void>;
  getLastSavedProfile: () => Promise<UserProfile | null>;
  getLastPartnerName: () => Promise<string | null>;
  getCurrentDeviceId: () => Promise<string | null>;
  clearDeviceId: () => Promise<void>;
  isLoading: boolean;
  loadingState: LoadingState;
  loadingError: string | null;
  lastActivity: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@tramonto_sereno_auth';
const PROFILE_STORAGE_KEY = '@tramonto_sereno_last_profile';
const LAST_EMAIL_KEY = '@tramonto_sereno_last_email';
const LAST_PARTNER_KEY = '@tramonto_sereno_last_partner';
const DEVICE_ID_KEY = '@tramonto_device_id';

// ============================================================================
// DEVICE ID MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get or create a unique device ID for this device
 * Stored in AsyncStorage to persist across app sessions
 */
const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = generateDeviceId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('📱 Generated new device ID:', deviceId);
    } else {
      console.log('📱 Using existing device ID:', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error managing device ID:', error);
    // Fallback to temporary device ID if storage fails
    return generateDeviceId();
  }
};

/**
 * Generate a unique device ID
 * Format: app_[platform]_[timestamp]_[random]
 */
const generateDeviceId = (): string => {
  const platform = Device.osName?.toLowerCase() || 'unknown';
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  const randomStr2 = Math.random().toString(36).substring(2, 15);
  return `app_${platform}_${timestamp}_${randomStr}${randomStr2}`;
};

/**
 * Get human-readable device name
 * Examples: "iPhone 14 Pro", "Samsung Galaxy S23", "Pixel 7"
 */
const getDeviceName = async (): Promise<string> => {
  try {
    const deviceName = Device.deviceName || 'Unknown Device';
    const modelName = Device.modelName || '';

    // Combine device name and model for clarity
    if (modelName && !deviceName.includes(modelName)) {
      return `${deviceName} (${modelName})`;
    }

    return deviceName;
  } catch (error) {
    console.error('Error getting device name:', error);
    return 'Unknown Device';
  }
};

/**
 * Get device type (mobile/tablet)
 */
const getDeviceType = (): string => {
  return Device.deviceType === Device.DeviceType.TABLET ? 'tablet' : 'mobile';
};

/**
 * Get OS version
 */
const getOSVersion = (): string => {
  return Device.osVersion || 'unknown';
};

/**
 * Get app version
 */
const getAppVersion = (): string => {
  return Constants.expoConfig?.version || 'unknown';
};

// ============================================================================
// AUTH PROVIDER
// ============================================================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lastActivity, setLastActivity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingState, setLoadingState] = useState<LoadingState>('initializing');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Listen to app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [currentUser]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // App has come to the foreground from background
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground - validating token and reloading profile');

      if (currentUser) {
        // Validate token
        const isValid = await validateToken();

        if (!isValid) {
          console.log('Token is invalid - logging out');
          await logout();
        } else {
          // Token is valid, check if we need to reload profile
          if (!userProfile) {
            console.log('User profile is missing - reloading');
            await reloadProfile();
          }
        }
      }
    }

    appState.current = nextAppState;
  };

  const loadStoredAuth = async () => {
    try {
      setLoadingState('loading_storage');
      setLoadingError(null);
      
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (storedAuth) {
        const user = JSON.parse(storedAuth);
        setCurrentUser(user);
        
        // Add timeout for token validation and profile loading
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 10000) // 10 second timeout
        );

        try {
          setLoadingState('validating_token');
          // Validate token with timeout
          const isValid = await Promise.race([validateToken(), timeoutPromise]);
          
          if (!isValid) {
            console.log('Token invalid, logging out');
            await logout();
            setLoadingState('completed');
            setIsLoading(false);
          } else {
            setLoadingState('loading_profile');
            // Load profile with timeout
            await Promise.race([getUserProfile(user), timeoutPromise]);
            setLoadingState('completing');
            setTimeout(() => {
              setLoadingState('completed');
              setIsLoading(false);
            }, 500); // Small delay to show "completing" state
          }
        } catch (timeoutError) {
          console.error('Auth timeout - proceeding offline:', timeoutError);
          setLoadingState('timeout');
          setLoadingError('Connessione lenta, continuiamo offline');
          // On timeout, continue with cached user but mark as loading complete
          setTimeout(() => {
            setLoadingState('completed');
            setIsLoading(false);
          }, 2000); // Show timeout message for 2 seconds
        }
      } else {
        setLoadingState('completed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      setLoadingState('error');
      setLoadingError('Errore durante il caricamento dei dati');
      setTimeout(() => {
        setLoadingState('completed');
        setIsLoading(false);
      }, 3000); // Show error for 3 seconds
    }
  };

  const login = async (username: string, password: string, role: string = 'user') => {
    try {
      // Get device information
      const deviceInfo = await getDeviceInfo();
      const deviceId = await getOrCreateDeviceId();
      const deviceName = await getDeviceName();
      const deviceType = getDeviceType();
      const osVersion = getOSVersion();
      const appVersion = getAppVersion();

      console.log('\n🔐 ===== LOGIN ATTEMPT =====');
      console.log('Username:', username);
      console.log('Role:', role);
      console.log('Device ID:', deviceId);
      console.log('Device Name:', deviceName);
      console.log('Device Type:', deviceType);
      console.log('OS Version:', osVersion);
      console.log('App Version:', appVersion);
      console.log('Device Info:', JSON.stringify(deviceInfo, null, 2));

      // Create FormData
      const formData = new FormData();
      formData.append('username', (username || '').trim());
      formData.append('password', (password || '').trim());
      formData.append('role', role.toString());

      // Device identification (new fields)
      formData.append('device_id', deviceId);
      formData.append('device_name', deviceName);
      formData.append('device_type', deviceType);

      // Device details (existing fields + additions)
      formData.append('device', deviceInfo.device);
      formData.append('os', deviceInfo.os);
      formData.append('os_version', osVersion);
      formData.append('browser', deviceInfo.browser);
      formData.append('user_agent', deviceInfo.userAgent);
      formData.append('app_version', appVersion);
      formData.append('remind', '1');

      // Log FormData contents
      console.log('\n📦 FormData Contents:');
      logFormData(formData, 'Login FormData');

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
        headers
      };

      // Log complete request
      const logEntry = logRequest('POST', url, requestOptions);

      console.log('\n🚀 Sending request...');

      // Use fetch directly for login (not api service) to avoid token issues
      const response = await fetch(url, requestOptions);

      console.log('\n📡 Response received:');
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', JSON.stringify([...response.headers.entries()], null, 2));

      const responseText = await response.text();
      console.log('\n📄 Raw Response Body:', responseText);

      let data: any;
      try {
        data = JSON.parse(responseText);
        console.log('\n✅ Parsed Response:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('\n❌ Failed to parse JSON:', parseError);
        console.error('Response was:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      // Log response
      await logResponse(logEntry, response, data);

      console.log('\n🔍 API Response Analysis:');
      console.log('Result:', data.result);
      console.log('Status:', data.status);
      console.log('Message:', data.message || data.error);
      console.log('Data:', JSON.stringify(data.data, null, 2));

      if (data.result === 'ok' && data.data?.token) {
        const user: LoggedUser = {
          token: data.data.token,
          role: parseInt(data.data.role, 10),
          status: parseInt(data.data.status, 10),
        };

        // Update last activity
        if (data.lastActivity) {
          setLastActivity(data.lastActivity);
        }

        console.log("USER AFTER LOGIN...", user);
        // Store user and token
        setCurrentUser(user);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

        // Save last used email (don't clear on logout)
        await AsyncStorage.setItem(LAST_EMAIL_KEY, username.trim());

        // Load user profile after successful login
        console.log("GETTING USER PROFILE AFTER LOGIN");
        return await getUserProfile(user);
      } else {
        console.error('\n❌ Login Failed - API returned error');
        console.error('Full error response:', JSON.stringify(data, null, 2));
        const errorMsg = data.message ||
          (typeof data.error === 'string' ? data.error : data.error?.message) ||
          'Login failed';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('\n💥 ===== LOGIN ERROR =====');
      console.error('Error Type:', typeof error);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('===== END LOGIN ERROR =====\n');
      throw error;
    }
  };

  const googleLogin = async (idToken: string, onSuccess?: (email: string, profile: UserProfile | null) => void, onRegistrationRequired?: (registrationUrl: string) => void) => {
    try {
      console.log('\n🔐 ===== GOOGLE LOGIN =====');
      console.log('ID Token:', idToken.substring(0, 20) + '...');
      
      // Authenticate with backend
      const response = await fetch(`${API_BASE_URL}/v1/google-oauth-mobile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSecurityHeaders(),
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Successful login
        console.log('✅ Backend authentication successful:', data);
        
        const user: LoggedUser = {
          token: data.token,
          role: parseInt(data.role, 10),
          status: parseInt(data.status, 10),
        };

        console.log("USER AFTER GOOGLE LOGIN...", user);
        // Store user and token
        setCurrentUser(user);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

        // Save last used email (don't clear on logout)
        await AsyncStorage.setItem(LAST_EMAIL_KEY, data.user.email.trim());

        // Load user profile after successful login
        console.log("GETTING USER PROFILE AFTER GOOGLE LOGIN");
        const profile = await getUserProfile(user);

        // Call success callback
        if (onSuccess) {
          onSuccess(data.user.email, profile);
        }
      } else {
        // Handle different error scenarios
        switch (response.status) {
          case 404:
            if (data.needsRegistration) {
              // User needs to register
              const registrationUrl = `${APP_BASE_URL}/registration?forceMode=mobile&premail=${encodeURIComponent(data.registrationData.email)}&prefirst=${encodeURIComponent(data.registrationData.firstName)}&prelast=${encodeURIComponent(data.registrationData.lastName)}&type=google`;
              console.log(registrationUrl);
              
              if (onRegistrationRequired) {
                onRegistrationRequired(registrationUrl);
              } else {
                throw new Error('Registration required but no callback provided');
              }
            } else {
              throw new Error(data.error || 'Utente non trovato');
            }
            break;
          case 403:
            if (data.error === 'Partner login not allowed in mobile app') {
              throw new Error('Gli account partner possono accedere solo tramite il sito web.');
            } else if (data.error === 'Account not active') {
              throw new Error('Il tuo account non è attivo. Contatta il supporto per assistenza.');
            } else {
              throw new Error(data.error || 'Accesso non autorizzato');
            }
            break;
          case 401:
            throw new Error('Token di autenticazione non valido');
          default:
            throw new Error(data.error || 'Errore del server');
        }
      }
    } catch (error: any) {
      console.error('\n💥 ===== GOOGLE LOGIN ERROR =====');
      console.error('Error Type:', typeof error);
      console.error('Error Message:', error.message);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('===== END GOOGLE LOGIN ERROR =====\n');
      throw error;
    }
  };

  const getUserProfile = async (providedUser?: LoggedUser, forceReload: boolean = false): Promise<UserProfile | null> => {
    console.log("LOADING USER_PROFILE...", { hasProfile: !!userProfile, loadingProfile, forceReload });

    // If we already have a profile and not forcing reload, return it
    if (userProfile && !forceReload) {
      console.log("RETURNING CACHED PROFILE");
      return userProfile;
    }

    // If already loading and not forcing reload, wait and return current profile
    if (loadingProfile && !forceReload) {
      console.log("ALREADY LOADING PROFILE");
      return userProfile;
    }

    const userToUse = providedUser || currentUser;
    if (!userToUse) {
      console.log("NO USER AVAILABLE");
      return null;
    }

    try {
      setLoadingProfile(true);
      console.log("FETCHING PROFILE FROM API");
      const response = await api.get<any>('profile', undefined, { manualErrorManagement: true });

      if (response.data) {
        const profile: UserProfile = {
          user: {
            id: parseInt(String(response.data.user.id), 10),
            first_name: response.data.user.first_name || '',
            last_name: response.data.user.last_name || '',
            email: response.data.user.email || '',
            lang: response.data.user.lang || 'it',
            phone: response.data.user.phone || '',
            id_current_plan: parseInt(String(response.data.user.id_current_plan || 0), 10),
            id_partner_referral: parseInt(String(response.data.user.id_partner_referral || 0), 10),
            social_login: response.data.user.social_login || '',
            status: parseInt(String(response.data.user.status || 0), 10),
            role: parseInt(String(response.data.user.role), 10),
          },
          owned_plans: response.data.owned_plans || [],
          current_plan: response.data.current_plan || null,
          favourites: response.data.favourites || [],
          referralPartner: response.data.referralPartner || null,
          consents: response.data.consents || {
            geolocalizationAndProfiling: 0,
            ownAndThirdServices: 0,
            thirdServicesEnrichment: 0,
            thirdServicesTransfer: 0,
          },
          cfg: response.data.cfg || { language: 'it' },
        };

        setUserProfile(profile);
        // Save profile to storage for "welcome back" feature
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

        // Save referral partner name separately (persists across logout)
        if (profile.referralPartner?.shop_name) {
          await AsyncStorage.setItem(LAST_PARTNER_KEY, profile.referralPartner.shop_name);
          console.log("PARTNER NAME SAVED:", profile.referralPartner.shop_name);
        } else {
          await AsyncStorage.setItem(LAST_PARTNER_KEY, '');
          console.log("No partner, saved empty");
        }

        console.log("PROFILE LOADED SUCCESSFULLY AND SAVED TO STORAGE");
        return profile;
      }

      console.log("NO PROFILE DATA IN RESPONSE");
      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    } finally {
      setLoadingProfile(false);
    }
  };

  const getLastSavedProfile = async (): Promise<UserProfile | null> => {
    try {
      const savedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
      return null;
    } catch (error) {
      console.error('Error loading saved profile:', error);
      return null;
    }
  };

  const getLastPartnerName = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(LAST_PARTNER_KEY);
    } catch (error) {
      console.error('Error loading last partner name:', error);
      return null;
    }
  };

  /**
   * Get the current device ID (useful for debugging or display in settings)
   */
  const getCurrentDeviceId = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(DEVICE_ID_KEY);
    } catch (error) {
      console.error('Error getting device ID:', error);
      return null;
    }
  };

  /**
   * Clear device ID (useful for testing or when user wants to reset device registration)
   */
  const clearDeviceId = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(DEVICE_ID_KEY);
      console.log('📱 Device ID cleared');
    } catch (error) {
      console.error('Error clearing device ID:', error);
    }
  };

  const reloadProfile = async (): Promise<void> => {
    console.log("RELOADING USER PROFILE");
    await getUserProfile(currentUser || undefined, true);
  };

  const validateToken = async (): Promise<boolean> => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedAuth) {
        return false;
      }
      const user = JSON.parse(storedAuth);
      if (!user.token) {
        return false;
      }

      const response = await api.post('validate-token', {
        token: user.token,
      }, {
        manualErrorManagement: true,
      });
      return response.result === 'ok';
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const ping = async (): Promise<void> => {
    if (!userProfile) {
      return;
    }

    try {
      await api.get('ping', undefined, {
        manualErrorManagement: true,
      });
    } catch (error) {
      console.error('Ping error:', error);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('logout', {}, {
        manualErrorManagement: true,
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }

    try {
      // Sign out from Google to clear cached authentication (only if signed in with Google)
      if (!isExpoGo && GoogleSignin) {
        const isSignedIn = GoogleSignin.hasPreviousSignIn();
        console.log("HAS LOGGED WITH GOOGLE?", isSignedIn);
        if (isSignedIn) {
          await GoogleSignin.signOut();
          console.log('✅ Google Sign-Out successful');
        } else {
          console.log('👤 User not signed in with Google, skipping Google sign-out');
        }
      }
    } catch (googleError) {
      console.error('Google Sign-Out error:', googleError);
      // Don't throw error - continue with logout even if Google sign-out fails
    } finally {
      // Always clear local data
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      // Clear cached services
      await AsyncStorage.removeItem('@funeral_planner_services');
      // Clear webview cache so the next login fetches fresh content
      await clearWebviewCache();
      // NOTE: Device ID is NOT cleared on logout - it persists
      setCurrentUser(null);
      setUserProfile(null);
      setLastActivity(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        setCurrentUser,
        token: currentUser?.token,
        login,
        googleLogin,
        logout,
        validateToken,
        getUserProfile,
        reloadProfile,
        getLastSavedProfile,
        getLastPartnerName,
        getCurrentDeviceId,
        clearDeviceId,
        isLoading,
        loadingState,
        loadingError,
        lastActivity,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
