import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postActivity, type PostActivityBody } from '@/lib/api';
import type { Activity, CollectionResponse } from '@/types';

type LogActivityArgs = PostActivityBody & { leadId: string };

export function useLogActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, ...body }: LogActivityArgs) => postActivity(leadId, body),

    onMutate: async ({ leadId, ...body }: LogActivityArgs) => {
      // Cancel any in-flight refetches to prevent overwriting optimistic entry
      await queryClient.cancelQueries({ queryKey: ['activities', leadId] });

      // Snapshot the current cache
      const previous = queryClient.getQueryData<CollectionResponse<Activity>>([
        'activities',
        leadId,
      ]);

      // Optimistically append the new activity
      const optimistic: Activity = {
        id: `optimistic-${Date.now()}`,
        leadId,
        ...body,
        type: body.type as Activity['type'],
        scheduledAt: body.scheduledAt ?? null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      queryClient.setQueryData<CollectionResponse<Activity>>(['activities', leadId], (old) => ({
        data: [...(old?.data ?? []), optimistic],
      }));

      return { previous, leadId };
    },

    onError: (_err, _vars, context) => {
      // Roll back to snapshot on failure
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['activities', context.leadId], context.previous);
      }
    },

    onSuccess: () => {
      // Form reset is handled by the component observing isSuccess
    },

    onSettled: (_data, _err, variables) => {
      // Always refetch to sync confirmed server state
      void queryClient.invalidateQueries({ queryKey: ['activities', variables.leadId] });
    },
  });
}
