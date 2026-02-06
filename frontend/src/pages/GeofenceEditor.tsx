import { useState, useEffect } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Link } from "react-router-dom"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "../components/ui/Button"
import { RadialMenu } from "../components/maps/RadialMenu"
import { GeofenceLayer } from "../components/maps/GeofenceLayer"
import { DrawerPanel } from "../components/geofence/DrawerPanel"
import { useGeofences } from "../hooks/useGeofences"

const darkTileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

interface Geofence {
  id: number
  name: string
  shape_type: string
  shape_data: string
  mode: string
  detect_on?: string[]
}

interface MapControllerProps {
  geofences: Geofence[]
}

function MapController({ geofences }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    const parseShapeData = (shapeData: string): { lat: number; lon: number; radius: number } | null => {
      try {
        const parsed = JSON.parse(shapeData)
        return { lat: parsed.lat, lon: parsed.lon, radius: parsed.radius }
      } catch {
        return null
      }
    }

    const shapes = geofences
      .map(g => parseShapeData(g.shape_data))
      .filter((s): s is { lat: number; lon: number; radius: number } => s !== null)

    if (shapes.length > 0) {
      const bounds = shapes.map(s => [s.lat, s.lon] as [number, number])
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
    } else {
      map.setView([0, 0], 2)
    }
  }, [map, geofences])

  return null
}

export function GeofenceEditor() {
  const { data: geofences } = useGeofences()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | null>(null)

  const selectedGeofence = geofences?.find((g: Geofence) => g.id === selectedId) || null

  const handleAction = (_action: "add" | "edit" | "move" | "delete") => {
    // Placeholder for radial menu actions
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setDrawerMode(null)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Geofence Editor</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setDrawerMode("add")
            setDrawerOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Geofence
        </Button>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          className="w-full h-full"
        >
          <TileLayer url={darkTileUrl} />
          <MapController geofences={geofences || []} />
          {geofences && (
            <GeofenceLayer
              geofences={geofences as Geofence[]}
              selectedId={selectedId ?? undefined}
              onSelect={setSelectedId}
            />
          )}
        </MapContainer>

        <RadialMenu
          x={0}
          y={0}
          visible={false}
          onClose={() => {}}
          onAction={handleAction}
          hasSelection={selectedId !== null}
        />

        {drawerMode && (
          <DrawerPanel
            isOpen={drawerOpen}
            onClose={handleCloseDrawer}
            mode={drawerMode}
            selectedGeofence={selectedGeofence}
          />
        )}

        <div className="absolute bottom-6 left-6 bg-card/90 text-foreground text-sm px-4 py-2 rounded-lg border shadow-lg">
          Click geofence to select • Use Add button to create new
        </div>
      </div>
    </div>
  )
}