import { Slider } from '@/components/ui/slider';

type Props = {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
};

export function BudgetRangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onMinChange,
  onMaxChange,
}: Props) {
  function handleValueChange(value: number | readonly number[]) {
    const [newMin, newMax] = Array.isArray(value) ? value : [value, value];
    onMinChange(newMin === min ? undefined : newMin);
    onMaxChange(newMax === max ? undefined : newMax);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-gray-500">
        Budget: ${valueMin.toLocaleString()} – ${valueMax.toLocaleString()}
      </label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[valueMin, valueMax]}
        onValueChange={handleValueChange}
        aria-label="Budget range"
        className="w-full"
      />
    </div>
  );
}
