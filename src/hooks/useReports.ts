/**
 * Custom hook for health reports
 * Handles report operations with react-query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reportsApi from '@/api/reports';

/**
 * Hook to fetch all reports
 */
export function useReports(options?: any) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', JSON.stringify(options)],
    queryFn: () => reportsApi.getReports(options),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    reports: data?.data?.data || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch single report
 */
export function useReport(reportId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', reportId],
    queryFn: () => reportsApi.getReportById(reportId),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    report: data?.data || null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to upload report
 */
export function useUploadReport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: { file: any; metadata?: any }) =>
      reportsApi.uploadReport(params.file, params.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    uploadReport: mutation.mutate,
    uploadReportAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}

/**
 * Hook to create manual report
 */
export function useCreateManualReport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: reportsApi.createManualReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    createReport: mutation.mutate,
    createReportAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to get extraction status
 */
export function useExtractionStatus(reportId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', reportId, 'extraction'],
    queryFn: () => reportsApi.getExtractionStatus(reportId),
    enabled: !!reportId,
    staleTime: 1000 * 30, // 30 seconds - polling often for extraction status
    refetchInterval: 3000, // Poll every 3 seconds
  });

  return {
    status: data?.data?.status,
    metrics: data?.data?.extractedMetrics,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to retry extraction
 */
export function useRetryExtraction() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: reportsApi.retryExtraction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['reports', data.data?.id, 'extraction'],
      });
    },
  });

  return {
    retryExtraction: mutation.mutate,
    retryExtractionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to confirm metrics
 */
export function useConfirmMetrics() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: { reportId: string; metrics: any[] }) =>
      reportsApi.confirmMetrics(params.reportId, params.metrics),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['reports', data.data?.id],
      });
    },
  });

  return {
    confirmMetrics: mutation.mutate,
    confirmMetricsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to add metrics to report
 */
export function useAddMetrics() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: { reportId: string; metrics: any[] }) =>
      reportsApi.addMetrics(params.reportId, params.metrics),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['reports', data.data?.id],
      });
    },
  });

  return {
    addMetrics: mutation.mutate,
    addMetricsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to update report
 */
export function useUpdateReport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: { reportId: string; data: any }) =>
      reportsApi.updateReport(params.reportId, params.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['reports', data.data?.id],
      });
    },
  });

  return {
    updateReport: mutation.mutate,
    updateReportAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to delete report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: reportsApi.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    deleteReport: mutation.mutate,
    deleteReportAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
