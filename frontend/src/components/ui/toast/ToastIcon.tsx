import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { ToastVariant } from '@/types/ui';

interface ToastIconProps {
  type: ToastVariant;
}

export function ToastIcon({ type }: ToastIconProps) {
  const iconMap = {
    success: {
      icon: CheckCircle,
      className:
        'flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center',
      iconClassName: 'h-5 w-5 text-emerald-600',
    },
    error: {
      icon: XCircle,
      className:
        'flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center',
      iconClassName: 'h-5 w-5 text-red-600',
    },
    info: {
      icon: AlertCircle,
      className:
        'flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center',
      iconClassName: 'h-5 w-5 text-blue-600',
    },
  } as const;

  const { icon: Icon, className, iconClassName } = iconMap[type];

  return (
    <div className={className}>
      <Icon className={iconClassName} />
    </div>
  );
}
