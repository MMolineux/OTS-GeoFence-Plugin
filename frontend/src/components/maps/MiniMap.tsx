import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeofences } from '../../hooks/useGeofences'
import { useNavigate } from 'react-router'

const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

interface Geofence {
  id: number
  name: string
  shape_type: string
  shape_data: string
  mode: string
}

function MapController() {
  const map = useMap()
  useEffect(() => {
    map.setView([39.8283, -98.5795], 4)
  }, [map])
  return null
}

export function MiniMap() {
  const navigate = useNavigate()
  const { data: geofences, isLoading } = useGeofences()

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
    <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {isLoading ? (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <span className="text-slate-500">Loading map...</span>
        </div>
      ) : (
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={darkTileUrl} />
          <MapController />
          {geofences?.map((geofence: Geofence) => {
            const shape = parseShapeData(geofence.shape_data)
            if (!shape) return null
            return (
              <Circle
                key={geofence.id}
                center={[shape.lat, shape.lon]}
                radius={shape.radius}
                pathOptions={{
                  color: getModeColor(geofence.mode),
                  fillColor: getModeColor(geofence.mode),
                  fillOpacity: 0.3,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => navigate('/geofences'),
                }}
              />
            )
          })}
        </MapContainer>
      )}
      <div className="absolute bottom-2 left-2 text-xs text-slate-400 bg-slate-900/80 px-2 py-1 rounded">
        Click to open Geofence Editor
      </div>
    </div>
  )
}