/**
 * Dashboard API functions - Aggregated health data and summaries
 */

import { apiGet } from './client';
import { DashboardSummary, MetricTrend, TimelineItem, ApiResponse } from '@/types';

// ============================================================================
// Dashboard Summary
// ============================================================================

/**
 * Get complete dashboard summary
 */
export async function getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
  return apiGet('/dashboard/summary');
}

/**
 * Get quick health snapshot
 */
export async function getHealthSnapshot(): Promise<
  ApiResponse<{
    overallHealth: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    lastUpdate: string;
  }>
> {
  return apiGet('/dashboard/snapshot');
}

// ============================================================================
// Metrics Dashboard
// ============================================================================

/**
 * Get recent metrics for dashboard
 */
export async function getRecentMetricsForDashboard(limit = 10): Promise<ApiResponse<MetricTrend[]>> {
  return apiGet(`/dashboard/metrics/recent?limit=${limit}`);
}

/**
 * Get metric trends
 */
export async function getMetricTrends(options?: {
  days?: number;
  limit?: number;
}): Promise<ApiResponse<MetricTrend[]>> {
  const params = new URLSearchParams();
  if (options?.days) params.append('days', options.days.toString());
  if (options?.limit) params.append('limit', options.limit.toString());

  return apiGet(`/dashboard/metrics/trends?${params.toString()}`);
}

/**
 * Get metrics by category for dashboard
 */
export async function getMetricsByCategory(category: string): Promise<ApiResponse<MetricTrend[]>> {
  return apiGet(`/dashboard/metrics/by-category/${category}`);
}

// ============================================================================
// Concerns Dashboard
// ============================================================================

/**
 * Get dashboard concerns summary
 */
export async function getDashboardConcerns(): Promise<
  ApiResponse<{
    active: number;
    critical: number;
    topConcerns: Array<{
      id: string;
      title: string;
      severity: string;
      detectionMethod: string;
    }>;
  }>
> {
  return apiGet('/dashboard/concerns');
}

// ============================================================================
// Plans Dashboard
// ============================================================================

/**
 * Get active plans summary
 */
export async function getActivePlansForDashboard(): Promise<
  ApiResponse<{
    active: number;
    inProgress: number;
    completed: number;
    plans: Array<{
      id: string;
      title: string;
      status: string;
      progress: number;
    }>;
  }>
> {
  return apiGet('/dashboard/plans');
}

// ============================================================================
// Timeline
// ============================================================================

/**
 * Get health timeline
 */
export async function getTimeline(options?: {
  limit?: number;
  types?: string[];
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<TimelineItem[]>> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.types) params.append('types', options.types.join(','));
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  return apiGet(`/dashboard/timeline?${params.toString()}`);
}

/**
 * Get timeline for specific metric
 */
export async function getMetricTimeline(metricCode: string, days = 30): Promise<ApiResponse<TimelineItem[]>> {
  return apiGet(`/dashboard/timeline/metric/${metricCode}?days=${days}`);
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<
  ApiResponse<{
    totalMetricsRecorded: number;
    metricsRecordedThisMonth: number;
    activeConcerns: number;
    resolvedConcerns: number;
    activePlans: number;
    completedPlans: number;
  }>
> {
  return apiGet('/dashboard/stats');
}

/**
 * Get comparison with previous period
 */
export async function getComparisonStats(days = 30): Promise<
  ApiResponse<{
    metricsRecorded: {
      current: number;
      previous: number;
      changePercent: number;
    };
    averageMetrics: Record<string, number>;
    concernsResolved: {
      current: number;
      previous: number;
    };
  }>
> {
  return apiGet(`/dashboard/comparison?days=${days}`);
}

// ============================================================================
// Goals and Recommendations
// ============================================================================

/**
 * Get health goals status
 */
export async function getGoalsStatus(): Promise<
  ApiResponse<{
    goals: Array<{
      id: string;
      title: string;
      description: string;
      target: number;
      current: number;
      progress: number;
      dueDate: string;
      status: string;
    }>;
  }>
> {
  return apiGet('/dashboard/goals');
}

/**
 * Get personalized recommendations
 */
export async function getRecommendations(): Promise<
  ApiResponse<{
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  }>
> {
  return apiGet('/dashboard/recommendations');
}

// ============================================================================
// Alerts and Notifications
// ============================================================================

/**
 * Get unread alerts count
 */
export async function getAlertsCount(): Promise<ApiResponse<{ unread: number; total: number }>> {
  return apiGet('/dashboard/alerts/count');
}

/**
 * Get critical alerts
 */
export async function getCriticalAlerts(): Promise<
  ApiResponse<
    Array<{
      id: string;
      message: string;
      severity: string;
      relatedTo: string;
      timestamp: string;
    }>
  >
> {
  return apiGet('/dashboard/alerts/critical');
}
