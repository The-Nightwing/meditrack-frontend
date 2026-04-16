/**
 * TypeScript type definitions for MediTrack
 * Matches backend models and API contracts
 */

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Health Profile Types
// ============================================================================

export interface HealthProfile {
  id: string;
  userId: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: string;
  height?: number; // cm
  weight?: number; // kg
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAllergy {
  id: string;
  userId: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  createdAt: string;
}

export interface UserMedicalHistory {
  id: string;
  userId: string;
  condition: string;
  diagnosedDate?: string;
  resolvedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface UserMedication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  sideEffects?: string;
  createdAt: string;
}

// ============================================================================
// Metric Types
// ============================================================================

export type MetricStatus = 'normal' | 'warning_low' | 'warning_high' | 'critical_low' | 'critical_high';

export interface MetricDefinition {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  description?: string;
  normalRange: {
    min: number;
    max: number;
  };
  warningRange?: {
    low: number;
    high: number;
  };
  criticalRange?: {
    low: number;
    high: number;
  };
  icon?: string;
  color?: string;
  measurementType: 'numeric' | 'text' | 'boolean';
  createdAt: string;
}

export interface MetricValue {
  id: string;
  userId: string;
  metricCode: string;
  value: number | string;
  unit: string;
  recordedAt: string;
  source?: 'manual' | 'device' | 'report' | 'ai';
  notes?: string;
  status: MetricStatus;
  createdAt: string;
}

export interface MetricHistory {
  metricCode: string;
  values: MetricValue[];
}

export interface MetricTrend {
  metricCode: string;
  metricName: string;
  currentValue: number;
  previousValue?: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  status: MetricStatus;
  unit: string;
  recordedAt: string;
}

// ============================================================================
// Report Types
// ============================================================================

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ReportFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ExtractedMetric {
  metricCode: string;
  value: number | string;
  confidence: number; // 0-100
  notes?: string;
}

export interface HealthReport {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  reportType: string;
  sourceType?: string;
  labName?: string;
  doctorName?: string;
  file?: ReportFile;
  filePath?: string;
  fileName?: string;
  extractionStatus: string;
  extractionConfidence?: number | string | null;
  extractionError?: string;
  extractedMetricsCount?: number;
  extractedMetrics: ExtractedMetric[];
  confirmedMetrics?: ExtractedMetric[];
  notes?: string;
  reportDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Health Concern Types
// ============================================================================

export interface ConcernSummary {
  id: string;
  userId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'monitoring' | 'resolved';
  detectionMethod: 'ai' | 'user' | 'threshold';
  relatedMetrics: string[]; // metric codes
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthConcern {
  id: string;
  userId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'monitoring' | 'resolved';
  detectionMethod: 'ai' | 'user' | 'threshold';
  relatedMetrics: {
    metricCode: string;
    value: number;
    unit: string;
  }[];
  recommendations?: string[];
  aiAnalysis?: string;
  aiExplanation?: string;
  aiNextStep?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonReport {
  metricCode: string;
  metricName: string;
  currentValue: number;
  previousValue: number;
  normalRange: {
    min: number;
    max: number;
  };
  changePercent: number;
  unit: string;
  status: MetricStatus;
  timestamp: string;
}

// ============================================================================
// Mitigation Plan Types
// ============================================================================

export interface MitigationPlanStep {
  id: string;
  order: number;
  title: string;
  description: string;
  expectedOutcome?: string;
  completedAt?: string;
  notes?: string;
}

export interface MitigationPlan {
  id: string;
  userId: string;
  healthConcernId?: string;
  concernId?: string;
  metricDefinitionId?: string;
  planType?: string;
  title: string;
  summary?: string;
  description?: string;
  detailedPlan?: string;
  recommendations?: any;
  dietarySuggestions?: string[] | any;
  exerciseSuggestions?: string[] | any;
  requiresDoctor?: boolean;
  doctorSpecialty?: string;
  goalMetrics?: string[];
  steps: MitigationPlanStep[];
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  priority?: 'low' | 'medium' | 'high' | 'LOW' | 'MEDIUM' | 'HIGH';
  startDate?: string;
  targetDate?: string;
  aiGenerated?: boolean;
  generatedByAI?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface TimelineItem {
  id: string;
  type: 'metric_recorded' | 'concern_detected' | 'plan_created' | 'report_uploaded';
  title: string;
  description?: string;
  icon?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  relatedId?: string;
}

export interface DashboardSummary {
  totalMetricsRecorded: number;
  activeConcerns: number;
  criticalConcerns: number;
  activePlans: number;
  recentMetrics: MetricTrend[];
  topConcerns: ConcernSummary[];
  timeline: TimelineItem[];
  lastSyncAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedResponse<T>> {}

// ============================================================================
// Common Types
// ============================================================================

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
