import { formatDistanceToNow } from 'date-fns'

type Props = { date: string }

export function DateCell({ date }: Props) {
  const d = new Date(date)
  const relative = formatDistanceToNow(d, { addSuffix: true })
  const full = d.toISOString()

  return (
    <time dateTime={full} title={full} className="whitespace-nowrap">
      {relative}
    </time>
  )
}
