import { useState, useRef, useEffect } from 'react';
import type { ToastData, ToastHook } from '@/types/ui';

export function useToast(): ToastHook {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  const addToast = (toast: Omit<ToastData, 'id'>): void => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);

    if (toast.duration !== 0) {
      const timeout = setTimeout(() => {
        removeToast(id);
      }, toast.duration ?? 5000);
      timeoutsRef.current.set(id, timeout);
    }
  };

  const removeToast = (id: string): void => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, description?: string): void => {
    addToast({
      type: 'success',
      title,
      description,
    });
  };

  const error = (title: string, description?: string): void => {
    addToast({
      type: 'error',
      title,
      description,
    });
  };

  const info = (title: string, description?: string): void => {
    addToast({
      type: 'info',
      title,
      description,
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  };
}
