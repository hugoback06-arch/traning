import { useState } from 'react'
import { Button } from '../common/Button'

interface PhotoCaptureProps {
  onCapture: (file: File, description?: string) => void
}

export function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  function handleFile(selected: File) {
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  if (!file) {
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
            const selected = e.target.files?.[0]
            if (selected) handleFile(selected)
          }}
        />
      </label>
    )
  }

  return (
    <div className="space-y-3">
      <img src={previewUrl ?? undefined} alt="Foto på maten" className="w-full rounded-2xl object-cover" />
      <div>
        <label className="block text-sm text-ink-secondary">Beskrivning (valfritt)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="T.ex. kycklingsallad med dressing, ca 300 g"
          autoFocus
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-ink-secondary">Hjälper AI:n att bedöma kalorier och mängd mer exakt.</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            setFile(null)
            setPreviewUrl(null)
            setDescription('')
          }}
        >
          Byt bild
        </Button>
        <Button className="flex-1" onClick={() => onCapture(file, description.trim() || undefined)}>
          Analysera
        </Button>
      </div>
    </div>
  )
}
