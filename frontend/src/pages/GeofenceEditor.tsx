import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { RadialMenu } from '../components/maps/RadialMenu'
import { GeofenceLayer } from '../components/maps/GeofenceLayer'
import { DrawerPanel } from '../components/geofence/DrawerPanel'
import { useGeofences } from '../hooks/useGeofences'
import { useMoveGeofence } from '../hooks/useGeofences'

const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

interface Geofence {
  id: number
  name: string
  shape_type: string
  shape_data: string
  mode: string
  detect_on?: string[]
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 10)
  }, [map, center])
  return null
}

export function GeofenceEditor() {
  const { data: geofences, isLoading } = useGeofences()
  const moveMutation = useMoveGeofence()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795])
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [menuVisible, setMenuVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | null>(null)
  const [tempCenter, setTempCenter] = useState<{ lat: number; lon: number } | null>(null)

  const selectedGeofence = geofences?.find((g: Geofence) => g.id === selectedId) || null

  const parseShapeData = (shapeData: string): { lat: number; lon: number } | null => {
    try {
      const parsed = JSON.parse(shapeData)
      return { lat: parsed.lat, lon: parsed.lon }
    } catch {
      return null
    }
  }

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (drawerOpen) return
    const { lat, lng } = e.latlng
    setMenuPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
    setMenuVisible(true)
    setTempCenter({ lat, lon: lng })
    setMapCenter([lat, lng])
  }

  const handleAction = (action: 'add' | 'edit' | 'move' | 'delete') => {
    setMenuVisible(false)
    setDrawerMode(action)

    if (action === 'add') {
      setDrawerOpen(true)
    } else if (action === 'edit') {
      if (selectedId) {
        setDrawerOpen(true)
      }
    } else if (action === 'move') {
      if (selectedId && tempCenter) {
        moveMutation.mutate({ id: selectedId, lat: tempCenter.lat, lon: tempCenter.lon })
        setSelectedId(null)
      }
    } else if (action === 'delete') {
      if (selectedId && confirm('Delete this geofence?')) {
        setSelectedId(null)
      }
    }
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setDrawerMode(null)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-white">Geofence Editor</h1>
        </div>
        <Button variant="outline" onClick={() => { setDrawerMode('add'); setDrawerOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Geofence
        </Button>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={10}
          className="w-full h-full"
          onClick={handleMapClick}
        >
          <TileLayer url={darkTileUrl} />
          <MapController center={mapCenter} />
          {geofences && (
            <GeofenceLayer
              geofences={geofences as Geofence[]}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </MapContainer>

        <RadialMenu
          x={menuPos.x}
          y={menuPos.y}
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onAction={handleAction}
          hasSelection={selectedId !== null}
        />

        {drawerMode && (
          <DrawerPanel
            isOpen={drawerOpen}
            onClose={handleCloseDrawer}
            mode={drawerMode}
            selectedGeofence={selectedGeofence}
            mapCenter={tempCenter || undefined}
          />
        )}

        <div className="absolute bottom-6 left-6 bg-slate-800/90 text-white text-sm px-4 py-2 rounded-lg">
          Left-click on map to add geofence • Click existing geofence to select
        </div>
      </div>
    </div>
  )
}