import { ExecutiveReport } from './leadership';

export interface BatchParticipantItem {
  id: string;
  fileName: string;
  imageSrc: string;
  base64: string;
  mimeType: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  errorMessage?: string;
  report: ExecutiveReport;
  createdAt: number;
}

export interface BatchProcessingState {
  isProcessing: boolean;
  currentIndex: number;
  totalCount: number;
  currentStepMessage: string;
}
