import { useState } from 'react'
import { X, Crosshair } from 'lucide-react'
import { GeofenceForm } from './GeofenceForm'
import { Button } from '../ui/Button'
import { useCreateGeofence, useUpdateGeofence, useDeleteGeofence } from '../../hooks/useGeofences'
import { generateUid } from '../../lib/utils'
import { toast } from 'sonner'

interface DrawerPanelProps {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit' | null
  selectedGeofence?: any
  initialLatLon?: { lat: number; lon: number }
  onAddSuccess?: (geofence: any) => void
  onSetPosition?: () => void
}

export function DrawerPanel({ isOpen, onClose, mode, selectedGeofence, initialLatLon, onAddSuccess, onSetPosition }: DrawerPanelProps) {
  const createMutation = useCreateGeofence()
  const updateMutation = useUpdateGeofence()
  const deleteMutation = useDeleteGeofence()

  const [resetKey, setResetKey] = useState(0)
  const [position, setPosition] = useState<{lat: number, lon: number} | null>(null)

  useEffect(() => {
    if (initialLatLon) {
      setPosition(initialLatLon)
    }
  }, [initialLatLon])

  const handleSubmit = async (data: any) => {
    const lat = position?.lat ?? data.lat
    const lon = position?.lon ?? data.lon
    const shapeData = JSON.stringify({ lat, lon, radius: data.radius })

    try {
      if (mode === 'add') {
        const result = await createMutation.mutateAsync({
          name: data.name,
          uid: data.uid,
          description: data.description || undefined,
          mode: data.mode as any,
          shape_type: 'circle',
          shape_data: shapeData,
        })
        onClose()
        setResetKey(k => k + 1)
        setPosition(null)
        if (onAddSuccess && result.data) {
          onAddSuccess(result.data)
        }
      } else if (mode === 'edit' && selectedGeofence) {
        await updateMutation.mutateAsync({
          id: selectedGeofence.id,
          data: {
            name: data.name,
            description: data.description || undefined,
            mode: data.mode as any,
            shape_data: shapeData,
          },
        })
        onClose()
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleReset = () => {
    setResetKey(k => k + 1)
    setPosition(null)
  }

  const handleDelete = async () => {
    if (!selectedGeofence) return
    if (confirm(`Delete "${selectedGeofence.name}"?`)) {
      await deleteMutation.mutateAsync(selectedGeofence.id)
      onClose()
    }
  }

  const handleSetPosition = () => {
    toast.info("Left-click on map to set position")
    if (onSetPosition) {
      onSetPosition()
    }
  }

  const initialData = mode === 'edit' && selectedGeofence
    ? {
        name: selectedGeofence.name,
        uid: selectedGeofence.uid,
        description: selectedGeofence.description,
        mode: selectedGeofence.mode,
        shape_type: selectedGeofence.shape_type,
        ...JSON.parse(selectedGeofence.shape_data),
        detect_on: selectedGeofence.detect_on || [],
      }
    : mode === 'add' && position
    ? { name: '', uid: generateUid(), lat: position.lat, lon: position.lon, radius: 100, mode: 'report-only', shape_type: 'circle', detect_on: [] }
    : { name: '', uid: generateUid(), lat: 0, lon: 0, radius: 100, mode: 'report-only', shape_type: 'circle', detect_on: [], _needsMapClick: true }

  const getTitle = () => {
    switch (mode) {
      case 'add': return 'Add Geofence'
      case 'edit': return 'Edit Geofence'
      default: return 'Geofence'
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {mode && (
              <GeofenceForm
                key={resetKey}
                initialData={initialData}
                onSubmit={handleSubmit}
                onReset={handleReset}
                isLoading={createMutation.isPending || updateMutation.isPending}
                isEdit={mode === 'edit'}
                onSetPosition={mode === 'add' ? handleSetPosition : undefined}
                position={position}
              />
            )}
          </div>

          {mode === 'edit' && selectedGeofence && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Geofence'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export function DrawerPanel({ isOpen, onClose, mode, selectedGeofence, initialLatLon, currentLatLon, onAddSuccess }: DrawerPanelProps) {
  const createMutation = useCreateGeofence()
  const updateMutation = useUpdateGeofence()
  const deleteMutation = useDeleteGeofence()

  const [resetKey, setResetKey] = useState(0)
  const [lat, setLat] = useState(0)
  const [lon, setLon] = useState(0)

  useEffect(() => {
    if (mode === 'add' && currentLatLon) {
      setLat(currentLatLon.lat)
      setLon(currentLatLon.lon)
    }
  }, [mode, currentLatLon])

  const handleSubmit = async (data: any) => {
    const shapeData = JSON.stringify({ lat: lat || data.lat, lon: lon || data.lon, radius: data.radius })

    try {
      if (mode === 'add') {
        const result = await createMutation.mutateAsync({
          name: data.name,
          uid: data.uid,
          description: data.description || undefined,
          mode: data.mode as any,
          shape_type: 'circle',
          shape_data: shapeData,
        })
        onClose()
        setResetKey(k => k + 1)
        if (onAddSuccess && result.data) {
          onAddSuccess(result.data)
        }
      } else if (mode === 'edit' && selectedGeofence) {
        await updateMutation.mutateAsync({
          id: selectedGeofence.id,
          data: {
            name: data.name,
            description: data.description || undefined,
            mode: data.mode as any,
            shape_data: shapeData,
          },
        })
        onClose()
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleReset = () => {
    setResetKey(k => k + 1)
    if (mode === 'add' && initialLatLon) {
      toast.info('Position pre-filled from right-click location')
    } else if (mode === 'add') {
      toast.info('Tip: Right-click on map to set position')
    }
  }

  const handleDelete = async () => {
    if (!selectedGeofence) return
    if (confirm(`Delete "${selectedGeofence.name}"?`)) {
      await deleteMutation.mutateAsync(selectedGeofence.id)
      onClose()
    }
  }

  const initialData = mode === 'edit' && selectedGeofence
    ? {
        name: selectedGeofence.name,
        uid: selectedGeofence.uid,
        description: selectedGeofence.description,
        mode: selectedGeofence.mode,
        shape_type: selectedGeofence.shape_type,
        ...JSON.parse(selectedGeofence.shape_data),
        detect_on: selectedGeofence.detect_on || [],
      }
    : mode === 'add' && initialLatLon
    ? { name: '', uid: generateUid(), lat: initialLatLon.lat, lon: initialLatLon.lon, radius: 100, mode: 'report-only', shape_type: 'circle', detect_on: [] }
    : mode === 'add'
    ? { name: '', uid: generateUid(), lat: 0, lon: 0, radius: 100, mode: 'report-only', shape_type: 'circle', detect_on: [], _needsMapClick: true }
    : undefined

  const getTitle = () => {
    switch (mode) {
      case 'add': return 'Add Geofence'
      case 'edit': return 'Edit Geofence'
      default: return 'Geofence'
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {mode && (
              <GeofenceForm
                key={resetKey}
                initialData={initialData}
                lat={lat}
                lon={lon}
                onSubmit={handleSubmit}
                onReset={handleReset}
                isLoading={createMutation.isPending || updateMutation.isPending}
                isEdit={mode === 'edit'}
              />
            )}
          </div>

          {mode === 'edit' && selectedGeofence && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Geofence'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}