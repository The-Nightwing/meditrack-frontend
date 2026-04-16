/**
 * Health concerns store using Zustand
 * Manages health concerns and their status
 */

import { create } from 'zustand';
import { HealthConcern, ConcernSummary } from '@/types';
import * as concernsApi from '@/api/concerns';

interface ConcernsState {
  concerns: ConcernSummary[];
  summary: {
    total: number;
    active: number;
    acknowledged: number;
    monitoring: number;
    resolved: number;
    critical: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Fetching
  fetchConcerns: (options?: any) => Promise<void>;
  fetchConcernsSummary: () => Promise<void>;
  getConcernById: (concernId: string) => Promise<HealthConcern | null>;

  // Actions
  acknowledgeConcern: (concernId: string) => Promise<void>;
  resolveConcern: (concernId: string, notes?: string) => Promise<void>;
  monitorConcern: (concernId: string) => Promise<void>;
  deleteConcern: (concernId: string) => Promise<void>;

  // Utility
  clearError: () => void;
}

export const useConcernsStore = create<ConcernsState>((set, get) => ({
  concerns: [],
  summary: null,
  isLoading: false,
  error: null,

  // ============================================================================
  // Fetching
  // ============================================================================

  fetchConcerns: async (options?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await concernsApi.getConcerns(options);
      if (response.data) {
        const data = Array.isArray(response.data) ? response.data : (response.data.data ?? []);
        set({ concerns: data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch concerns');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to fetch concerns';
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchConcernsSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await concernsApi.getConcernsSummary();
      if (response.data) {
        set({ summary: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch concerns summary');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to fetch concerns summary';
      set({ isLoading: false, error: errorMessage });
    }
  },

  getConcernById: async (concernId: string) => {
    try {
      const response = await concernsApi.getConcernById(concernId);
      if (response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch concern');
      }
    } catch (error: any) {
      console.error('Error fetching concern', error);
      return null;
    }
  },

  // ============================================================================
  // Actions
  // ============================================================================

  acknowledgeConcern: async (concernId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await concernsApi.acknowledgeConcern(concernId);
      if (response.data) {
        // Update in concerns list if it exists
        set((state) => ({
          concerns: state.concerns.map((c) =>
            c.id === concernId ? { ...c, status: 'acknowledged' as const } : c
          ),
          isLoading: false,
        }));

        // Refetch summary to get updated counts
        await get().fetchConcernsSummary();
      } else {
        throw new Error(response.error?.message || 'Failed to acknowledge concern');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to acknowledge concern';
      set({ isLoading: false, error: errorMessage });
    }
  },

  resolveConcern: async (concernId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await concernsApi.resolveConcern(concernId, notes);
      if (response.data) {
        // Update in concerns list
        set((state) => ({
          concerns: state.concerns.map((c) => (c.id === concernId ? { ...c, status: 'resolved' as const } : c)),
          isLoading: false,
        }));

        // Refetch summary to get updated counts
        await get().fetchConcernsSummary();
      } else {
        throw new Error(response.error?.message || 'Failed to resolve concern');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to resolve concern';
      set({ isLoading: false, error: errorMessage });
    }
  },

  monitorConcern: async (concernId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await concernsApi.monitorConcern(concernId);
      if (response.data) {
        // Update in concerns list
        set((state) => ({
          concerns: state.concerns.map((c) =>
            c.id === concernId ? { ...c, status: 'monitoring' as const } : c
          ),
          isLoading: false,
        }));

        // Refetch summary to get updated counts
        await get().fetchConcernsSummary();
      } else {
        throw new Error(response.error?.message || 'Failed to update concern status');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to update concern status';
      set({ isLoading: false, error: errorMessage });
    }
  },

  deleteConcern: async (concernId: string) => {
    set({ isLoading: true, error: null });
    try {
      await concernsApi.deleteConcern(concernId);
      set((state) => ({
        concerns: state.concerns.filter((c) => c.id !== concernId),
        isLoading: false,
      }));
      await get().fetchConcernsSummary();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to delete concern';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // ============================================================================
  // Utility
  // ============================================================================

  clearError: () => {
    set({ error: null });
  },
}));
