import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Circle, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Link } from "react-router-dom"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "../components/ui/Button"
import { RadialMenu } from "../components/maps/RadialMenu"
import { GeofenceLayer } from "../components/maps/GeofenceLayer"
import { useGeofences, useDeleteGeofence, useMoveGeofence } from "../hooks/useGeofences"
import { toast } from "sonner"
import { DrawerPanel } from "../components/geofence/DrawerPanel"

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
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    if (geofences.length === 0) return

    hasInitialized.current = true

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
    }
  }, [map, geofences])

  return null
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function isPointInGeofence(lat: number, lon: number, geofence: Geofence): boolean {
  try {
    const shape = JSON.parse(geofence.shape_data)
    if (shape.lat !== undefined && shape.lon !== undefined && shape.radius !== undefined) {
      const distance = haversineDistance(lat, lon, shape.lat, shape.lon)
      return distance <= shape.radius
    }
    return false
  } catch {
    return false
  }
}

interface ContextMenuHandlerProps {
  onContextMenu: (lat: number, lon: number, screenX: number, screenY: number) => void
}

function ContextMenuHandler({ onContextMenu }: ContextMenuHandlerProps) {
  useMapEvents({
    contextmenu(e) {
      e.originalEvent.preventDefault()
      onContextMenu(e.latlng.lat, e.latlng.lng, e.originalEvent.clientX, e.originalEvent.clientY)
    },
  })
  return null
}

interface MapMouseMoveHandlerProps {
  onMouseMove: (lat: number, lon: number) => void
}

function MapMouseMoveHandler({ onMouseMove }: MapMouseMoveHandlerProps) {
  useMapEvents({
    mousemove(e) {
      onMouseMove(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface MapClickHandlerProps {
  onMapClick: (lat: number, lon: number) => void
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function GhostGeofence({ geofence, mousePosition }: { geofence: Geofence; mousePosition: { lat: number; lon: number } | null }) {
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

  const shape = parseShapeData(geofence.shape_data)
  if (!shape) return null

  const center = mousePosition ? [mousePosition.lat, mousePosition.lon] as [number, number] : [shape.lat, shape.lon] as [number, number]

  return (
    <Circle
      center={center}
      radius={shape.radius}
      pathOptions={{
        color: getModeColor(geofence.mode),
        fillColor: getModeColor(geofence.mode),
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '8, 4',
        className: 'ghost-geofence',
      }}
    />
  )
}

export function GeofenceEditor() {
  const { data: geofences } = useGeofences()
  const deleteGeofence = useDeleteGeofence()
  const moveGeofence = useMoveGeofence()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | null>(null)
  const [menuPosition, setMenuPosition] = useState<{x: number, y: number} | null>(null)
  const [rightClickLatLon, setRightClickLatLon] = useState<{lat: number, lon: number} | null>(null)
  const [rightClickGeofenceId, setRightClickGeofenceId] = useState<number | null>(null)
  const [moveMode, setMoveMode] = useState<number | null>(null)
  const [positioningMode, setPositioningMode] = useState(false)
  const [mousePosition, setMousePosition] = useState<{lat: number, lon: number} | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)

  const selectedGeofence = geofences?.find((g: Geofence) => g.id === selectedId) || null
  const moveGeofenceData = geofences?.find((g: Geofence) => g.id === moveMode) || null

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && moveMode !== null) {
        setMoveMode(null)
        setMousePosition(null)
        setIsDragging(false)
        toast.info("Move cancelled")
      }
      if (e.key === "Escape" && positioningMode) {
        setPositioningMode(false)
        toast.info("Position cancelled")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [moveMode, positioningMode])

  const handleMapContextMenu = (lat: number, lon: number, screenX: number, screenY: number) => {
    if (moveMode !== null) {
      setMoveMode(null)
      setMousePosition(null)
      setIsDragging(false)
      toast.info("Move cancelled")
      return
    }

    // If drawer is open in add mode, just update coordinates without opening radial menu
    if (drawerOpen && drawerMode === "add") {
      setRightClickLatLon({ lat, lon })
      return
    }

    let clickedGeofenceId: number | null = null
    if (geofences) {
      for (const geofence of geofences as Geofence[]) {
        if (isPointInGeofence(lat, lon, geofence)) {
          clickedGeofenceId = geofence.id
          break
        }
      }
    }

    setMenuPosition({ x: screenX, y: screenY })
    setRightClickLatLon({ lat, lon })
    setRightClickGeofenceId(clickedGeofenceId)
  }

  const handleMapClick = (lat: number, lon: number) => {
    if (moveMode !== null) {
      moveGeofence.mutate(
        { id: moveMode, lat, lon },
        {
          onSuccess: () => {
            toast.success("Geofence moved successfully")
            setMoveMode(null)
            setMousePosition(null)
            setIsDragging(false)
          },
          onError: (error) => {
            toast.error(`Failed to move geofence: ${error.message}`)
          },
        }
      )
    } else if (positioningMode) {
      setRightClickLatLon({ lat, lon })
      setPositioningMode(false)
      toast.success("Position set")
    } else if (selectedId !== null) {
      setSelectedId(null)
    }
  }

  const handleMouseMove = (lat: number, lon: number) => {
    if (moveMode !== null) {
      setMousePosition({ lat, lon })
      setIsDragging(true)
    } else if (positioningMode) {
      setMousePosition({ lat, lon })
    }
  }

  const handleCloseMenu = () => {
    setMenuPosition(null)
    setRightClickGeofenceId(null)
  }

  const clearCoordinates = () => {
    setRightClickLatLon(null)
  }

  const handleAction = async (action: "add" | "edit" | "move" | "delete") => {
    switch (action) {
      case "add":
        setDrawerMode("add")
        setDrawerOpen(true)
        break
      case "edit":
        if (rightClickGeofenceId !== null) {
          setSelectedId(rightClickGeofenceId)
          setDrawerMode("edit")
          setDrawerOpen(true)
        }
        break
      case "move":
        if (rightClickGeofenceId !== null) {
          setMoveMode(rightClickGeofenceId)
          const geofence = geofences?.find((g: Geofence) => g.id === rightClickGeofenceId)
          toast.info(`Move "${geofence?.name}" - click new location or ESC to cancel`)
        }
        break
      case "delete":
        if (rightClickGeofenceId !== null) {
          try {
            await deleteGeofence.mutateAsync(rightClickGeofenceId)
            setSelectedId(null)
          } catch (error) {
            console.error("Failed to delete geofence:", error)
          }
        }
        break
    }
    handleCloseMenu()
  }

  const handleAddSuccess = (newGeofence: Geofence) => {
    setSelectedId(newGeofence.id)
    clearCoordinates()
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setDrawerMode(null)
    clearCoordinates()
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

      <div 
        className="flex-1 relative" 
        ref={mapRef}
        style={{ cursor: moveMode !== null ? (isDragging ? "grabbing" : "grab") : positioningMode ? "crosshair" : "default" }}
        onMouseLeave={() => setIsDragging(false)}
      >
        <MapContainer
          center={[0, 0]}
          zoom={2}
          className="w-full h-full"
          style={{ background: "#0f172a" }}
        >
          <ContextMenuHandler onContextMenu={handleMapContextMenu} />
          <MapMouseMoveHandler onMouseMove={handleMouseMove} />
          <MapClickHandler onMapClick={handleMapClick} />
          <TileLayer url={darkTileUrl} />
          <MapController geofences={geofences || []} />
          {geofences && (
            <GeofenceLayer
              geofences={geofences as Geofence[]}
              selectedId={selectedId ?? undefined}
              onSelect={setSelectedId}
            />
          )}
          {moveMode !== null && moveGeofenceData && (
            <GhostGeofence geofence={moveGeofenceData} mousePosition={mousePosition} />
          )}
          {positioningMode && mousePosition && (
            <Circle
              center={[mousePosition.lat, mousePosition.lon]}
              radius={100}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '8, 4',
              }}
            />
          )}
        </MapContainer>

        {moveMode !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg font-medium z-50">
            Drag map to pan • Click to move "{moveGeofenceData?.name}" • ESC to cancel
          </div>
        )}
        {positioningMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg font-medium z-50">
            Left-click on map to set position • ESC to cancel
          </div>
        )}

        <RadialMenu
          x={menuPosition?.x ?? 0}
          y={menuPosition?.y ?? 0}
          visible={menuPosition !== null}
          onClose={handleCloseMenu}
          onAction={handleAction}
          hasSelection={rightClickGeofenceId !== null}
        />

        {drawerMode && (
          <DrawerPanel
            isOpen={drawerOpen}
            onClose={handleCloseDrawer}
            mode={drawerMode}
            selectedGeofence={selectedGeofence}
            initialLatLon={rightClickLatLon ?? undefined}
            onAddSuccess={handleAddSuccess}
            onSetPosition={() => setPositioningMode(true)}
          />
        )}

        <div className="absolute bottom-6 left-6 bg-card/90 text-foreground text-sm px-4 py-2 rounded-lg border shadow-lg">
          Right-click map to add geofence • Right-click geofence to edit/move/delete
        </div>
      </div>
    </div>
  )
}