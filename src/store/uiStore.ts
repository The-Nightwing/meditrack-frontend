/**
 * UI state store using Zustand
 * Manages theme, loading states, and toast notifications
 */

import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface UIState {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Global Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (toastId: string) => void;
  clearToasts: () => void;

  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Navigation
  isNavigating: boolean;
  setIsNavigating: (navigating: boolean) => void;
}

let toastIdCounter = 0;

export const useUIStore = create<UIState>((set) => ({
  // ============================================================================
  // Theme
  // ============================================================================

  theme: 'light',

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    // Could persist to storage here if needed
  },

  // ============================================================================
  // Global Loading
  // ============================================================================

  isLoading: false,

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // ============================================================================
  // Toasts
  // ============================================================================

  toasts: [],

  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${toastIdCounter++}`;
    const newToast: Toast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (toastId: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== toastId),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // ============================================================================
  // Modals
  // ============================================================================

  activeModal: null,

  openModal: (modalId: string) => {
    set({ activeModal: modalId });
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  // ============================================================================
  // Navigation
  // ============================================================================

  isNavigating: false,

  setIsNavigating: (navigating: boolean) => {
    set({ isNavigating: navigating });
  },
}));

/**
 * Convenience hook for toast notifications
 */
export const useToast = () => {
  const { addToast } = useUIStore();

  return {
    success: (message: string, duration?: number) => {
      addToast({ message, type: 'success', duration });
    },
    error: (message: string, duration?: number) => {
      addToast({ message, type: 'error', duration });
    },
    warning: (message: string, duration?: number) => {
      addToast({ message, type: 'warning', duration });
    },
    info: (message: string, duration?: number) => {
      addToast({ message, type: 'info', duration });
    },
  };
};
