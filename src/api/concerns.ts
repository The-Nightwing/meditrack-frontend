/**
 * Health concerns API functions - Detection and management of health issues
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { HealthConcern, ConcernSummary, ComparisonReport, ApiResponse, PaginatedApiResponse } from '@/types';

// ============================================================================
// Concerns Summary
// ============================================================================

/**
 * Get summary of health concerns
 */
export async function getConcernsSummary(): Promise<
  ApiResponse<{
    total: number;
    active: number;
    acknowledged: number;
    monitoring: number;
    resolved: number;
    critical: number;
  }>
> {
  return apiGet('/concerns/summary');
}

// ============================================================================
// Concerns List
// ============================================================================

/**
 * Get all health concerns
 */
export async function getConcerns(options?: {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  sortBy?: string;
}): Promise<PaginatedApiResponse<ConcernSummary>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.status) params.append('status', options.status);
  if (options?.severity) params.append('severity', options.severity);
  if (options?.sortBy) params.append('sortBy', options.sortBy);

  return apiGet(`/concerns?${params.toString()}`);
}

/**
 * Get active concerns only
 */
export async function getActiveConcerns(): Promise<ApiResponse<ConcernSummary[]>> {
  return apiGet('/concerns?status=active');
}

/**
 * Get critical concerns only
 */
export async function getCriticalConcerns(): Promise<ApiResponse<ConcernSummary[]>> {
  return apiGet('/concerns?severity=critical');
}

/**
 * Get single concern by ID
 */
export async function getConcernById(concernId: string): Promise<ApiResponse<HealthConcern>> {
  return apiGet(`/concerns/${concernId}`);
}

// ============================================================================
// Concern Actions
// ============================================================================

/**
 * Acknowledge a concern
 */
export async function acknowledgeConcern(concernId: string): Promise<ApiResponse<HealthConcern>> {
  return apiPut(`/concerns/${concernId}/acknowledge`, {});
}

/**
 * Resolve a concern
 */
export async function resolveConcern(concernId: string, notes?: string): Promise<ApiResponse<HealthConcern>> {
  return apiPut(`/concerns/${concernId}/resolve`, { notes });
}

/**
 * Mark concern as being monitored
 */
export async function monitorConcern(concernId: string): Promise<ApiResponse<HealthConcern>> {
  return apiPut(`/concerns/${concernId}/monitor`, {});
}

/**
 * Update concern status
 */
export async function updateConcernStatus(
  concernId: string,
  status: 'active' | 'acknowledged' | 'monitoring' | 'resolved'
): Promise<ApiResponse<HealthConcern>> {
  return apiPut(`/concerns/${concernId}`, { status });
}

/**
 * Add notes to a concern
 */
export async function addConcernNotes(concernId: string, notes: string): Promise<ApiResponse<HealthConcern>> {
  return apiPut(`/concerns/${concernId}`, { notes });
}

/**
 * Delete a concern
 */
export async function deleteConcern(concernId: string): Promise<ApiResponse<void>> {
  return apiDelete(`/concerns/${concernId}`);
}

// ============================================================================
// Comparison Reports
// ============================================================================

/**
 * Get comparison report for a metric
 */
export async function getComparisonReport(
  metricCode: string,
  options?: {
    period1Days?: number;
    period2Days?: number;
  }
): Promise<ApiResponse<ComparisonReport>> {
  const params = new URLSearchParams();
  if (options?.period1Days) params.append('period1Days', options.period1Days.toString());
  if (options?.period2Days) params.append('period2Days', options.period2Days.toString());

  return apiGet(`/concerns/comparison/${metricCode}?${params.toString()}`);
}

/**
 * Get trend analysis
 */
export async function getTrendAnalysis(metricCode: string, days = 30): Promise<ApiResponse<{ analysis: string; trend: string }>> {
  return apiGet(`/concerns/trends/${metricCode}?days=${days}`);
}

// ============================================================================
// AI Recommendations
// ============================================================================

/**
 * Get AI recommendations for a concern
 */
export async function getAIRecommendations(concernId: string): Promise<ApiResponse<{ recommendations: string[] }>> {
  return apiGet(`/concerns/${concernId}/ai-recommendations`);
}

/**
 * Get risk assessment
 */
export async function getRiskAssessment(): Promise<
  ApiResponse<{
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    recommendations: string[];
  }>
> {
  return apiGet('/concerns/risk-assessment');
}

// ============================================================================
// Concern Discovery
// ============================================================================

/**
 * Get concerns related to a metric
 */
export async function getConcernsByMetric(metricCode: string): Promise<ApiResponse<ConcernSummary[]>> {
  return apiGet(`/concerns/by-metric/${metricCode}`);
}

/**
 * Get potential concerns based on current metrics
 */
export async function getPotentialConcerns(): Promise<ApiResponse<ConcernSummary[]>> {
  return apiGet('/concerns/potential');
}
