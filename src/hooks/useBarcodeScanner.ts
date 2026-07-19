import { useEffect, useRef, useState } from 'react'
import { BarcodeDetector } from 'barcode-detector'

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'] as const
const SCAN_INTERVAL_MS = 300

export function useBarcodeScanner(onDetected: (code: string) => void, active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected

  useEffect(() => {
    if (!active) return

    let stream: MediaStream | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null
    let cancelled = false
    const detector = new BarcodeDetector({ formats: [...FORMATS] })

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        intervalId = setInterval(async () => {
          if (!videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) onDetectedRef.current(codes[0].rawValue)
          } catch {
            // transient decode failures between frames are expected — ignore
          }
        }, SCAN_INTERVAL_MS)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Kunde inte starta kameran')
      }
    }

    start()

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [active])

  return { videoRef, error }
}
