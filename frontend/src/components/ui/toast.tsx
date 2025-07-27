import type { ToastData, ToastVariant } from '@/types/ui';
import { ToastComponent as ModularToastComponent } from './toast/ToastComponent';

// Re-export for backward compatibility
export type ToastType = ToastVariant;
export type Toast = ToastData;

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[60] space-y-2 sm:space-y-3 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-none">
      <div className="space-y-2 sm:space-y-3 pointer-events-auto">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
            className="toast-enter"
          >
            <ModularToastComponent toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </div>
  );
}
