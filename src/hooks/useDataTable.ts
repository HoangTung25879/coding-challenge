import { useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type Table,
} from "@tanstack/react-table";
import type { Lead, PaginationMeta } from "@/types";
import type { LeadsParams } from "@/lib/api";

export type FilterState = {
  search: string;
  source: string;
  budgetMin: number | undefined;
  budgetMax: number | undefined;
  currency: string;
  timeline: string;
  financing: string;
  leadType: string;
  status: string;
};

const INITIAL_FILTERS: FilterState = {
  search: "",
  source: "",
  budgetMin: undefined,
  budgetMax: undefined,
  currency: "",
  timeline: "",
  financing: "",
  leadType: "",
  status: "",
};

type UseDataTableInput = {
  columns: ColumnDef<Lead, unknown>[];
  data: Lead[];
  pagination: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onStateChange: (params: LeadsParams) => void;
  initialColumnVisibility?: VisibilityState;
};

export type UseDataTableReturn = {
  table: Table<Lead>;
  filters: FilterState;
  setFilter: (key: string, value: unknown) => void;
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  pageIndex: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (state: VisibilityState) => void;
  stickyColumns: string[];
  setStickyColumns: (columnIds: string[]) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export function useDataTable({
  columns,
  data,
  pagination,
  isLoading,
  isError,
  error,
  onStateChange,
  initialColumnVisibility = {},
}: UseDataTableInput): UseDataTableReturn {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSizeState] = useState(pagination.limit || 10);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  );
  const [stickyColumns, setStickyColumns] = useState<string[]>(["actions"]);

  const buildParams = useCallback(
    (
      f: FilterState,
      s: SortingState,
      pSize: number,
      page?: number
    ): LeadsParams => {
      const params: LeadsParams = { page: page ?? 1, limit: pSize };
      if (f.search) params.search = f.search;
      if (f.source) params.source = f.source;
      if (f.budgetMin != null) params.budgetMin = f.budgetMin;
      if (f.budgetMax != null) params.budgetMax = f.budgetMax;
      if (f.currency) params.currency = f.currency;
      if (f.timeline) params.timeline = f.timeline;
      if (f.financing) params.financing = f.financing;
      if (f.leadType) params.leadType = f.leadType;
      if (s.length > 0) {
        params.sort = s[0].id;
        params.order = s[0].desc ? "desc" : "asc";
      }
      return params;
    },
    []
  );

  const setFilter = useCallback(
    (key: string, value: unknown) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        onStateChange(buildParams(next, sorting, pageSize));
        return next;
      });
    },
    [sorting, pageSize, onStateChange, buildParams]
  );

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    onStateChange(buildParams(INITIAL_FILTERS, sorting, pageSize));
  }, [sorting, pageSize, onStateChange, buildParams]);

  const handleSortingChange = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      setSorting((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        onStateChange(buildParams(filters, next, pageSize));
        return next;
      });
    },
    [filters, pageSize, onStateChange, buildParams]
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      onStateChange(buildParams(filters, sorting, size));
    },
    [filters, sorting, onStateChange, buildParams]
  );

  const pageCount = useMemo(
    () => pagination.totalPages || Math.ceil(pagination.total / pageSize),
    [pagination, pageSize]
  );

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: (pagination.page || 1) - 1,
        pageSize,
      },
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    columnResizeMode: "onChange",
  });

  return {
    table,
    filters,
    setFilter,
    setFilters,
    clearFilters,
    sorting,
    setSorting,
    pageIndex: (pagination.page || 1) - 1,
    pageSize,
    setPageSize,
    columnVisibility,
    setColumnVisibility,
    stickyColumns,
    setStickyColumns,
    isLoading,
    isError,
    error,
  };
}
