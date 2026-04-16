/**
 * Health profile and personal health information API functions
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { HealthProfile, UserAllergy, UserMedicalHistory, UserMedication, ApiResponse } from '@/types';

// ============================================================================
// Health Profile
// ============================================================================

/**
 * Get user's health profile
 */
export async function getHealthProfile(): Promise<ApiResponse<HealthProfile>> {
  return apiGet('/health-profile');
}

/**
 * Create health profile
 */
export async function createHealthProfile(data: Partial<HealthProfile>): Promise<ApiResponse<HealthProfile>> {
  return apiPost('/health-profile', data);
}

/**
 * Update health profile
 */
export async function updateHealthProfile(data: Partial<HealthProfile>): Promise<ApiResponse<HealthProfile>> {
  return apiPut('/health-profile', data);
}

/**
 * Delete health profile
 */
export async function deleteHealthProfile(): Promise<ApiResponse<null>> {
  return apiDelete('/health-profile');
}

// ============================================================================
// Allergies
// ============================================================================

/**
 * Get user's allergies
 */
export async function getAllergies(): Promise<ApiResponse<UserAllergy[]>> {
  return apiGet('/health-profile/allergies');
}

/**
 * Add allergy
 */
export async function addAllergy(data: {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
}): Promise<ApiResponse<UserAllergy>> {
  return apiPost('/health-profile/allergies', data);
}

/**
 * Update allergy
 */
export async function updateAllergy(
  allergyId: string,
  data: Partial<UserAllergy>
): Promise<ApiResponse<UserAllergy>> {
  return apiPut(`/health-profile/allergies/${allergyId}`, data);
}

/**
 * Delete allergy
 */
export async function deleteAllergy(allergyId: string): Promise<ApiResponse<null>> {
  return apiDelete(`/health-profile/allergies/${allergyId}`);
}

// ============================================================================
// Medical History
// ============================================================================

/**
 * Get user's medical history
 */
export async function getMedicalHistory(): Promise<ApiResponse<UserMedicalHistory[]>> {
  return apiGet('/health-profile/medical-history');
}

/**
 * Add medical history entry
 */
export async function addMedicalHistory(data: {
  condition: string;
  diagnosedDate?: string;
  resolvedDate?: string;
  notes?: string;
}): Promise<ApiResponse<UserMedicalHistory>> {
  return apiPost('/health-profile/medical-history', data);
}

/**
 * Update medical history entry
 */
export async function updateMedicalHistory(
  historyId: string,
  data: Partial<UserMedicalHistory>
): Promise<ApiResponse<UserMedicalHistory>> {
  return apiPut(`/health-profile/medical-history/${historyId}`, data);
}

/**
 * Delete medical history entry
 */
export async function deleteMedicalHistory(historyId: string): Promise<ApiResponse<null>> {
  return apiDelete(`/health-profile/medical-history/${historyId}`);
}

// ============================================================================
// Medications
// ============================================================================

/**
 * Get user's current medications
 */
export async function getMedications(): Promise<ApiResponse<UserMedication[]>> {
  return apiGet('/health-profile/medications');
}

/**
 * Add medication
 */
export async function addMedication(data: {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  sideEffects?: string;
}): Promise<ApiResponse<UserMedication>> {
  return apiPost('/health-profile/medications', data);
}

/**
 * Update medication
 */
export async function updateMedication(
  medicationId: string,
  data: Partial<UserMedication>
): Promise<ApiResponse<UserMedication>> {
  return apiPut(`/health-profile/medications/${medicationId}`, data);
}

/**
 * Delete medication
 */
export async function deleteMedication(medicationId: string): Promise<ApiResponse<null>> {
  return apiDelete(`/health-profile/medications/${medicationId}`);
}

/**
 * Mark medication as completed
 */
export async function completeMedication(medicationId: string): Promise<ApiResponse<UserMedication>> {
  return apiPut(`/health-profile/medications/${medicationId}`, { endDate: new Date().toISOString() });
}
