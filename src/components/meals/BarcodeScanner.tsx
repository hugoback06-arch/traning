import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'

interface BarcodeScannerProps {
  active: boolean
  onDetected: (code: string) => void
}

export function BarcodeScanner({ active, onDetected }: BarcodeScannerProps) {
  const { videoRef, error } = useBarcodeScanner(onDetected, active)

  if (error) {
    return (
      <p className="text-sm text-warning">
        Kunde inte starta kameran ({error}). Kontrollera att du gett appen kameraåtkomst.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <video ref={videoRef} muted playsInline className="aspect-square w-full object-cover" />
    </div>
  )
}
