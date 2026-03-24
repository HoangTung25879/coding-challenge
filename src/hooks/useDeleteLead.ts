import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLead } from '@/lib/api';

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
