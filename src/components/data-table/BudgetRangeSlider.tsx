import { useRef, useCallback } from 'react'

type Props = {
  min: number
  max: number
  step: number
  valueMin: number
  valueMax: number
  onMinChange: (value: number | undefined) => void
  onMaxChange: (value: number | undefined) => void
}

export function BudgetRangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onMinChange,
  onMaxChange,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  const minPercent = ((valueMin - min) / (max - min)) * 100
  const maxPercent = ((valueMax - min) / (max - min)) * 100

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), valueMax - step)
      onMinChange(v === min ? undefined : v)
    },
    [valueMax, step, min, onMinChange],
  )

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), valueMin + step)
      onMaxChange(v === max ? undefined : v)
    },
    [valueMin, step, max, onMaxChange],
  )

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">
        Budget: ${valueMin.toLocaleString()} – ${valueMax.toLocaleString()}
      </label>
      <div className="relative flex items-center" style={{ width: 200, height: 28 }}>
        {/* Track background */}
        <div
          ref={trackRef}
          className="absolute h-1.5 w-full rounded-full bg-gray-200"
        />
        {/* Active range highlight */}
        <div
          className="absolute h-1.5 rounded-full bg-blue-500"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={handleMinChange}
          aria-label={`Budget Min: $${valueMin.toLocaleString()}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={valueMin}
          className="pointer-events-none absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:relative [&::-moz-range-thumb]:z-10 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm"
          style={{ zIndex: valueMin > max - step ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={handleMaxChange}
          aria-label={`Budget Max: $${valueMax.toLocaleString()}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={valueMax}
          className="pointer-events-none absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:relative [&::-moz-range-thumb]:z-20 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm"
        />
      </div>
    </div>
  )
}
