import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/mocks/node';
import { useLead } from '@/hooks/useLead';
import { leadsStore } from '@/mocks/data/leads';
import { createWrapper } from './test-utils';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useLead', () => {
  it('fetches full lead by id', async () => {
    const id = leadsStore[0].id;
    const { result } = renderHook(() => useLead(id), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(id);
    expect(result.current.data?.vehiclesOfInterest).toBeDefined();
  });

  it('sets isError on 404', async () => {
    const { result } = renderHook(() => useLead('does-not-exist'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
