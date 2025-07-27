export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  type: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastAction {
  type: ToastVariant;
  title: string;
  description?: string;
}

export interface ToastState {
  toasts: ToastData[];
}

export interface ToastActions {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

export type ToastHook = ToastState & ToastActions;
