export interface TransferProgressState {
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  progress: number;
  progressPercentage: number;
}

export interface ProgressDialogActions {
  onCancel?: () => void;
  onClose?: () => void;
}

export interface TransferJobValidated {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  eta_seconds?: number;
  error_message?: string;
}

export type TransferStatus = TransferJobValidated['status'];
