const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

type Props = { max: number; currency?: string };

export function BudgetCell({ max, currency = 'USD' }: Props) {
  const fmt =
    currency === 'USD'
      ? formatter
      : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });

  return <span className="tabular-nums">{fmt.format(max)}</span>;
}
