import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLead, type CreateLeadBody } from '@/lib/api'

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateLeadBody) => createLead(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
