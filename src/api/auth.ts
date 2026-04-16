/**
 * Authentication API functions
 */

import { apiPost, apiGet } from './client';
import { User, AuthTokens, ApiResponse } from '@/types';

/**
 * Sign up new user
 */
export async function signup(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  return apiPost('/auth/signup', data);
}

/**
 * Log in user
 */
export async function login(data: { email: string; password: string }): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  return apiPost('/auth/login', data);
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
  return apiPost('/auth/refresh', { refreshToken });
}

/**
 * Log out user
 */
export async function logout(): Promise<ApiResponse<null>> {
  return apiPost('/auth/logout', {});
}

/**
 * Get current user profile
 */
export async function getMe(): Promise<ApiResponse<User>> {
  return apiGet('/auth/me');
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
  return apiPost('/auth/forgot-password', { email });
}

/**
 * Reset password with token
 */
export async function resetPassword(data: { token: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
  return apiPost('/auth/reset-password', data);
}

/**
 * Verify email
 */
export async function verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
  return apiPost('/auth/verify-email', { token });
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<ApiResponse<{ message: string }>> {
  return apiPost('/auth/resend-verification', { email });
}

/**
 * Update password
 */
export async function updatePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
  return apiPost('/auth/change-password', data);
}

/**
 * Sign in / sign up with Google OAuth token
 */
export async function googleAuth(data: { idToken: string }): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  return apiPost('/auth/google', data);
}
