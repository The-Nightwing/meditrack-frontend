/**
 * App-wide constants
 */

export const APP_NAME = 'MediTrack';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const API_TIMEOUT = 30000; // 30 seconds

// Storage Keys
export const STORAGE_KEYS = {
  TOKENS: 'meditrack_tokens',
  USER: 'meditrack_user',
  PROFILE: 'meditrack_profile',
  THEME: 'meditrack_theme',
  ONBOARDING_COMPLETED: 'meditrack_onboarding_completed',
} as const;

// Metric Categories (Display names)
export const METRIC_CATEGORIES = {
  cardiovascular: 'Cardiovascular',
  respiratory: 'Respiratory',
  endocrine: 'Endocrine',
  gastrointestinal: 'Gastrointestinal',
  hematologic: 'Hematologic',
  immunologic: 'Immunologic',
  neurologic: 'Neurologic',
  psychiatric: 'Psychiatric',
  vital_signs: 'Vital Signs',
  body_measurements: 'Body Measurements',
  laboratory: 'Laboratory',
  other: 'Other',
} as const;

// Common metric codes
export const METRIC_CODES = {
  // Vital Signs
  BLOOD_PRESSURE_SYSTOLIC: 'bp_systolic',
  BLOOD_PRESSURE_DIASTOLIC: 'bp_diastolic',
  HEART_RATE: 'heart_rate',
  TEMPERATURE: 'temperature',
  RESPIRATORY_RATE: 'respiratory_rate',
  OXYGEN_SATURATION: 'spo2',

  // Body Measurements
  HEIGHT: 'height',
  WEIGHT: 'weight',
  BMI: 'bmi',
  WAIST_CIRCUMFERENCE: 'waist_circumference',

  // Cardiovascular
  CHOLESTEROL_TOTAL: 'cholesterol_total',
  CHOLESTEROL_LDL: 'cholesterol_ldl',
  CHOLESTEROL_HDL: 'cholesterol_hdl',
  TRIGLYCERIDES: 'triglycerides',

  // Endocrine
  BLOOD_GLUCOSE: 'blood_glucose',
  HBA1C: 'hba1c',

  // Hematologic
  HEMOGLOBIN: 'hemoglobin',
  HEMATOCRIT: 'hematocrit',
  WBC: 'wbc',
  PLATELET_COUNT: 'platelet_count',

  // Renal
  CREATININE: 'creatinine',
  BUN: 'bun',
  SODIUM: 'sodium',
  POTASSIUM: 'potassium',

  // Hepatic
  ALT: 'alt',
  AST: 'ast',
  BILIRUBIN: 'bilirubin',
  ALBUMIN: 'albumin',
} as const;

// Time ranges for queries
export const TIME_RANGES = {
  '1D': '1_day',
  '7D': '7_days',
  '30D': '30_days',
  '90D': '90_days',
  '1Y': '1_year',
  'ALL': 'all',
} as const;

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Status values
export const STATUS_VALUES = {
  NORMAL: 'normal',
  WARNING_LOW: 'warning_low',
  WARNING_HIGH: 'warning_high',
  CRITICAL_LOW: 'critical_low',
  CRITICAL_HIGH: 'critical_high',
} as const;

// Plan priorities
export const PLAN_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Plan statuses
export const PLAN_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

// Concern statuses
export const CONCERN_STATUSES = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  MONITORING: 'monitoring',
  RESOLVED: 'resolved',
} as const;

// Report types
export const REPORT_TYPES = {
  MEDICAL_REPORT: 'medical_report',
  LAB_RESULT: 'lab_result',
  IMAGING: 'imaging',
  PRESCRIPTION: 'prescription',
  OTHER: 'other',
} as const;

// Max file sizes (in bytes)
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5 MB
  PDF: 10 * 1024 * 1024, // 10 MB
  DOCUMENT: 10 * 1024 * 1024, // 10 MB
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Debounce delays (in ms)
export const DEBOUNCE_DELAYS = {
  SHORT: 300,
  MEDIUM: 500,
  LONG: 1000,
} as const;

// Toast durations (in ms)
export const TOAST_DURATIONS = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;

// Chart colors
export const CHART_COLORS = {
  primary: '#2563EB',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  critical: '#7C3AED',
  info: '#0EA5E9',
} as const;
