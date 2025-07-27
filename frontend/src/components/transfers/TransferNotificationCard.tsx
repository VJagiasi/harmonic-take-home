import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TransferJob } from '@/lib/types';

interface TransferNotificationProps {
  job: TransferJob;
  onDismiss: () => void;
  onCancel?: () => void;
}

export function TransferNotificationCard({
  job,
  onDismiss,
  onCancel,
}: TransferNotificationProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="h-5 w-5 text-blue-600" />
          </motion.div>
        );
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'border-emerald-200 bg-emerald-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getProgressColor = () => {
    switch (job.status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      className={`
        relative overflow-hidden rounded-xl border-2 shadow-lg backdrop-blur-sm
        ${getStatusColor()}
        max-w-sm w-full
      `}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          background: [
            'linear-gradient(45deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
            'linear-gradient(45deg, transparent 25%, rgba(59, 130, 246, 0.1) 75%, transparent 100%)',
            'linear-gradient(45deg, transparent 50%, rgba(59, 130, 246, 0.1) 100%, transparent 125%)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {job.status === 'completed'
                  ? 'Transfer Complete'
                  : job.status === 'failed'
                    ? 'Transfer Failed'
                    : 'Transferring'}
              </h4>
              <p className="text-xs text-gray-600">{job.total} companies</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Transfer details */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
          <span className="font-medium truncate max-w-[100px]">
            Collection Transfer
          </span>
          <ArrowRight className="h-3 w-3 text-gray-400" />
          <span className="font-medium truncate max-w-[100px]">
            In Progress
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">
              {job.progress} of {job.total}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {Math.round((job.progress / job.total) * 100)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getProgressColor()}`}
              initial={{ width: 0 }}
              animate={{
                width: `${(job.progress / job.total) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Status message */}
        {job.status === 'processing' && (
          <motion.p
            className="text-xs text-gray-600 mb-3"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Processing transfer...
          </motion.p>
        )}

        {job.status === 'completed' && (
          <motion.p
            className="text-xs text-emerald-700 mb-3 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Successfully transferred {job.total} companies
          </motion.p>
        )}

        {job.status === 'failed' && (
          <p className="text-xs text-red-700 mb-3">
            Transfer failed. Please try again.
          </p>
        )}

        {/* Action buttons */}
        {job.status === 'processing' && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="w-full text-xs h-7 border-gray-300 hover:bg-gray-100"
          >
            Cancel Transfer
          </Button>
        )}
      </div>
    </motion.div>
  );
}

interface TransferNotificationsProps {
  jobs: TransferJob[];
  onDismiss: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

export function TransferNotifications({
  jobs,
  onDismiss,
  onCancel,
}: TransferNotificationsProps) {
  return (
    <div className="fixed top-20 right-6 z-40 space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {jobs.map(job => (
          <TransferNotificationCard
            key={job.job_id}
            job={job}
            onDismiss={() => onDismiss(job.job_id)}
            onCancel={onCancel ? () => onCancel(job.job_id) : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
