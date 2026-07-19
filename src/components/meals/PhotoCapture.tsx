interface PhotoCaptureProps {
  onCapture: (file: File) => void
}

export function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center">
      <span className="text-sm font-medium text-ink-primary">Ta eller välj foto</span>
      <span className="text-xs text-ink-secondary">Fota din tallrik för att få ett kaloriförslag</span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onCapture(file)
        }}
      />
    </label>
  )
}
