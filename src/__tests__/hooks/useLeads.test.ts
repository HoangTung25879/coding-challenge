import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/mocks/node';
import { useLeads } from '@/hooks/useLeads';
import { createWrapper } from './test-utils';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useLeads', () => {
  it('fetches lead summaries successfully', async () => {
    const { result } = renderHook(() => useLeads({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(Array.isArray(result.current.data?.data)).toBe(true);
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('returns isLoading true initially', () => {
    const { result } = renderHook(() => useLeads({}), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });
});
