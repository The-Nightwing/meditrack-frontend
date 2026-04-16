/**
 * Metrics store using Zustand
 * Manages metric definitions, values, and history
 */

import { create } from 'zustand';
import { MetricDefinition, MetricValue, MetricTrend } from '@/types';
import * as metricsApi from '@/api/metrics';

interface MetricsState {
  // Data
  definitions: MetricDefinition[];
  recentMetrics: MetricValue[];
  outOfRange: MetricValue[];
  cache: Map<string, MetricValue[]>; // metric code -> history
  trends: Map<string, MetricTrend>;
  isLoading: boolean;
  error: string | null;

  // Fetching
  fetchDefinitions: () => Promise<void>;
  fetchDefinitionsByCategory: (category: string) => Promise<MetricDefinition[]>;
  fetchRecentMetrics: (limit?: number) => Promise<void>;
  fetchOutOfRangeMetrics: () => Promise<void>;
  fetchMetricHistory: (metricCode: string, options?: any) => Promise<MetricValue[]>;
  fetchMetricTrend: (metricCode: string, days?: number) => Promise<void>;

  // Recording
  recordMetricValue: (data: {
    metricCode: string;
    value: number | string;
    unit: string;
    recordedAt?: string;
    source?: string;
    notes?: string;
  }) => Promise<void>;

  recordMultipleMetrics: (data: Array<any>) => Promise<void>;

  // Updates
  updateMetricValue: (metricId: string, data: Partial<MetricValue>) => Promise<void>;
  deleteMetricValue: (metricId: string) => Promise<void>;

  // Utility
  getDefinitionByCode: (code: string) => MetricDefinition | undefined;
  clearCache: () => void;
  clearError: () => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  definitions: [],
  recentMetrics: [],
  outOfRange: [],
  cache: new Map(),
  trends: new Map(),
  isLoading: false,
  error: null,

  // ============================================================================
  // Definitions
  // ============================================================================

  fetchDefinitions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await metricsApi.getMetricDefinitions();
      if (response.data) {
        set({ definitions: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch metric definitions');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message || error.message || 'Failed to fetch metric definitions';
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchDefinitionsByCategory: async (category: string) => {
    try {
      const response = await metricsApi.getMetricsByCategory(category);
      if (response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch metric definitions');
      }
    } catch (error: any) {
      console.error('Error fetching definitions by category', error);
      return [];
    }
  },

  // ============================================================================
  // Recent Metrics
  // ============================================================================

  fetchRecentMetrics: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await metricsApi.getRecentMetrics(limit);
      if (response.data) {
        set({ recentMetrics: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch recent metrics');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message || error.message || 'Failed to fetch recent metrics';
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchOutOfRangeMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await metricsApi.getOutOfRangeMetrics();
      if (response.data) {
        set({ outOfRange: response.data, isLoading: false });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch out of range metrics');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message || error.message || 'Failed to fetch out of range metrics';
      set({ isLoading: false, error: errorMessage });
    }
  },

  // ============================================================================
  // History
  // ============================================================================

  fetchMetricHistory: async (metricCode: string, options?: any) => {
    try {
      const response = await metricsApi.getMetricHistory(metricCode, options);
      if (response) {
        const values = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
        set((state) => {
          const newCache = new Map(state.cache);
          newCache.set(metricCode, values);
          return { cache: newCache };
        });
        return values;
      } else {
        throw new Error('Failed to fetch metric history');
      }
    } catch (error: any) {
      console.error('Error fetching metric history', error);
      return [];
    }
  },

  fetchMetricTrend: async (metricCode: string, days = 30) => {
    set({ isLoading: true, error: null });
    try {
      const response = await metricsApi.getMetricTrend(metricCode, days);
      if (response.data) {
        set((state) => {
          const newTrends = new Map(state.trends);
          newTrends.set(metricCode, response.data!);
          return { trends: newTrends, isLoading: false };
        });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch metric trend');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to fetch metric trend';
      set({ isLoading: false, error: errorMessage });
    }
  },

  // ============================================================================
  // Recording
  // ============================================================================

  recordMetricValue: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await metricsApi.recordMetricValue(data);
      if (response.data) {
        set((state) => ({
          recentMetrics: [response.data!, ...state.recentMetrics.slice(0, 9)],
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to record metric');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to record metric';
      set({ isLoading: false, error: errorMessage });
    }
  },

  recordMultipleMetrics: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await metricsApi.recordMultipleMetrics(data);
      if (response.data) {
        set((state) => ({
          recentMetrics: [...response.data!, ...state.recentMetrics],
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to record metrics');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to record metrics';
      set({ isLoading: false, error: errorMessage });
    }
  },

  // ============================================================================
  // Update/Delete
  // ============================================================================

  updateMetricValue: async (metricId: string, data: Partial<MetricValue>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await metricsApi.updateMetricValue(metricId, data);
      if (response.data) {
        set((state) => ({
          recentMetrics: state.recentMetrics.map((m) => (m.id === metricId ? response.data! : m)),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to update metric');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to update metric';
      set({ isLoading: false, error: errorMessage });
    }
  },

  deleteMetricValue: async (metricId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await metricsApi.deleteMetricValue(metricId);
      if (response.success !== false) {
        set((state) => ({
          recentMetrics: state.recentMetrics.filter((m) => m.id !== metricId),
          isLoading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to delete metric');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Failed to delete metric';
      set({ isLoading: false, error: errorMessage });
    }
  },

  // ============================================================================
  // Utility
  // ============================================================================

  getDefinitionByCode: (code: string) => {
    const state = get();
    return state.definitions.find((d) => d.code === code);
  },

  clearCache: () => {
    set({ cache: new Map(), trends: new Map() });
  },

  clearError: () => {
    set({ error: null });
  },
}));
