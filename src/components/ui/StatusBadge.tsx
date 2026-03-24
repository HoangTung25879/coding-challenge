import type { LeadStatus } from '@/types';
import { Badge, type BadgeVariant } from './Badge';

const STATUS_CONFIG: Record<LeadStatus, { label: string; variant: BadgeVariant }> = {
  new: { label: 'New', variant: 'blue' },
  contacted: { label: 'Contacted', variant: 'yellow' },
  qualified: { label: 'Qualified', variant: 'purple' },
  unqualified: { label: 'Unqualified', variant: 'red' },
};

type Props = { status: LeadStatus };

export function StatusBadge({ status }: Props) {
  const { label, variant } = STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
