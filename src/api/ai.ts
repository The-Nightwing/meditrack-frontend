/**
 * AI-powered analytics API functions
 */

import { apiGet, apiPost } from './client';
import { ApiResponse } from '@/types';

// ============================================================================
// Health Insights
// ============================================================================

/**
 * Generate AI health insights for a concern
 */
export async function generateInsights(concernId: string): Promise<
  ApiResponse<{ insights: string; riskLevel?: string; recommendedActions?: string[] }>
> {
  return apiPost('/ai/generate-insights', { concernId });
}

/**
 * Generate AI mitigation plan for a concern
 */
export async function generateMitigation(concernId: string, metricCode: string): Promise<
  ApiResponse<{ id: string; title: string; summary?: string; steps?: any[] }>
> {
  return apiPost('/ai/generate-mitigation', { concernId, metricCode });
}

/**
 * Get insights for a specific metric
 */
export async function getMetricInsights(metricCode: string): Promise<
  ApiResponse<{
    analysis: string;
    trends: string;
    recommendations: string[];
  }>
> {
  return apiGet(`/ai/insights/metric/${metricCode}`);
}

/**
 * Get personalized health summary
 */
export async function getHealthSummary(): Promise<
  ApiResponse<{
    summary: string;
    keyPoints: string[];
    needsAttention: string[];
  }>
> {
  return apiGet('/ai/health-summary');
}

// ============================================================================
// Mitigation Plans
// ============================================================================

/**
 * Get AI suggestions for an existing plan
 */
export async function getPlanSuggestions(planId: string): Promise<
  ApiResponse<{
    suggestions: string[];
    improvementAreas: string[];
  }>
> {
  return apiGet(`/ai/plan-suggestions/${planId}`);
}

// ============================================================================
// Trend Analysis
// ============================================================================

/**
 * Analyze metric trends
 */
export async function analyzeTrends(options?: {
  days?: number;
  metrics?: string[];
}): Promise<
  ApiResponse<{
    trends: Array<{
      metricCode: string;
      trend: 'improving' | 'declining' | 'stable';
      confidence: number;
      analysis: string;
    }>;
  }>
> {
  const params = new URLSearchParams();
  if (options?.days) params.append('days', options.days.toString());
  if (options?.metrics) params.append('metrics', options.metrics.join(','));

  return apiPost(`/ai/analyze-trends?${params.toString()}`, {});
}

/**
 * Get predictive analysis
 */
export async function getPredictiveAnalysis(): Promise<
  ApiResponse<{
    predictions: Array<{
      metricCode: string;
      predictedValue: number;
      confidenceLevel: number;
      timeframe: string;
      risk: 'low' | 'medium' | 'high' | 'critical';
    }>;
  }>
> {
  return apiPost('/ai/predictive-analysis', {});
}

// ============================================================================
// Lifestyle Recommendations
// ============================================================================

/**
 * Get personalized lifestyle recommendations
 */
export async function getLifestyleRecommendations(): Promise<
  ApiResponse<{
    diet: string[];
    exercise: string[];
    sleep: string[];
    stress: string[];
    other: string[];
  }>
> {
  return apiPost('/ai/lifestyle-recommendations', {});
}

/**
 * Get medication interactions analysis
 */
export async function analyzeMedicationInteractions(): Promise<
  ApiResponse<{
    interactions: Array<{
      medication1: string;
      medication2: string;
      severity: 'low' | 'moderate' | 'high';
      description: string;
      recommendation: string;
    }>;
  }>
> {
  return apiGet('/ai/medication-interactions');
}

// ============================================================================
// Comparison and Benchmarking
// ============================================================================

/**
 * Compare metrics against health benchmarks
 */
export async function compareBenchmarks(): Promise<
  ApiResponse<{
    comparisons: Array<{
      metricCode: string;
      yourValue: number;
      benchmarkValue: number;
      percentile: number;
      status: string;
    }>;
  }>
> {
  return apiPost('/ai/compare-benchmarks', {});
}

/**
 * Get health score
 */
export async function getHealthScore(): Promise<
  ApiResponse<{
    overallScore: number; // 0-100
    categoryScores: {
      [key: string]: number;
    };
    trends: {
      [key: string]: 'improving' | 'declining' | 'stable';
    };
  }>
> {
  return apiGet('/ai/health-score');
}

// ============================================================================
// AI Usage and Credits
// ============================================================================

/**
 * Get current AI usage and quota
 */
export async function getAiUsage(): Promise<
  ApiResponse<{
    creditsUsed: number;
    creditsAvailable: number;
    resetDate: string;
    features: {
      insights: { used: number; limit: number };
      planGeneration: { used: number; limit: number };
      analysis: { used: number; limit: number };
    };
  }>
> {
  return apiGet('/ai/usage');
}

/**
 * Get AI feature status
 */
export async function getAiFeatureStatus(): Promise<
  ApiResponse<{
    insightsEnabled: boolean;
    planGenerationEnabled: boolean;
    trendsAnalysisEnabled: boolean;
    predictiveAnalysisEnabled: boolean;
  }>
> {
  return apiGet('/ai/feature-status');
}

// ============================================================================
// Report Analysis
// ============================================================================

/**
 * Analyze uploaded report with AI
 */
export async function analyzeReport(reportId: string): Promise<
  ApiResponse<{
    analysis: string;
    keyFindings: string[];
    recommendations: string[];
    relatedConcerns: string[];
  }>
> {
  return apiPost(`/ai/analyze-report/${reportId}`, {});
}

/**
 * Extract insights from multiple reports
 */
export async function compareReports(reportIds: string[]): Promise<
  ApiResponse<{
    comparison: string;
    improvements: string[];
    concerns: string[];
    trends: string[];
  }>
> {
  return apiPost('/ai/compare-reports', { reportIds });
}
