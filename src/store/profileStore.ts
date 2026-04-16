/**
 * Health profile store using Zustand
 * Manages user health profile, allergies, medical history, and medications
 */

import { create } from 'zustand';
import { HealthProfile, UserAllergy, UserMedicalHistory, UserMedication } from '@/types';
import * as profileApi from '@/api/healthProfile';

interface ProfileState {
  profile: HealthProfile | null;
  allergies: UserAllergy[];
  medicalHistory: UserMedicalHistory[];
  medications: UserMedication[];
  isLoading: boolean;
  error: string | null;

  // Profile actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<HealthProfile>) => Promise<void>;
  setProfile: (profile: HealthProfile) => void;

  // Allergies
  fetchAllergies: () => Promise<void>;
  addAllergy: (data: { name: string; severity: string; reaction?: string }) => Promise<void>;
  updateAllergy: (allergyId: string, data: Partial<UserAllergy>) => Promise<void>;
  deleteAllergy: (allergyId: string) => Promise<void>;

  // Medical History
  fetchMedicalHistory: () => Promise<void>;
  addMedicalHistory: (data: {
    condition: string;
    diagnosedDate?: string;
    resolvedDate?: string;
    notes?: string;
  }) => Promise<void>;
  updateMedicalHistory: (historyId: string, data: Partial<UserMedicalHistory>) => Promise<void>;
  deleteMedicalHistory: (historyId: string) => Promise<void>;

  // Medications
  fetchMedications: () => Promise<void>;
  addMedication: (data: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    reason?: string;
    sideEffects?: string;
  }) => Promise<void>;
  updateMedication: (medicationId: string, data: Partial<UserMedication>) => Promise<void>;
  deleteMedication: (medicationId: string) => Promise<void>;
  completeMedication: (medicationId: string) => Promise<void>;

  // Utility
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  allergies: [],
  medicalHistory: [],
  medications: [],
  isLoading: false,
  error: null,

  // ============================================================================
  // Profile Actions
  // ============================================================================

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getHealthProfile();
      if (response.data) {
        set({ profile: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch profile');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to fetch profile';
      set({ isLoading: false, error: errorMessage });
    }
  },

  updateProfile: async (data: Partial<HealthProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.updateHealthProfile(data);
      if (response.data) {
        set({ profile: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to update profile';
      set({ isLoading: false, error: errorMessage });
    }
  },

  setProfile: (profile: HealthProfile) => {
    set({ profile });
  },

  // ============================================================================
  // Allergies Actions
  // ============================================================================

  fetchAllergies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getAllergies();
      if (response.data) {
        set({ allergies: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch allergies');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to fetch allergies';
      set({ isLoading: false, error: errorMessage });
    }
  },

  addAllergy: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.addAllergy(data as any);
      if (response.data) {
        set((state) => ({
          allergies: [...state.allergies, response.data!],
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to add allergy');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to add allergy';
      set({ isLoading: false, error: errorMessage });
    }
  },

  updateAllergy: async (allergyId: string, data: Partial<UserAllergy>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.updateAllergy(allergyId, data);
      if (response.data) {
        set((state) => ({
          allergies: state.allergies.map((a) => (a.id === allergyId ? response.data! : a)),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to update allergy');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to update allergy';
      set({ isLoading: false, error: errorMessage });
    }
  },

  deleteAllergy: async (allergyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.deleteAllergy(allergyId);
      if (response.success !== false) {
        set((state) => ({
          allergies: state.allergies.filter((a) => a.id !== allergyId),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to delete allergy');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to delete allergy';
      set({ isLoading: false, error: errorMessage });
    }
  },

  // ============================================================================
  // Medical History Actions
  // ============================================================================

  fetchMedicalHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getMedicalHistory();
      if (response.data) {
        set({ medicalHistory: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch medical history');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to fetch medical history';
      set({ isLoading: false, error: errorMessage });
    }
  },

  addMedicalHistory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.addMedicalHistory(data);
      if (response.data) {
        set((state) => ({
          medicalHistory: [...state.medicalHistory, response.data!],
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to add medical history');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to add medical history';
      set({ isLoading: false, error: errorMessage });
    }
  },

  updateMedicalHistory: async (historyId: string, data: Partial<UserMedicalHistory>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.updateMedicalHistory(historyId, data);
      if (response.data) {
        set((state) => ({
          medicalHistory: state.medicalHistory.map((h) => (h.id === historyId ? response.data! : h)),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to update medical history');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to update medical history';
      set({ isLoading: false, error: errorMessage });
    }
  },

  deleteMedicalHistory: async (historyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.deleteMedicalHistory(historyId);
      if (response.success !== false) {
        set((state) => ({
          medicalHistory: state.medicalHistory.filter((h) => h.id !== historyId),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to delete medical history');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to delete medical history';
      set({ isLoading: false, error: errorMessage });
    }
  },

  // ============================================================================
  // Medications Actions
  // ============================================================================

  fetchMedications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getMedications();
      if (response.data) {
        set({ medications: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch medications');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to fetch medications';
      set({ isLoading: false, error: errorMessage });
    }
  },

  addMedication: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.addMedication(data);
      if (response.data) {
        set((state) => ({
          medications: [...state.medications, response.data!],
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to add medication');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to add medication';
      set({ isLoading: false, error: errorMessage });
    }
  },

  updateMedication: async (medicationId: string, data: Partial<UserMedication>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.updateMedication(medicationId, data);
      if (response.data) {
        set((state) => ({
          medications: state.medications.map((m) => (m.id === medicationId ? response.data! : m)),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to update medication');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to update medication';
      set({ isLoading: false, error: errorMessage });
    }
  },

  deleteMedication: async (medicationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.deleteMedication(medicationId);
      if (response.success !== false) {
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== medicationId),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to delete medication');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to delete medication';
      set({ isLoading: false, error: errorMessage });
    }
  },

  completeMedication: async (medicationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.completeMedication(medicationId);
      if (response.data) {
        set((state) => ({
          medications: state.medications.map((m) => (m.id === medicationId ? response.data! : m)),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to complete medication');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to complete medication';
      set({ isLoading: false, error: errorMessage });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
