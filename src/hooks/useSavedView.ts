import { useState, useCallback, useMemo } from 'react';
import { isEqual } from 'lodash-es';
import type { SortingState, VisibilityState } from '@tanstack/react-table';
import type { FilterState } from './useDataTable';

export type TableStateSnapshot = {
  filters: FilterState;
  sorting: SortingState;
  columnVisibility: VisibilityState;
  stickyColumns: string[];
  pageSize: number;
};

const STORAGE_KEY = 'leadflow:savedView';

const DEFAULT_SNAPSHOT: TableStateSnapshot = {
  filters: {
    search: '',
    source: '',
    budgetMin: undefined,
    budgetMax: undefined,
    currency: '',
    timeline: '',
    financing: '',
    leadType: '',
    status: '',
  },
  sorting: [],
  columnVisibility: {},
  stickyColumns: ['actions'],
  pageSize: 10,
};

function normalizeSnapshot(snapshot: TableStateSnapshot): TableStateSnapshot {
  return {
    ...snapshot,
    filters: {
      search: snapshot.filters.search ?? '',
      source: snapshot.filters.source ?? '',
      budgetMin: snapshot.filters.budgetMin ?? undefined,
      budgetMax: snapshot.filters.budgetMax ?? undefined,
      currency: snapshot.filters.currency ?? '',
      timeline: snapshot.filters.timeline ?? '',
      financing: snapshot.filters.financing ?? '',
      leadType: snapshot.filters.leadType ?? '',
      status: snapshot.filters.status ?? '',
    },
  };
}

function readSaved(): TableStateSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeSnapshot(JSON.parse(raw) as TableStateSnapshot) : null;
  } catch {
    return null;
  }
}

function writeSaved(snapshot: TableStateSnapshot) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function clearSaved() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useSavedView(currentState: TableStateSnapshot) {
  const [savedSnapshot, setSavedSnapshot] = useState<TableStateSnapshot | null>(readSaved);

  const hasSavedView = savedSnapshot !== null;
  const baseline = savedSnapshot ?? DEFAULT_SNAPSHOT;

  const isModified = useMemo(() => !isEqual(currentState, baseline), [currentState, baseline]);

  const save = useCallback((state: TableStateSnapshot) => {
    writeSaved(state);
    setSavedSnapshot(state);
  }, []);

  const reset = useCallback(() => {
    clearSaved();
    setSavedSnapshot(null);
  }, []);

  return {
    savedSnapshot,
    isModified,
    hasSavedView,
    save,
    reset,
    defaults: DEFAULT_SNAPSHOT,
  };
}
