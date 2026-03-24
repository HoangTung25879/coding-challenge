import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZES = [10, 25, 50, 100];

type Props = {
  pageSize: number;
  onChange: (size: number) => void;
};

export function PageSizeSelector({ pageSize, onChange }: Props) {
  return (
    <Select value={String(pageSize)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger aria-label="Rows per page" size="default" className="text-sm bg-white">
        <SelectValue /> rows
      </SelectTrigger>
      <SelectContent>
        {PAGE_SIZES.map((size) => (
          <SelectItem key={size} value={String(size)}>
            {size} rows
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
