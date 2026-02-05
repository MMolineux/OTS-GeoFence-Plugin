import { useState } from 'react'
import { X } from 'lucide-react'
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
  mapCenter?: { lat: number; lon: number }
}

export function DrawerPanel({ isOpen, onClose, mode, selectedGeofence, mapCenter }: DrawerPanelProps) {
  const createMutation = useCreateGeofence()
  const updateMutation = useUpdateGeofence()
  const deleteMutation = useDeleteGeofence()

  const [resetKey, setResetKey] = useState(0)

  const handleSubmit = async (data: any) => {
    const shapeData = JSON.stringify({ lat: data.lat, lon: data.lon, radius: data.radius })

    try {
      if (mode === 'add') {
        await createMutation.mutateAsync({
          name: data.name,
          uid: data.uid,
          description: data.description || undefined,
          mode: data.mode as any,
          shape_type: 'circle',
          shape_data: shapeData,
        })
        onClose()
        setResetKey(k => k + 1)
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
    if (mode === 'add' && mapCenter) {
      toast.info('Click on map to set center position')
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
    : mode === 'add' && mapCenter
    ? { name: '', uid: generateUid(), lat: mapCenter.lat, lon: mapCenter.lon, radius: 100, mode: 'report-only', shape_type: 'circle', detect_on: [] }
    : undefined

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
            <h2 className="text-lg font-semibold">
              {mode === 'add' ? 'Add Geofence' : mode === 'edit' ? 'Edit Geofence' : 'Geofence'}
            </h2>
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