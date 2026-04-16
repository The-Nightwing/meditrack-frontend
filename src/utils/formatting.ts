/**
 * Formatting utilities for data display
 */

import { format, parseISO } from 'date-fns';

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format time only
 */
export function formatTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'HH:mm');
  } catch (error) {
    return 'Invalid time';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format metric value with unit
 */
export function formatValue(value: number | string, unit?: string): string {
  if (typeof value === 'string') {
    return value;
  }

  // Format number with appropriate decimal places
  let formatted: string;
  if (Number.isInteger(value)) {
    formatted = value.toString();
  } else if (Math.abs(value) < 0.1 && value !== 0) {
    // Small decimals like 0.02 — use up to 2 significant digits
    formatted = parseFloat(value.toPrecision(2)).toString();
  } else {
    formatted = value.toFixed(1);
  }

  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format change percentage with sign
 */
export function formatChangePercent(percent: number, decimals = 1): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(decimals)}%`;
}

/**
 * Get BMI from weight and height
 */
export function getBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  if (!weight || !height) return 0;
  const heightM = height / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Get age from date of birth
 */
export function getAge(dateOfBirth: string | Date): number {
  try {
    const dobObj = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - dobObj.getFullYear();
    const monthDiff = today.getMonth() - dobObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobObj.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    return 0;
  }
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format blood pressure
 */
export function formatBloodPressure(systolic: number, diastolic: number): string {
  return `${systolic}/${diastolic} mmHg`;
}

/**
 * Format temperature
 */
export function formatTemperature(celsius: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format name
 */
export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Truncate string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format metric code to display name
 */
export function formatMetricCode(code: string): string {
  return code
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
