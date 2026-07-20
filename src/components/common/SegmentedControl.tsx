interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex rounded-xl bg-surface-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            value === option.value ? 'bg-surface text-ink-primary shadow-sm' : 'text-ink-secondary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
