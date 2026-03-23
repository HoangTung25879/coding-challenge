const PAGE_SIZES = [10, 25, 50, 100]

type Props = {
  pageSize: number
  onChange: (size: number) => void
}

export function PageSizeSelector({ pageSize, onChange }: Props) {
  return (
    <select
      aria-label="Rows per page"
      value={pageSize}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {PAGE_SIZES.map((size) => (
        <option key={size} value={size}>
          {size} rows
        </option>
      ))}
    </select>
  )
}
