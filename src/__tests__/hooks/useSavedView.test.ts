import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { useSavedView, type TableStateSnapshot } from '@/hooks/useSavedView'

const defaults: TableStateSnapshot = {
  filters: {
    search: '',
    status: '',
    source: '',
    budgetMin: undefined,
    budgetMax: undefined,
    timeline: '',
    financing: '',
    leadType: '',
  },
  sorting: [],
  columnVisibility: {},
  stickyColumns: ['fullName'],
  pageSize: 10,
}

const modified: TableStateSnapshot = {
  ...defaults,
  filters: { ...defaults.filters, status: 'qualified' },
  sorting: [{ id: 'fullName', desc: false }],
  pageSize: 25,
}

beforeEach(() => {
  localStorage.clear()
})

describe('useSavedView', () => {
  it('returns not modified when current matches defaults and no saved view', () => {
    const { result } = renderHook(() => useSavedView(defaults))
    expect(result.current.isModified).toBe(false)
    expect(result.current.hasSavedView).toBe(false)
    expect(result.current.savedSnapshot).toBeNull()
  })

  it('detects modification from defaults', () => {
    const { result } = renderHook(() => useSavedView(modified))
    expect(result.current.isModified).toBe(true)
  })

  it('save persists to localStorage', () => {
    const { result } = renderHook(() => useSavedView(modified))
    act(() => { result.current.save(modified) })
    expect(result.current.hasSavedView).toBe(true)
    expect(result.current.savedSnapshot).toEqual(modified)
    expect(localStorage.getItem('leadflow:savedView')).toBeTruthy()
  })

  it('isModified compares against saved view when one exists', () => {
    const { result, rerender } = renderHook(
      ({ state }) => useSavedView(state),
      { initialProps: { state: modified } },
    )
    act(() => { result.current.save(modified) })
    expect(result.current.isModified).toBe(false)
    rerender({ state: defaults })
    expect(result.current.isModified).toBe(true)
  })

  it('reset clears localStorage and reverts baseline to defaults', () => {
    const { result } = renderHook(() => useSavedView(modified))
    act(() => { result.current.save(modified) })
    expect(result.current.hasSavedView).toBe(true)
    act(() => { result.current.reset() })
    expect(result.current.hasSavedView).toBe(false)
    expect(result.current.savedSnapshot).toBeNull()
    expect(localStorage.getItem('leadflow:savedView')).toBeNull()
  })

  it('restores saved view from localStorage on mount', () => {
    localStorage.setItem('leadflow:savedView', JSON.stringify(modified))
    const { result } = renderHook(() => useSavedView(modified))
    expect(result.current.hasSavedView).toBe(true)
    expect(result.current.savedSnapshot).toEqual(modified)
    expect(result.current.isModified).toBe(false)
  })

  it('survives hook re-mount', () => {
    const { result, unmount } = renderHook(() => useSavedView(modified))
    act(() => { result.current.save(modified) })
    unmount()
    const { result: result2 } = renderHook(() => useSavedView(modified))
    expect(result2.current.hasSavedView).toBe(true)
    expect(result2.current.isModified).toBe(false)
  })
})
