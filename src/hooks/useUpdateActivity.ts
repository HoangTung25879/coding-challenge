import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateActivity } from '@/lib/api'
import type { Activity, CollectionResponse } from '@/types'

type UpdateActivityArgs = { activityId: string; patch: Partial<Activity> }

export function useUpdateActivity(leadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ activityId, patch }: UpdateActivityArgs) =>
      updateActivity(leadId, activityId, patch),

    onMutate: async ({ activityId, patch }) => {
      await queryClient.cancelQueries({ queryKey: ['activities', leadId] })
      const previous = queryClient.getQueryData<CollectionResponse<Activity>>(['activities', leadId])

      queryClient.setQueryData<CollectionResponse<Activity>>(['activities', leadId], old => ({
        data: (old?.data ?? []).map(a => a.id === activityId ? { ...a, ...patch } : a),
      }))

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['activities', leadId], context.previous)
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['activities', leadId] })
    },
  })
}
