/**
 * API Service - Common fetch utility for all API requests
 * Similar to Angular's HttpClient service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecurityHeaders } from './security';
import { Alert } from "react-native";

const LOCAL_IP = '192.168.1.104';
const AUTH_STORAGE_KEY = '@tramonto_sereno_auth';
export const API_BASE_URL = 'https://api.tramontosereno.it';
// export const API_BASE_URL = `http://${LOCAL_IP}/projects/funeral-planner-api`;
// export const APP_BASE_URL = `http://${LOCAL_IP}:4200`;
export const APP_BASE_URL = 'https://app.tramontosereno.it';
export interface APIResponse<T = any> {
  result: 'ok' | 'error';
  count?: number;
  data?: T;
  status: number;
  lastActivity?: number;
  message?: string;
  error?: string;
}

export interface APIError {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  originalError?: any;
  responseData?: any;
}

/**
 * Build API Gateway URL with query parameters
 */
const getAPIGatewayUrl = (endpoint: string, queryParams?: Record<string, any>): string => {
  const url = new URL(`${API_BASE_URL}/api-gateway.php`);

  // Add api parameter
  url.searchParams.append('api', endpoint);

  // Add additional query parameters
  if (queryParams) {
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        url.searchParams.append(key, String(queryParams[key]));
      }
    });
  }

  return url.toString();
};

/**
 * Get stored authentication token from AsyncStorage
 */
const getStoredToken = async (): Promise<string | null> => {
  try {
    const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const auth = JSON.parse(storedAuth);
      return auth.token || null;
    }
  } catch (error) {
    console.error('[API] Error reading token from storage:', error);
  }
  return null;
};

/**
 * Transform fetch error to APIError
 */
const transformAPIError = (error: any, url: string, responseData?: any): APIError => {
  console.error("ERROREEEE", JSON.stringify(error, null, 2));
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return {
      message: 'Errore di connessione. Verifica la tua connessione internet.',
      status: 0,
      statusText: 'Network Error',
      url,
      originalError: error,
      responseData,
    };
  }

  return {
    message: error.message || 'Si è verificato un errore imprevisto',
    status: error.status,
    statusText: error.statusText,
    url,
    originalError: error,
    responseData,
  };
};

/**
 * Log API error for analytics/debugging
 */
const logAPIError = (error: APIError, method: string, endpoint: string) => {
  const errorInfo = {
    method,
    endpoint,
    httpStatus: error.status || 'N/A',
    statusText: error.statusText || 'N/A',
    message: error.message,
    url: error.url,
    responseData: error.responseData,
    timestamp: new Date().toISOString(),
  };

  console.error(`[API ${method}] [${endpoint}] Error:`, errorInfo);

  // Show alert with all error details
  const alertTitle = `Errore API ${method}`;
  const alertMessage = `Endpoint: ${endpoint}\n\nHTTP Status: ${error.status || 'N/A'}\n\nRisposta Completa:\n${JSON.stringify(error.responseData || {}, null, 2)}`;

  Alert.alert(alertTitle, alertMessage);

  // TODO: Send to analytics service (e.g., Sentry, Firebase Analytics)
  // Example: analytics.trackError({ error, method, endpoint });
};

/**
 * Log API response for debugging (non-production only)
 */
const logAPIResponse = (response: any, method: string, endpoint: string) => {
  if (__DEV__) {
    console.log(`[API ${method}] [${endpoint}]`, response);
  }
};

/**
 * API Service class
 */
export class ApiService {
  /**
   * GET request
   */
  static async get<T = any>(
    endpoint: string,
    queryParams?: Record<string, any>,
    options?: {
      manualErrorManagement?: boolean;
      customHeaders?: Record<string, string>;
    }
  ): Promise<APIResponse<T>> {
    const url = getAPIGatewayUrl(endpoint, queryParams);
    const token = await getStoredToken();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getSecurityHeaders(token || undefined),
        ...(options?.customHeaders || {}),
      };

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      // Always read response body
      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Response might not be JSON
        responseData = await response.text();
      }

      if (!response.ok) {
        const apiError = transformAPIError({
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
        }, url, responseData);

        if (!options?.manualErrorManagement) {
          logAPIError(apiError, 'GET', endpoint);
        }

        throw apiError;
      }

      const data: APIResponse<T> = responseData;

      logAPIResponse(data, 'GET', endpoint);

      // Check if API returned an error result
      if (data.result === 'error') {
        const apiError: APIError = {
          message: data.message || data.error || 'API returned an error',
          status: data.status,
          url,
          responseData: data,
        };

        if (!options?.manualErrorManagement) {
          logAPIError(apiError, 'GET', endpoint);
        }

        throw apiError;
      }

      return data;
    } catch (error: any) {
      // If error already has responseData, use it; otherwise transform
      const apiError = error.responseData
        ? error
        : transformAPIError(error, url);

      if (!options?.manualErrorManagement) {
        logAPIError(apiError, 'GET', endpoint);
      }

      throw apiError;
    }
  }

  /**
   * POST request
   */
  static async post<T = any>(
    endpoint: string,
    body?: any,
    options?: {
      manualErrorManagement?: boolean;
      customHeaders?: Record<string, string>;
      queryParams?: Record<string, any>;
      useFormData?: boolean; // Default: true (to match Angular behavior)
    }
  ): Promise<APIResponse<T>> {
    const url = getAPIGatewayUrl(endpoint, options?.queryParams);
    const token = await getStoredToken();

    try {
      // By default, use FormData (like Angular)
      const useFormData = options?.useFormData !== false;

      const headers: Record<string, string> = {
        ...getSecurityHeaders(token || undefined),
        ...(options?.customHeaders || {}),
      };

      let requestBody: any;

      if (useFormData) {
        // Create FormData
        const formData = new FormData();

        // Add token if exists
        if (token) {
          formData.append('token', token);
        }

        // Add all body fields to FormData
        if (body) {
          Object.keys(body).forEach(key => {
            const value = body[key];
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
        }

        requestBody = formData;
        // Don't set Content-Type for FormData - browser will set it with boundary
      } else {
        // Use JSON (for specific cases)
        headers['Content-Type'] = 'application/json';

        const requestBodyObj = body ? { ...body } : {};
        if (token && !requestBodyObj.token) {
          requestBodyObj.token = token;
        }

        requestBody = JSON.stringify(requestBodyObj);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: requestBody,
      });

      // Always read response body
      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Response might not be JSON
        responseData = await response.text();
      }

      if (!response.ok) {
        const apiError = transformAPIError({
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
        }, url, responseData);

        if (!options?.manualErrorManagement) {
          logAPIError(apiError, 'POST', endpoint);
        }

        throw apiError;
      }

      const data: APIResponse<T> = responseData;

      logAPIResponse(data, 'POST', endpoint);

      // Check if API returned an error result
      if (data.result === 'error') {
        const apiError: APIError = {
          message: data.message || data.error || 'API returned an error',
          status: data.status,
          url,
          responseData: data,
        };

        if (!options?.manualErrorManagement) {
          logAPIError(apiError, 'POST', endpoint);
        }

        throw apiError;
      }

      return data;
    } catch (error: any) {
      // If error already has responseData, use it; otherwise transform
      const apiError = error.responseData
        ? error
        : transformAPIError(error, url);

      if (!options?.manualErrorManagement) {
        logAPIError(apiError, 'POST', endpoint);
      }

      throw apiError;
    }
  }

  /**
   * PUT request
   */
  static async put<T = any>(
    endpoint: string,
    body?: any,
    options?: {
      manualErrorManagement?: boolean;
      customHeaders?: Record<string, string>;
      queryParams?: Record<string, any>;
      useFormData?: boolean; // Default: true (to match Angular behavior)
    }
  ): Promise<APIResponse<T>> {
    const url = getAPIGatewayUrl(endpoint, options?.queryParams);
    const token = await getStoredToken();

    try {
      // By default, use FormData (like Angular)
      const useFormData = options?.useFormData !== false;

      const headers: Record<string, string> = {
        ...getSecurityHeaders(token || undefined),
        ...(options?.customHeaders || {}),
      };

      let requestBody: any;

      if (useFormData) {
        // Create FormData
        const formData = new FormData();

        // Add token if exists
        if (token) {
          formData.append('token', token);
        }

        // Add all body fields to FormData
        if (body) {
          Object.keys(body).forEach(key => {
            const value = body[key];
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
        }

        requestBody = formData;
        // Don't set Content-Type for FormData - browser will set it with boundary
      } else {
        // Use JSON (for specific cases)
        headers['Content-Type'] = 'application/json';

        const requestBodyObj = body ? { ...body } : {};
        if (token && !requestBodyObj.token) {
          requestBodyObj.token = token;
        }

        requestBody = JSON.stringify(requestBodyObj);
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: requestBody,
      });

      // Always read response body
      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Response might not be JSON
        responseData = await response.text();
      }

      if (!response.ok) {
        const apiError = transformAPIError({
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
        }, url, responseData);

        if (!options?.manualErrorManagement) {
          logAPIError(apiError, 'PUT', endpoint);
        }

        throw apiError;
      }

      const data: APIResponse<T> = responseData;

      logAPIResponse(data, 'PUT', endpoint);

      if (data.result === 'error') {
        const apiError: APIError = {
          message: data.message || data.error || 'API returned an error',
          status: data.status,
          url,
          responseData: data,
        };

        if (!options?.manualErrorManagement) {
          logAPIError(apiError, 'PUT', endpoint);
        }

        throw apiError;
      }

      return data;
    } catch (error: any) {
      // If error already has responseData, use it; otherwise transform
      const apiError = error.responseData
        ? error
        : transformAPIError(error, url);

      if (!options?.manualErrorManagement) {
        logAPIError(apiError, 'PUT', endpoint);
      }

      throw apiError;
    }
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(
    endpoint: string,
    queryParams?: Record<string, any>,
    options?: {
      manualErrorManagement?: boolean;
      customHeaders?: Record<string, string>;
    }
  ): Promise<APIResponse<T>> {
    const url = getAPIGatewayUrl(endpoint, queryParams);
    const token = await getStoredToken();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getSecurityHeaders(token || undefined),
        ...(options?.customHeaders || {}),
      };

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      // Always read response body
      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Response might not be JSON
        responseData = await response.text();
      }

      if (!response.ok) {
        const apiError = transformAPIError({
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
        }, url, responseData);

        if (!options?.manualErrorManagement) {
          logAPIError(apiError, 'DELETE', endpoint);
        }

        throw apiError;
      }

      const data: APIResponse<T> = responseData;

      logAPIResponse(data, 'DELETE', endpoint);

      if (data.result === 'error') {
        const apiError: APIError = {
          message: data.message || data.error || 'API returned an error',
          status: data.status,
          url,
          responseData: data,
        };

        if (!options?.manualErrorManagement) {
          logAPIError(apiError, 'DELETE', endpoint);
        }

        throw apiError;
      }

      return data;
    } catch (error: any) {
      // If error already has responseData, use it; otherwise transform
      const apiError = error.responseData
        ? error
        : transformAPIError(error, url);

      if (!options?.manualErrorManagement) {
        logAPIError(apiError, 'DELETE', endpoint);
      }

      throw apiError;
    }
  }
}

// Export singleton instance for convenience
export const api = ApiService;
