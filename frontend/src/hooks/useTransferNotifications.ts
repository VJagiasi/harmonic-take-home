import { useState, useCallback, useEffect } from 'react';
import type { TransferJob } from '@/lib/types';

interface TransferNotificationState extends TransferJob {
  timestamp: number;
  dismissed: boolean;
}

export function useTransferNotifications() {
  const [notifications, setNotifications] = useState<
    TransferNotificationState[]
  >([]);

  // Add a new transfer notification
  const addNotification = useCallback((job: TransferJob) => {
    setNotifications(prev => {
      // Check if notification already exists
      const existingIndex = prev.findIndex(n => n.job_id === job.job_id);

      if (existingIndex >= 0) {
        // Update existing notification
        const updated = [...prev];
        updated[existingIndex] = {
          ...job,
          timestamp: prev[existingIndex].timestamp,
          dismissed: false,
        };
        return updated;
      } else {
        // Add new notification
        return [
          ...prev,
          {
            ...job,
            timestamp: Date.now(),
            dismissed: false,
          },
        ];
      }
    });
  }, []);

  // Dismiss a notification
  const dismissNotification = useCallback((jobId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.job_id === jobId ? { ...n, dismissed: true } : n))
    );

    // Remove after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.job_id !== jobId));
    }, 300);
  }, []);

  // Auto-dismiss completed jobs after delay
  useEffect(() => {
    const completedJobs = notifications.filter(
      n => (n.status === 'completed' || n.status === 'failed') && !n.dismissed
    );

    completedJobs.forEach(job => {
      const timeoutId = setTimeout(() => {
        dismissNotification(job.job_id);
      }, 5000); // Auto-dismiss after 5 seconds

      return () => clearTimeout(timeoutId);
    });
  }, [notifications, dismissNotification]);

  // Get visible notifications
  const visibleNotifications = notifications.filter(n => !n.dismissed);

  return {
    notifications: visibleNotifications,
    addNotification,
    dismissNotification,
  };
}
