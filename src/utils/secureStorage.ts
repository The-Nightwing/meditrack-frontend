/**
 * Secure storage wrapper around expo-secure-store
 * Handles token management and sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthTokens } from '@/types';
import { STORAGE_KEYS } from './constants';

const isWeb = Platform.OS === 'web';
const store = isWeb
  ? {
      getItemAsync: (key: string) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
      setItemAsync: (key: string, value: string) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); return Promise.resolve(); },
      deleteItemAsync: (key: string) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); return Promise.resolve(); },
    }
  : SecureStore;

class SecureStorageService {
  /**
   * Get item from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await store.getItemAsync(key);
      return value;
    } catch (error) {
      console.error(`Error retrieving item from secure storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item in secure storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await store.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error saving item to secure storage: ${key}`, error);
      throw error;
    }
  }

  /**
   * Remove item from secure storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await store.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing item from secure storage: ${key}`, error);
      throw error;
    }
  }

  /**
   * Clear all items from secure storage
   */
  async clear(): Promise<void> {
    try {
      // Note: SecureStore doesn't have a clear all method in all versions
      // We'll clear known keys instead
      const keysToDelete = Object.values(STORAGE_KEYS);
      for (const key of keysToDelete) {
        try {
          await this.removeItem(key);
        } catch {
          // Ignore individual deletion errors
        }
      }
    } catch (error) {
      console.error('Error clearing secure storage', error);
      throw error;
    }
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  /**
   * Get stored tokens
   */
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const tokensJson = await this.getItem(STORAGE_KEYS.TOKENS);
      if (!tokensJson) {
        return null;
      }
      return JSON.parse(tokensJson) as AuthTokens;
    } catch (error) {
      console.error('Error retrieving tokens from secure storage', error);
      return null;
    }
  }

  /**
   * Save tokens
   */
  async setTokens(tokens: AuthTokens): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving tokens to secure storage', error);
      throw error;
    }
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const tokens = await this.getTokens();
      return tokens?.accessToken ?? null;
    } catch (error) {
      console.error('Error retrieving access token', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const tokens = await this.getTokens();
      return tokens?.refreshToken ?? null;
    } catch (error) {
      console.error('Error retrieving refresh token', error);
      return null;
    }
  }

  /**
   * Update access token
   */
  async updateAccessToken(accessToken: string): Promise<void> {
    try {
      const tokens = await this.getTokens();
      if (tokens) {
        tokens.accessToken = accessToken;
        await this.setTokens(tokens);
      }
    } catch (error) {
      console.error('Error updating access token', error);
      throw error;
    }
  }

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await this.removeItem(STORAGE_KEYS.TOKENS);
    } catch (error) {
      console.error('Error clearing tokens', error);
      throw error;
    }
  }

  /**
   * Check if tokens exist
   */
  async hasTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      return tokens !== null && !!tokens.accessToken && !!tokens.refreshToken;
    } catch (error) {
      console.error('Error checking for tokens', error);
      return false;
    }
  }

  // ============================================================================
  // User Management
  // ============================================================================

  /**
   * Save user data
   */
  async setUser(user: any): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to secure storage', error);
      throw error;
    }
  }

  /**
   * Get stored user data
   */
  async getUser(): Promise<any | null> {
    try {
      const userJson = await this.getItem(STORAGE_KEYS.USER);
      if (!userJson) {
        return null;
      }
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error retrieving user from secure storage', error);
      return null;
    }
  }

  /**
   * Clear user data
   */
  async clearUser(): Promise<void> {
    try {
      await this.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing user from secure storage', error);
      throw error;
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService();
