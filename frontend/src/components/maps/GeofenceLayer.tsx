import { Circle } from 'react-leaflet'
import L from 'leaflet'

interface Geofence {
  id: number
  name: string
  shape_type: string
  shape_data: string
  mode: string
  detect_on?: string[]
}

interface GeofenceLayerProps {
  geofences: Geofence[]
  selectedId?: number
  onSelect: (id: number | null) => void
  onMove?: (id: number, lat: number, lon: number) => void
}

export function GeofenceLayer({ geofences, selectedId, onSelect, onMove }: GeofenceLayerProps) {
  const parseShapeData = (shapeData: string): { lat: number; lon: number; radius: number } | null => {
    try {
      const parsed = JSON.parse(shapeData)
      return { lat: parsed.lat, lon: parsed.lon, radius: parsed.radius }
    } catch {
      return null
    }
  }

  const getModeColor = (mode: string): string => {
    switch (mode) {
      case 'active': return '#22c55e'
      case 'report-only': return '#3b82f6'
      case 'inactive': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <>
      {geofences.map((geofence) => {
        const shape = parseShapeData(geofence.shape_data)
        if (!shape) return null
        const isSelected = geofence.id === selectedId
        return (
          <Circle
            key={geofence.id}
            center={[shape.lat, shape.lon]}
            radius={shape.radius}
            pathOptions={{
              color: getModeColor(geofence.mode),
              fillColor: getModeColor(geofence.mode),
              fillOpacity: isSelected ? 0.5 : 0.2,
              weight: isSelected ? 3 : 2,
              dashArray: geofence.mode === 'report-only' ? '5, 5' : undefined,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                onSelect(geofence.id)
              },
            }}
          />
        )
      })}
    </>
  )
}