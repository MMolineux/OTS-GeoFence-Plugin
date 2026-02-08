import { useEffect } from 'react'
import { MapContainer, TileLayer, Circle, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface MoveMapProps {
  lat: number
  lon: number
  radius: number
  mode: string
  onPositionChange: (lat: number, lon: number) => void
}

function DraggableCenter({ lat, lon, onPositionChange }: { lat: number; lon: number; onPositionChange: (lat: number, lon: number) => void }) {
  const map = useMap()
  
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng)
      map.setView([e.latlng.lat, e.latlng.lng], map.getZoom())
    },
    dragend() {
      const center = map.getCenter()
      onPositionChange(center.lat, center.lng)
    },
  })

  useEffect(() => {
    map.setView([lat, lon], map.getZoom())
  }, [lat, lon, map])

  return null
}

export function MoveMap({ lat, lon, radius, mode, onPositionChange }: MoveMapProps) {
  const getModeColor = (mode: string): string => {
    switch (mode) {
      case 'active': return '#22c55e'
      case 'report-only': return '#3b82f6'
      case 'inactive': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <div className="h-[300px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <MapContainer
        center={[lat, lon]}
        zoom={14}
        className="w-full h-full"
        style={{ background: '#0f172a' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <DraggableCenter lat={lat} lon={lon} onPositionChange={onPositionChange} />
        <Circle
          center={[lat, lon]}
          radius={radius}
          pathOptions={{
            color: getModeColor(mode),
            fillColor: getModeColor(mode),
            fillOpacity: 0.3,
            weight: 2,
          }}
        />
      </MapContainer>
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Click on map or drag the circle to reposition
      </div>
    </div>
  )
}