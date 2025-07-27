export type CompanyStatus = 'new' | 'liked' | 'ignore';

export interface Company {
  id: number;
  company_name: string;
  liked: boolean; // Keep for backward compatibility
  status?: CompanyStatus; // New status field
}

export interface Collection {
  id: string;
  collection_name: string;
  companies?: Company[];
  total?: number;
}

// Strict union types for better type safety
export type TransferJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';
export type TransferResponseStatus = TransferJobStatus | 'success';

export interface TransferJob {
  job_id: string;
  status: TransferJobStatus;
  progress: number;
  total: number;
  eta_seconds?: number;
  error_message?: string;
}

export interface TransferRequest {
  company_ids: number[];
  dest_collection_id: string;
  transfer_all?: boolean;
}

export interface TransferResponse {
  job_id?: string;
  status: TransferResponseStatus;
  message: string;
}

// Enhanced progress metrics for better component props
export interface ProgressMetrics {
  percentage: number;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  estimatedMinutesRemaining: number | null;
}

// Enhanced dialog props with better typing
export interface TransferDialogProps {
  job: TransferJob | null;
  onCancel?: () => void;
  onClose?: () => void;
}

// Helper function to map collection names to status
export function getStatusFromCollectionName(
  collectionName: string
): CompanyStatus {
  if (!collectionName) return 'new';

  const name = collectionName.toLowerCase();
  if (
    name.includes('liked') ||
    name.includes('favorite') ||
    name.includes('qualified')
  ) {
    return 'liked';
  }
  if (
    name.includes('ignore') ||
    name.includes('reject') ||
    name.includes('skip')
  ) {
    return 'ignore';
  }
  return 'new';
}

// Helper function to get action text based on destination status
export function getActionText(status: CompanyStatus): {
  action: string;
  verb: string;
} {
  switch (status) {
    case 'liked':
      return { action: 'Mark as Liked', verb: 'marked as Liked' };
    case 'ignore':
      return { action: 'Mark as Ignore', verb: 'moved to Ignore list' };
    case 'new':
      return { action: 'Mark as New', verb: 'marked as New' };
    default:
      return { action: 'Move', verb: 'moved' };
  }
}
