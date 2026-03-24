import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateLead } from '@/lib/api'
import type { Lead } from '@/types'
import type { LeadsResponse } from '@/lib/api'

type UpdateLeadArgs = { id: string; patch: Partial<Lead> }

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, patch }: UpdateLeadArgs) => updateLead(id, patch),

    onMutate: async ({ id, patch }: UpdateLeadArgs) => {
      await queryClient.cancelQueries({ queryKey: ['lead', id] })
      await queryClient.cancelQueries({ queryKey: ['leads'] })

      const previousLead = queryClient.getQueryData<Lead>(['lead', id])
      const previousLeadsEntries = queryClient.getQueriesData<LeadsResponse>({ queryKey: ['leads'] })

      queryClient.setQueryData<Lead>(['lead', id], old =>
        old ? { ...old, ...patch } : old
      )

      queryClient.setQueriesData<LeadsResponse>({ queryKey: ['leads'] }, old => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map(l => (l.id === id ? { ...l, ...patch } : l)),
        }
      })

      return { previousLead, previousLeadsEntries, id }
    },

    onError: (_err, _vars, context) => {
      if (!context) return
      if (context.previousLead !== undefined) {
        queryClient.setQueryData(['lead', context.id], context.previousLead)
      }
      for (const [queryKey, data] of context.previousLeadsEntries) {
        queryClient.setQueryData(queryKey, data)
      }
    },

    onSettled: (_data, _err, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['lead', variables.id] })
      void queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
