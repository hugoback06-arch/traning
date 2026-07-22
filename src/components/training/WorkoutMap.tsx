import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { decodePolyline } from '../../lib/polyline'

export function WorkoutMap({ polyline }: { polyline: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const points = decodePolyline(polyline)
    if (points.length < 2) return

    const map = L.map(containerRef.current, { attributionControl: false })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)

    const line = L.polyline(points, { color: '#1D9E75', weight: 4 }).addTo(map)
    map.fitBounds(line.getBounds(), { padding: [16, 16] })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [polyline])

  return <div ref={containerRef} className="h-48 w-full overflow-hidden rounded-xl border border-border" />
}
