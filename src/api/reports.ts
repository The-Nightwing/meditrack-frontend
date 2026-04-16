/**
 * Health reports API functions - Uploading and managing medical documents
 */

import { apiPost, apiGet, apiPut, apiDelete } from './client';
import { HealthReport, ExtractionStatus, ApiResponse, PaginatedApiResponse } from '@/types';

// ============================================================================
// Report Management
// ============================================================================

/**
 * Upload a health report file
 */
export async function uploadReport(
  file: {
    uri: string;
    type: string;
    name: string;
  },
  metadata?: {
    title?: string;
    description?: string;
    reportType?: string;
    reportDate?: string;
  }
): Promise<ApiResponse<HealthReport>> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);

  if (metadata?.title) formData.append('title', metadata.title);
  if (metadata?.description) formData.append('description', metadata.description);
  if (metadata?.reportType) formData.append('reportType', metadata.reportType);
  if (metadata?.reportDate) formData.append('reportDate', metadata.reportDate);

  return apiPost('/reports/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Create a manual report (without file)
 */
export async function createManualReport(data: {
  title: string;
  description?: string;
  reportType: string;
  reportDate?: string;
  metrics?: Array<{
    metricCode: string;
    value: number | string;
    notes?: string;
  }>;
}): Promise<ApiResponse<HealthReport>> {
  return apiPost('/reports/manual', data);
}

/**
 * Get all reports
 */
export async function getReports(options?: {
  page?: number;
  limit?: number;
  reportType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedApiResponse<HealthReport>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.reportType) params.append('reportType', options.reportType);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  return apiGet(`/reports?${params.toString()}`);
}

/**
 * Get single report by ID
 */
export async function getReportById(reportId: string): Promise<ApiResponse<HealthReport>> {
  return apiGet(`/reports/${reportId}`);
}

/**
 * Update report
 */
export async function updateReport(reportId: string, data: Partial<HealthReport>): Promise<ApiResponse<HealthReport>> {
  return apiPut(`/reports/${reportId}`, data);
}

/**
 * Delete report
 */
export async function deleteReport(reportId: string): Promise<ApiResponse<null>> {
  return apiDelete(`/reports/${reportId}`);
}

// ============================================================================
// Metric Extraction
// ============================================================================

/**
 * Get extraction status for a report
 */
export async function getExtractionStatus(reportId: string): Promise<ApiResponse<{ status: ExtractionStatus; extractedMetrics: any[] }>> {
  return apiGet(`/reports/${reportId}/extraction-status`);
}

/**
 * Retry extraction for a report
 */
export async function retryExtraction(reportId: string): Promise<ApiResponse<HealthReport>> {
  return apiPost(`/reports/${reportId}/retry-extraction`, {});
}

/**
 * Confirm extracted metrics
 */
export async function confirmMetrics(
  reportId: string,
  confirmedMetrics: Array<{
    metricCode: string;
    value: number | string;
    notes?: string;
  }>
): Promise<ApiResponse<HealthReport>> {
  return apiPost(`/reports/${reportId}/confirm-metrics`, { metrics: confirmedMetrics });
}

/**
 * Add additional metrics to a report
 */
export async function addMetrics(
  reportId: string,
  metrics: Array<{
    metricCode: string;
    value: number | string;
    notes?: string;
  }>
): Promise<ApiResponse<HealthReport>> {
  return apiPost(`/reports/${reportId}/add-metrics`, { metrics });
}

// ============================================================================
// Report Analysis
// ============================================================================

/**
 * Get AI analysis for a report
 */
export async function getReportAnalysis(reportId: string): Promise<ApiResponse<{ analysis: string }>> {
  return apiGet(`/reports/${reportId}/analysis`);
}

/**
 * Request report comparison with previous reports
 */
export async function getReportComparison(
  reportId: string,
  previousReportId?: string
): Promise<ApiResponse<{ comparison: string; differences: any[] }>> {
  const url = previousReportId
    ? `/reports/${reportId}/compare?previousReportId=${previousReportId}`
    : `/reports/${reportId}/compare`;

  return apiGet(url);
}

// ============================================================================
// Report Downloads
// ============================================================================

/**
 * Download report file
 */
export async function downloadReport(reportId: string): Promise<Blob> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/reports/${reportId}/download`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('@meditrack/tokens') || ''}`,
      },
    }
  );

  return response.blob();
}

/**
 * Export report as PDF
 */
export async function exportReportAsPDF(reportId: string): Promise<Blob> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/reports/${reportId}/export-pdf`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('@meditrack/tokens') || ''}`,
      },
    }
  );

  return response.blob();
}
