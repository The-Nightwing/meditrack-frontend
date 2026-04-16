/**
 * Custom hook for metrics with react-query integration
 * Provides data fetching and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMetricsStore } from '@/store/metricsStore';
import * as metricsApi from '@/api/metrics';

/**
 * Hook to fetch metric definitions
 */
export function useMetricDefinitions() {
  const definitions = useMetricsStore((state) => state.definitions);
  const fetchDefinitions = useMetricsStore((state) => state.fetchDefinitions);

  const { isLoading, error } = useQuery({
    queryKey: ['metrics', 'definitions'],
    queryFn: async () => {
      await fetchDefinitions();
      return definitions;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    definitions,
    isLoading,
    error,
    refetch: fetchDefinitions,
  };
}

/**
 * Hook to fetch recent metrics
 */
export function useRecentMetrics(limit = 10) {
  const recentMetrics = useMetricsStore((state) => state.recentMetrics);
  const fetchRecentMetrics = useMetricsStore((state) => state.fetchRecentMetrics);

  const { isLoading, error } = useQuery({
    queryKey: ['metrics', 'recent', limit],
    queryFn: async () => {
      await fetchRecentMetrics(limit);
      return recentMetrics;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    metrics: recentMetrics,
    isLoading,
    error,
    refetch: () => fetchRecentMetrics(limit),
  };
}

/**
 * Hook to fetch out of range metrics
 */
export function useOutOfRangeMetrics() {
  const outOfRange = useMetricsStore((state) => state.outOfRange);
  const fetchOutOfRangeMetrics = useMetricsStore((state) => state.fetchOutOfRangeMetrics);

  const { isLoading, error } = useQuery({
    queryKey: ['metrics', 'out-of-range'],
    queryFn: async () => {
      await fetchOutOfRangeMetrics();
      return outOfRange;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    metrics: outOfRange,
    isLoading,
    error,
    refetch: fetchOutOfRangeMetrics,
  };
}

/**
 * Hook to fetch metric history
 */
export function useMetricHistory(metricCode: string, options?: any) {
  const cache = useMetricsStore((state) => state.cache);
  const fetchMetricHistory = useMetricsStore((state) => state.fetchMetricHistory);

  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics', 'history', metricCode, JSON.stringify(options)],
    queryFn: async () => {
      return await fetchMetricHistory(metricCode, options);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    history: data || cache.get(metricCode) || [],
    isLoading,
    error,
  };
}

/**
 * Hook to fetch metric trend
 */
export function useMetricTrend(metricCode: string, days = 30) {
  const trends = useMetricsStore((state) => state.trends);
  const fetchMetricTrend = useMetricsStore((state) => state.fetchMetricTrend);

  const { isLoading, error } = useQuery({
    queryKey: ['metrics', 'trend', metricCode, days],
    queryFn: async () => {
      await fetchMetricTrend(metricCode, days);
      return trends.get(metricCode);
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    trend: trends.get(metricCode),
    isLoading,
    error,
  };
}

/**
 * Hook to record metric value
 */
export function useRecordMetric() {
  const queryClient = useQueryClient();
  const recordMetricValue = useMetricsStore((state) => state.recordMetricValue);

  const mutation = useMutation({
    mutationFn: recordMetricValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  return {
    recordMetric: mutation.mutate,
    recordMetricAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

/**
 * Hook to record multiple metrics
 */
export function useRecordMultipleMetrics() {
  const queryClient = useQueryClient();
  const recordMultipleMetrics = useMetricsStore((state) => state.recordMultipleMetrics);

  const mutation = useMutation({
    mutationFn: recordMultipleMetrics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  return {
    recordMetrics: mutation.mutate,
    recordMetricsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

/**
 * Hook to update metric value
 */
export function useUpdateMetric() {
  const queryClient = useQueryClient();
  const updateMetricValue = useMetricsStore((state) => state.updateMetricValue);

  const mutation = useMutation({
    mutationFn: ({ metricId, data }: { metricId: string; data: any }) =>
      updateMetricValue(metricId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  return {
    updateMetric: mutation.mutate,
    updateMetricAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to delete metric value
 */
export function useDeleteMetric() {
  const queryClient = useQueryClient();
  const deleteMetricValue = useMetricsStore((state) => state.deleteMetricValue);

  const mutation = useMutation({
    mutationFn: deleteMetricValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  return {
    deleteMetric: mutation.mutate,
    deleteMetricAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
