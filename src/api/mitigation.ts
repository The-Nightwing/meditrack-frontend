/**
 * Mitigation plans API functions - Creating and managing health improvement plans
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { MitigationPlan, MitigationPlanStep, ApiResponse, PaginatedApiResponse } from '@/types';

// ============================================================================
// Plan Management
// ============================================================================

/**
 * Get all mitigation plans
 */
export async function getPlans(options?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}): Promise<PaginatedApiResponse<MitigationPlan>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.status) params.append('status', options.status);
  if (options?.priority) params.append('priority', options.priority);

  return apiGet(`/mitigation-plans?${params.toString()}`);
}

/**
 * Get active plans only
 */
export async function getActivePlans(): Promise<ApiResponse<MitigationPlan[]>> {
  return apiGet('/mitigation-plans?status=active');
}

/**
 * Get single plan by ID
 */
export async function getPlanById(planId: string): Promise<ApiResponse<MitigationPlan>> {
  return apiGet(`/mitigation-plans/${planId}`);
}

/**
 * Get plans for a specific concern
 */
export async function getPlansByConcern(concernId: string): Promise<ApiResponse<MitigationPlan[]>> {
  return apiGet(`/mitigation-plans?concernId=${concernId}`);
}

// ============================================================================
// Plan Creation and Modification
// ============================================================================

/**
 * Create a new mitigation plan
 */
export async function createPlan(data: {
  concernId: string;
  title: string;
  description: string;
  goalMetrics: string[];
  steps: Array<{
    order: number;
    title: string;
    description: string;
    expectedOutcome?: string;
  }>;
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  targetDate?: string;
}): Promise<ApiResponse<MitigationPlan>> {
  return apiPost('/mitigation-plans', data);
}

/**
 * Update a mitigation plan
 */
export async function updatePlan(planId: string, data: Partial<MitigationPlan>): Promise<ApiResponse<MitigationPlan>> {
  return apiPut(`/mitigation-plans/${planId}`, data);
}

/**
 * Delete a mitigation plan
 */
export async function deletePlan(planId: string): Promise<ApiResponse<null>> {
  return apiDelete(`/mitigation-plans/${planId}`);
}

/**
 * Activate a plan
 */
export async function activatePlan(planId: string): Promise<ApiResponse<MitigationPlan>> {
  return apiPut(`/mitigation-plans/${planId}`, { status: 'active' });
}

/**
 * Pause a plan
 */
export async function pausePlan(planId: string): Promise<ApiResponse<MitigationPlan>> {
  return apiPut(`/mitigation-plans/${planId}`, { status: 'paused' });
}

/**
 * Complete a plan
 */
export async function completePlan(planId: string): Promise<ApiResponse<MitigationPlan>> {
  return apiPut(`/mitigation-plans/${planId}`, { status: 'completed' });
}

// ============================================================================
// Plan Steps
// ============================================================================

/**
 * Update a plan step
 */
export async function updatePlanStep(
  planId: string,
  stepId: string,
  data: Partial<MitigationPlanStep>
): Promise<ApiResponse<MitigationPlan>> {
  return apiPut(`/mitigation-plans/${planId}/steps/${stepId}`, data);
}

/**
 * Mark step as completed (uses stepNumber, not stepId)
 */
export async function completePlanStep(planId: string, stepNumber: number): Promise<ApiResponse<MitigationPlan>> {
  return apiPut(`/mitigation-plans/${planId}/steps/${stepNumber}`, { isCompleted: true });
}

/**
 * Uncomplete a step
 */
export async function uncompletePlanStep(planId: string, stepNumber: number): Promise<ApiResponse<MitigationPlan>> {
  return apiPut(`/mitigation-plans/${planId}/steps/${stepNumber}`, { isCompleted: false });
}

/**
 * Add notes to a step (uses stepNumber)
 */
export async function addStepNotes(
  planId: string,
  stepNumber: number,
  notes: string
): Promise<ApiResponse<MitigationPlan>> {
  return apiPut(`/mitigation-plans/${planId}/steps/${stepNumber}`, { notes });
}

// ============================================================================
// AI-Generated Plans
// ============================================================================

/**
 * Generate an AI-powered mitigation plan
 * Backend requires: concernId + metricCode
 */
export async function generateAIPlan(data: {
  concernId: string;
  metricCode: string;
}): Promise<ApiResponse<MitigationPlan>> {
  return apiPost('/mitigation-plans/generate-ai', data);
}

/**
 * Get AI suggestions for plan optimization
 */
export async function getAISuggestions(planId: string): Promise<ApiResponse<{ suggestions: string[] }>> {
  return apiGet(`/mitigation-plans/${planId}/ai-suggestions`);
}

/**
 * Refine AI plan with feedback
 */
export async function refineAIPlan(
  planId: string,
  feedback: {
    satisfied?: boolean;
    feedback?: string;
    adjustments?: string[];
  }
): Promise<ApiResponse<MitigationPlan>> {
  return apiPost(`/mitigation-plans/${planId}/refine-ai`, feedback);
}

// ============================================================================
// Plan Progress
// ============================================================================

/**
 * Get plan progress report
 */
export async function getPlanProgress(planId: string): Promise<
  ApiResponse<{
    totalSteps: number;
    completedSteps: number;
    progressPercent: number;
    estimatedCompletion?: string;
    metrics: {
      code: string;
      name: string;
      goalValue?: number;
      currentValue: number;
      progress: number;
    }[];
  }>
> {
  return apiGet(`/mitigation-plans/${planId}/progress`);
}

/**
 * Get plan effectiveness report
 */
export async function getPlanEffectiveness(planId: string): Promise<
  ApiResponse<{
    effectiveness: number; // 0-100
    metricsImproved: number;
    metricsWorsened: number;
    recommendation: string;
  }>
> {
  return apiGet(`/mitigation-plans/${planId}/effectiveness`);
}

// ============================================================================
// Plan Templates
// ============================================================================

/**
 * Get available plan templates
 */
export async function getPlanTemplates(): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      description: string;
      targetMetrics: string[];
      steps: Array<{ title: string; description: string }>;
    }>
  >
> {
  return apiGet('/mitigation-plans/templates');
}

/**
 * Create plan from template
 */
export async function createPlanFromTemplate(
  templateId: string,
  data: { concernId: string; customizations?: Record<string, any> }
): Promise<ApiResponse<MitigationPlan>> {
  return apiPost(`/mitigation-plans/from-template/${templateId}`, data);
}
