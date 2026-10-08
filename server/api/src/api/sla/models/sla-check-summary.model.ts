import { SlaTier } from '@/src/api/sla/sla.constants';

export interface SlaCheckSummary {
  skipped: boolean;
  retried?: { attempted: number; sent: number; failed: number };
  tier?: SlaTier;
  candidates?: number;
  claimed?: number;
  notifications?: { created: number; sent: number; pending: number };
  digest?: boolean;
  duration_ms?: number;
}
