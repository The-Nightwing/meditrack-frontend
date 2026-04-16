/**
 * Axios API client with interceptors for auth and token refresh
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, API_TIMEOUT } from '@/utils/constants';
import { secureStorage } from '@/utils/secureStorage';
import { ApiResponse } from '@/types';

// Track if we're already refreshing token to avoid multiple refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Create axios instance with configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add auth token
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token from storage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle token refresh and auth errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Token refresh is in progress, wait for it and retry
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh token
        const refreshToken = await secureStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_URL}/auth/refresh`,
          {
            refreshToken,
          }
        );

        if (response.data.data) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Update tokens
          await secureStorage.setTokens({
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600, // Default to 1 hour
          });

          // Update request header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          isRefreshing = false;
          onTokenRefreshed(accessToken);

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        isRefreshing = false;

        // Clear tokens and redirect to login
        try {
          await secureStorage.clearTokens();
          await secureStorage.clearUser();
        } catch (clearError) {
          console.error('Error clearing storage on auth failure', clearError);
        }

        // The app should handle 401 errors and redirect to login
        // This will be done in the auth store
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper to make GET requests
 */
export async function apiGet<T>(url: string, config?: any) {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * Helper to make POST requests
 */
export async function apiPost<T>(url: string, data?: any, config?: any) {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * Helper to make PUT requests
 */
export async function apiPut<T>(url: string, data?: any, config?: any) {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * Helper to make PATCH requests
 */
export async function apiPatch<T>(url: string, data?: any, config?: any) {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

/**
 * Helper to make DELETE requests
 */
export async function apiDelete<T>(url: string, config?: any) {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

export default apiClient;
