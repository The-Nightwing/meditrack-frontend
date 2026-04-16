/**
 * Custom hook for health concerns
 * Handles concern operations with react-query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useConcernsStore } from '@/store/concernsStore';
import * as concernsApi from '@/api/concerns';

/**
 * Hook to fetch all concerns
 */
export function useConcerns(options?: any) {
  const fetchConcerns = useConcernsStore((state) => state.fetchConcerns);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['concerns', JSON.stringify(options)],
    queryFn: async () => {
      await fetchConcerns(options);
      const response = await concernsApi.getConcerns(options);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    concerns: data?.data?.data || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch concerns summary
 */
export function useConcernsSummary() {
  const summary = useConcernsStore((state) => state.summary);
  const fetchSummary = useConcernsStore((state) => state.fetchConcernsSummary);

  const { isLoading, error } = useQuery({
    queryKey: ['concerns', 'summary'],
    queryFn: async () => {
      await fetchSummary();
      return summary;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}

/**
 * Hook to fetch single concern
 */
export function useConcern(concernId: string) {
  const getConcernById = useConcernsStore((state) => state.getConcernById);

  const { data, isLoading, error } = useQuery({
    queryKey: ['concerns', concernId],
    queryFn: () => getConcernById(concernId),
    enabled: !!concernId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    concern: data,
    isLoading,
    error,
  };
}

/**
 * Hook to acknowledge concern
 */
export function useAcknowledgeConcern() {
  const queryClient = useQueryClient();
  const acknowledgeConcern = useConcernsStore((state) => state.acknowledgeConcern);

  const mutation = useMutation({
    mutationFn: acknowledgeConcern,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerns'] });
    },
  });

  return {
    acknowledgeConcern: mutation.mutate,
    acknowledgeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to resolve concern
 */
export function useResolveConcern() {
  const queryClient = useQueryClient();
  const resolveConcern = useConcernsStore((state) => state.resolveConcern);

  const mutation = useMutation({
    mutationFn: (params: { concernId: string; notes?: string }) =>
      resolveConcern(params.concernId, params.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerns'] });
    },
  });

  return {
    resolveConcern: mutation.mutate,
    resolveAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to monitor concern
 */
export function useMonitorConcern() {
  const queryClient = useQueryClient();
  const monitorConcern = useConcernsStore((state) => state.monitorConcern);

  const mutation = useMutation({
    mutationFn: monitorConcern,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerns'] });
    },
  });

  return {
    monitorConcern: mutation.mutate,
    monitorAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to get comparison report
 */
export function useComparisonReport(metricCode: string, options?: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['concerns', 'comparison', metricCode, JSON.stringify(options)],
    queryFn: () => concernsApi.getComparisonReport(metricCode, options),
    enabled: !!metricCode,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    report: data?.data || null,
    isLoading,
    error,
  };
}

/**
 * Hook to get concerns by metric
 */
export function useConcernsByMetric(metricCode: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['concerns', 'by-metric', metricCode],
    queryFn: () => concernsApi.getConcernsByMetric(metricCode),
    enabled: !!metricCode,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    concerns: data?.data || [],
    isLoading,
    error,
  };
}

/**
 * Hook to get AI recommendations
 */
export function useAIRecommendations(concernId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['concerns', concernId, 'ai-recommendations'],
    queryFn: () => concernsApi.getAIRecommendations(concernId),
    enabled: !!concernId,
    staleTime: 1000 * 60 * 20, // 20 minutes
  });

  return {
    recommendations: data?.data?.recommendations || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get risk assessment
 */
export function useRiskAssessment() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['concerns', 'risk-assessment'],
    queryFn: () => concernsApi.getRiskAssessment(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    riskLevel: data?.data?.overallRisk,
    riskFactors: data?.data?.riskFactors || [],
    recommendations: data?.data?.recommendations || [],
    isLoading,
    error,
    refetch,
  };
}
