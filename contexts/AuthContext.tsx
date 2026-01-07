import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceInfo } from '@/utils/device';
import { api, API_BASE_URL } from '@/utils/api';
import { getSecurityHeaders } from "@/utils/security";
import { logRequest, logResponse, logError, logFormData } from '@/utils/http-logger';

export interface LoggedUser {
  token: string;
  role: number;
  status: number;
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
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  getUserProfile: () => Promise<UserProfile | null>;
  reloadProfile: () => Promise<void>;
  isLoading: boolean;
  lastActivity: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@tramonto_sereno_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lastActivity, setLastActivity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const user = JSON.parse(storedAuth);
        setCurrentUser(user);
        // Validate token on app start
        const isValid = await validateToken();
        if (!isValid) {
          await logout();
        } else {
          await reloadProfile();
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string, role: string = 'user') => {
    try {
      // Get device information
      const deviceInfo = await getDeviceInfo();

      console.log('\n🔐 ===== LOGIN ATTEMPT =====');
      console.log('Username:', username);
      console.log('Role:', role);
      console.log('Device Info:', JSON.stringify(deviceInfo, null, 2));

      // Create FormData like Angular version
      const formData = new FormData();
      formData.append('username', (username || '').trim());
      formData.append('password', (password || '').trim());
      formData.append('role', role.toString());
      formData.append('device', deviceInfo.device);
      formData.append('os', deviceInfo.os);
      formData.append('browser', deviceInfo.browser);
      formData.append('user_agent', deviceInfo.userAgent);
      formData.append('remind', '1');

      // Log FormData contents
      console.log('\n📦 FormData Contents:');
      logFormData(formData, 'Login FormData');

      const securityHeaders = getSecurityHeaders(undefined);
      console.log(  '\n🔒 Security Headers:', JSON.stringify(securityHeaders, null, 2));

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

        // Store user and token
        setCurrentUser(user);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

        // Load user profile after successful login
        await getUserProfile();
      } else {
        console.error('\n❌ Login Failed - API returned error');
        console.error('Full error response:', JSON.stringify(data, null, 2));
        throw new Error(data.message || data.error || 'Login failed');
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

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (userProfile || loadingProfile) {
      return userProfile;
    }

    if (!currentUser) {
      return null;
    }

    try {
      setLoadingProfile(true);
      const response = await api.get<any>('profile');

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
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    } finally {
      setLoadingProfile(false);
    }
  };

  const reloadProfile = async (): Promise<void> => {
    setUserProfile(null);
    await getUserProfile();
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
    } finally {
      // Always clear local data
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
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
        logout,
        validateToken,
        getUserProfile,
        reloadProfile,
        isLoading,
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
