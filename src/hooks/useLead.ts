import { useQuery } from '@tanstack/react-query';
import { fetchLead } from '@/lib/api';

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id),
    enabled: !!id,
  });
}
