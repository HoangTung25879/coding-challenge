import { StatusBadge } from '@/components/ui/StatusBadge';
import type { LeadStatus } from '@/types';

type Props = { status: LeadStatus };

export function StatusCell({ status }: Props) {
  return <StatusBadge status={status} />;
}
