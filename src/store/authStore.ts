/**
 * Authentication store using Zustand
 * Manages user authentication state and tokens
 */

import { create } from 'zustand';
import { User, AuthTokens } from '@/types';
import { secureStorage } from '@/utils/secureStorage';
import * as authApi from '@/api/auth';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  clearError: () => void;
  refreshTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Initialize auth state from secure storage on app start
   */
  initialize: async () => {
    set({ isLoading: true });
    try {
      // Get stored tokens and user
      const storedTokens = await secureStorage.getTokens();
      const storedUser = await secureStorage.getUser();

      if (storedTokens && storedUser) {
        set({
          tokens: storedTokens,
          user: storedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Try to verify tokens are still valid
        try {
          const response = await authApi.getMe();
          if (response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          // If getMe fails, tokens might be invalid
          console.error('Token verification failed', error);
        }
      } else {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error initializing auth', error);
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  },

  /**
   * Log in user
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });

      if (response.data) {
        const { tokens, ...user } = response.data;

        // Save to secure storage
        await secureStorage.setTokens(tokens);
        await secureStorage.setUser(user);

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Login failed';
      set({
        isLoading: false,
        error: errorMessage,
        user: null,
        tokens: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  /**
   * Sign up new user
   */
  signup: async (email: string, password: string, firstName: string, lastName: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signup({ email, password, firstName, lastName });

      if (response.data) {
        const { tokens, ...user } = response.data;

        // Save to secure storage
        await secureStorage.setTokens(tokens);
        await secureStorage.setUser(user);

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Signup failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Signup failed';
      set({
        isLoading: false,
        error: errorMessage,
        user: null,
        tokens: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  /**
   * Sign in with Google
   */
  googleLogin: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.googleAuth({ idToken });
      if (response.data) {
        const { tokens, ...user } = response.data;
        await secureStorage.setTokens(tokens);
        await secureStorage.setUser(user);
        set({ user, tokens, isAuthenticated: true, isLoading: false, error: null });
      } else {
        throw new Error(response.error?.message || 'Google sign-in failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Google sign-in failed';
      set({ isLoading: false, error: errorMessage, user: null, tokens: null, isAuthenticated: false });
      throw error;
    }
  },

  /**
   * Log out user
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error logging out', error);
    } finally {
      // Clear storage and state regardless of logout success
      await secureStorage.clearTokens();
      await secureStorage.clearUser();

      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Set user in state and storage
   */
  setUser: (user: User) => {
    set({ user });
    secureStorage.setUser(user).catch((error) => {
      console.error('Error saving user to storage', error);
    });
  },

  /**
   * Set tokens in state and storage
   */
  setTokens: async (tokens: AuthTokens) => {
    set({ tokens });
    await secureStorage.setTokens(tokens);
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Refresh tokens using refresh token
   */
  refreshTokens: async () => {
    const state = get();
    if (!state.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(state.tokens.refreshToken);

      if (response.data) {
        const newTokens: AuthTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: 3600,
        };

        await get().setTokens(newTokens);
      } else {
        throw new Error(response.error?.message || 'Token refresh failed');
      }
    } catch (error) {
      // If refresh fails, logout user
      await get().logout();
      throw error;
    }
  },
}));
