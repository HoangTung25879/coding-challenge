import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash-es';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
};

export function GlobalSearch({ value, onChange, debounceMs = 300 }: Props) {
  const [local, setLocal] = useState(value);

  const debouncedOnChange = useMemo(() => debounce(onChange, debounceMs), [onChange, debounceMs]);

  useEffect(() => {
    return () => debouncedOnChange.cancel();
  }, [debouncedOnChange]);

  useEffect(() => {
    setLocal(value);
    debouncedOnChange.cancel();
  }, [value, debouncedOnChange]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setLocal(next);
    debouncedOnChange(next);
  }

  return (
    <div className="w-full max-w-xs">
      <Input
        type="text"
        role="searchbox"
        aria-label="Search leads"
        placeholder="Search leads..."
        value={local}
        onChange={handleChange}
        leftIcon={<Search className="h-4 w-4" />}
      />
    </div>
  );
}
