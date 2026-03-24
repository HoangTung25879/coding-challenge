import { useState } from 'react';
import type { FilterState } from '@/hooks/useDataTable';
import { BudgetRangeSlider } from './BudgetRangeSlider';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Filter,
  ChevronDown,
  X,
  Check,
  Globe,
  Calendar,
  Banknote,
  User,
  DollarSign,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type Props = {
  filters: FilterState;
  setFilter: (key: string, value: unknown) => void;
};

type FilterOption = { value: string; label: string };

type FilterSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  options: FilterOption[];
};

const SOURCE_OPTIONS: FilterOption[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone', label: 'Phone' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'dealer-event', label: 'Dealer Event' },
  { value: 'other', label: 'Other' },
];

const TIMELINE_OPTIONS: FilterOption[] = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'within-1-month', label: 'Within 1 Month' },
  { value: 'within-3-months', label: 'Within 3 Months' },
  { value: 'within-6-months', label: 'Within 6 Months' },
  { value: 'exploring', label: 'Exploring' },
];

const FINANCING_OPTIONS: FilterOption[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'lease', label: 'Lease' },
  { value: 'loan', label: 'Loan' },
  { value: 'undecided', label: 'Undecided' },
];

const LEAD_TYPE_OPTIONS: FilterOption[] = [
  { value: 'cold', label: 'Cold' },
  { value: 'warm', label: 'Warm' },
  { value: 'hot', label: 'Hot' },
];

const LEAD_TYPE_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  cold: { bg: 'bg-blue-100', text: 'text-blue-700' },
  warm: { bg: 'bg-amber-100', text: 'text-amber-700' },
  hot: { bg: 'bg-red-100', text: 'text-red-700' },
};

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
];

const STATUS_BADGE_STYLES: Record<string, { dot: string; text: string }> = {
  new: { dot: 'bg-gray-400', text: 'text-gray-600' },
  contacted: { dot: 'bg-blue-500', text: 'text-blue-700' },
  qualified: { dot: 'bg-green-500', text: 'text-green-700' },
  unqualified: { dot: 'bg-red-500', text: 'text-red-700' },
};

const CURRENCY_OPTIONS: FilterOption[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'BRL', label: 'BRL (R$)' },
  { value: 'SGD', label: 'SGD (S$)' },
  { value: 'ZAR', label: 'ZAR (R)' },
];

const BUDGET_MIN = 0;
const BUDGET_MAX = 600000;
const BUDGET_STEP = 10000;

const FILTER_SECTIONS: FilterSection[] = [
  {
    key: 'source',
    label: 'Source',
    icon: Globe,
    options: SOURCE_OPTIONS,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    icon: Calendar,
    options: TIMELINE_OPTIONS,
  },
  {
    key: 'financing',
    label: 'Financing',
    icon: Banknote,
    options: FINANCING_OPTIONS,
  },
  {
    key: 'leadType',
    label: 'Type',
    icon: User,
    options: LEAD_TYPE_OPTIONS,
  },
  {
    key: 'status',
    label: 'Status',
    icon: Tag,
    options: STATUS_OPTIONS,
  },
];

function getFilterValue(filters: FilterState, key: string): string {
  return ((filters as Record<string, unknown>)[key] as string) ?? '';
}

function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.source) count++;
  if (filters.timeline) count++;
  if (filters.financing) count++;
  if (filters.leadType) count++;
  if (filters.status) count++;
  if (filters.budgetMin != null) count++;
  if (filters.budgetMax != null) count++;
  if (filters.currency) count++;
  return count;
}

export function FilterMenu({ filters, setFilter }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const activeCount = getActiveFilterCount(filters);
  const budgetMinVal = filters.budgetMin ?? BUDGET_MIN;
  const budgetMaxVal = filters.budgetMax ?? BUDGET_MAX;

  function handleSelectOption(key: string, value: string) {
    const current = getFilterValue(filters, key);
    setFilter(key, current === value ? '' : value);
  }

  function handleClearAll() {
    FILTER_SECTIONS.forEach((s) => setFilter(s.key, ''));
    setFilter('budgetMin', undefined);
    setFilter('budgetMax', undefined);
    setFilter('currency', '');
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-haspopup="menu"
            aria-label="Filter leads"
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${activeCount > 0
              ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
                {activeCount}
              </span>
            )}
          </button>
        }
      />
      <PopoverContent align="start" className="w-64 p-0">
        <div role="menu" aria-label="Filter options" className="w-64">
          {FILTER_SECTIONS.map((section) => {
            const currentValue = getFilterValue(filters, section.key);
            const isExpanded = expandedKey === section.key;
            const activeOption = section.options.find((o) => o.value === currentValue);

            return (
              <div key={section.key}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setExpandedKey(isExpanded ? null : section.key)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="text-gray-400">
                    <section.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-left">{section.label}</span>
                  {activeOption && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                      {activeOption.label}
                    </span>
                  )}
                  <span
                    className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {isExpanded && (
                  <div className="pb-1">
                    {section.options.map((option) => {
                      const isSelected = currentValue === option.value;
                      const leadTypeStyle =
                        section.key === 'leadType'
                          ? LEAD_TYPE_BADGE_STYLES[option.value]
                          : undefined;
                      const statusStyle =
                        section.key === 'status' ? STATUS_BADGE_STYLES[option.value] : undefined;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectOption(section.key, option.value)}
                          className={`flex w-full items-center gap-2 px-3 py-1.5 pl-10 text-sm ${isSelected
                            ? 'bg-blue-50 font-medium text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          <span className={isSelected ? '' : 'pl-5.5'}>
                            {leadTypeStyle ? (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${leadTypeStyle.bg} ${leadTypeStyle.text}`}
                              >
                                {option.label}
                              </span>
                            ) : statusStyle ? (
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusStyle.text}`}
                              >
                                <span
                                  className={`h-2 w-2 flex-shrink-0 rounded-full ${statusStyle.dot}`}
                                />
                                {option.label}
                              </span>
                            ) : (
                              option.label
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Budget range section */}
          <div>
            <button
              type="button"
              role="menuitem"
              onClick={() => setExpandedKey(expandedKey === 'budget' ? null : 'budget')}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="text-gray-400">
                <DollarSign className="h-4 w-4" />
              </span>
              <span className="flex-1 text-left">Budget</span>
              {(filters.budgetMin != null || filters.budgetMax != null || filters.currency) && (
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                  {filters.currency || '$'}
                  {budgetMinVal.toLocaleString()}–{budgetMaxVal.toLocaleString()}
                </span>
              )}
              <span
                className={`text-gray-400 transition-transform ${expandedKey === 'budget' ? 'rotate-180' : ''}`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>

            {expandedKey === 'budget' && (
              <div className="space-y-3 px-3 py-2 pl-10">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Currency</p>
                  <Select
                    value={filters.currency || 'Any currency'}
                    onValueChange={(v) =>
                      setFilter('currency', v === null || v === '__any__' ? '' : v)
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-sm">
                      <SelectValue>
                        {filters.currency
                          ? CURRENCY_OPTIONS.find((o) => o.value === filters.currency)?.label
                          : 'Any currency'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any currency">Any currency</SelectItem>
                      {CURRENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Range</p>
                  <BudgetRangeSlider
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    valueMin={budgetMinVal}
                    valueMax={budgetMaxVal}
                    onMinChange={(v) => setFilter('budgetMin', v)}
                    onMaxChange={(v) => setFilter('budgetMax', v)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clear all */}
          {activeCount > 0 && (
            <>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                role="menuitem"
                onClick={handleClearAll}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
