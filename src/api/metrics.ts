/**
 * Metrics API functions - Recording and retrieving health metrics
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { MetricDefinition, MetricValue, MetricHistory, MetricTrend, ApiResponse, PaginatedApiResponse } from '@/types';

// ============================================================================
// Metric Definitions
// ============================================================================

/**
 * Get all metric definitions
 */
export async function getMetricDefinitions(): Promise<ApiResponse<MetricDefinition[]>> {
  return apiGet('/metrics/definitions');
}

/**
 * Get metric definitions by category
 */
export async function getMetricsByCategory(category: string): Promise<ApiResponse<MetricDefinition[]>> {
  return apiGet(`/metrics/definitions?category=${category}`);
}

/**
 * Get single metric definition
 */
export async function getMetricDefinition(metricCode: string): Promise<ApiResponse<MetricDefinition>> {
  return apiGet(`/metrics/definitions/${metricCode}`);
}

/**
 * Get all metric categories
 */
export async function getMetricCategories(): Promise<ApiResponse<string[]>> {
  return apiGet('/metrics/categories');
}

// ============================================================================
// Recent Metrics
// ============================================================================

/**
 * Get recent metric values
 */
export async function getRecentMetrics(limit = 10): Promise<ApiResponse<MetricValue[]>> {
  return apiGet(`/metrics/recent?limit=${limit}`);
}

/**
 * Get recent metrics by category
 */
export async function getRecentMetricsByCategory(
  category: string,
  limit = 10
): Promise<ApiResponse<MetricValue[]>> {
  return apiGet(`/metrics/recent?category=${category}&limit=${limit}`);
}

/**
 * Get out of range metrics
 */
export async function getOutOfRangeMetrics(): Promise<ApiResponse<MetricValue[]>> {
  return apiGet('/metrics/out-of-range');
}

/**
 * Get latest value for a specific metric
 */
export async function getMetricByCode(metricCode: string): Promise<ApiResponse<MetricValue>> {
  return apiGet(`/metrics/${metricCode}/latest`);
}

// ============================================================================
// Recording Metrics
// ============================================================================

/**
 * Record a new metric value
 */
export async function recordMetricValue(data: {
  metricCode: string;
  value: number | string;
  unit: string;
  recordedAt?: string;
  source?: 'manual' | 'device' | 'report' | 'ai';
  notes?: string;
}): Promise<ApiResponse<MetricValue>> {
  return apiPost('/metrics/record', data);
}

/**
 * Record multiple metric values
 */
export async function recordMultipleMetrics(data: Array<{
  metricCode: string;
  value: number | string;
  unit: string;
  recordedAt?: string;
  source?: 'manual' | 'device' | 'report' | 'ai';
  notes?: string;
}>): Promise<ApiResponse<MetricValue[]>> {
  return apiPost('/metrics/record-multiple', { metrics: data });
}

// ============================================================================
// Metric History
// ============================================================================

/**
 * Get metric history
 */
export async function getMetricHistory(
  metricCode: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }
): Promise<PaginatedApiResponse<MetricValue>> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.page) params.append('page', options.page.toString());

  return apiGet(`/metrics/${metricCode}/history?${params.toString()}`);
}

/**
 * Get metric trend
 */
export async function getMetricTrend(
  metricCode: string,
  days = 30
): Promise<ApiResponse<MetricTrend>> {
  return apiGet(`/metrics/${metricCode}/trend?days=${days}`);
}

/**
 * Compare metric values between two time periods
 */
export async function compareMetric(
  metricCode: string,
  startDate1: string,
  endDate1: string,
  startDate2: string,
  endDate2: string
): Promise<ApiResponse<{ period1: number; period2: number; changePercent: number }>> {
  return apiGet(
    `/metrics/${metricCode}/compare?startDate1=${startDate1}&endDate1=${endDate1}&startDate2=${startDate2}&endDate2=${endDate2}`
  );
}

// ============================================================================
// Update/Delete Metrics
// ============================================================================

/**
 * Update a metric value
 */
export async function updateMetricValue(
  metricId: string,
  data: Partial<MetricValue>
): Promise<ApiResponse<MetricValue>> {
  return apiPut(`/metrics/${metricId}`, data);
}

/**
 * Delete a metric value
 */
export async function deleteMetricValue(metricId: string): Promise<ApiResponse<null>> {
  return apiDelete(`/metrics/${metricId}`);
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Delete multiple metric values
 */
export async function deleteMultipleMetrics(metricIds: string[]): Promise<ApiResponse<null>> {
  return apiPost('/metrics/delete-multiple', { metricIds });
}

/**
 * Export metrics as CSV
 */
export async function exportMetricsAsCSV(
  metricCode: string,
  startDate?: string,
  endDate?: string
): Promise<Blob> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/metrics/${metricCode}/export?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('@meditrack/tokens') || ''}`,
    },
  });

  return response.blob();
}
