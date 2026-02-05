import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { Label } from '../ui/Label'
import { generateUid } from '../../lib/utils'

interface GeofenceFormData {
  name: string
  uid: string
  description: string
  mode: string
  shape_type: string
  lat: number
  lon: number
  radius: number
  detect_on: string[]
}

interface GeofenceFormProps {
  initialData?: Partial<GeofenceFormData>
  onSubmit: (data: GeofenceFormData) => void
  onReset: () => void
  isLoading?: boolean
  isEdit?: boolean
}

export function GeofenceForm({ initialData, onSubmit, onReset, isLoading, isEdit }: GeofenceFormProps) {
  const [formData, setFormData] = useState<GeofenceFormData>({
    name: initialData?.name || '',
    uid: initialData?.uid || generateUid(),
    description: initialData?.description || '',
    mode: initialData?.mode || 'report-only',
    shape_type: initialData?.shape_type || 'circle',
    lat: initialData?.lat || 0,
    lon: initialData?.lon || 0,
    radius: initialData?.radius || 100,
    detect_on: initialData?.detect_on || [],
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleChange = (field: keyof GeofenceFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDetectToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      detect_on: prev.detect_on.includes(type)
        ? prev.detect_on.filter(t => t !== type)
        : [...prev.detect_on, type],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter geofence name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="uid">UID *</Label>
        <Input
          id="uid"
          value={formData.uid}
          onChange={(e) => handleChange('uid', e.target.value)}
          placeholder="Unique identifier"
          disabled={isEdit}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mode">Mode</Label>
        <Select
          id="mode"
          value={formData.mode}
          onChange={(e) => handleChange('mode', e.target.value)}
        >
          <option value="active">Active</option>
          <option value="report-only">Report Only</option>
          <option value="inactive">Inactive</option>
          <option value="archive">Archive</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-sm font-medium mb-4">Shape Configuration</h3>

        <div className="space-y-2">
          <Label htmlFor="shape_type">Shape Type</Label>
          <Select
            id="shape_type"
            value={formData.shape_type}
            onChange={(e) => handleChange('shape_type', e.target.value)}
          >
            <option value="circle">Circle (TODO: Rectangle coming soon)</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="lat">Center Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={formData.lat}
              onChange={(e) => handleChange('lat', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lon">Center Longitude</Label>
            <Input
              id="lon"
              type="number"
              step="any"
              value={formData.lon}
              onChange={(e) => handleChange('lon', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="radius">Radius (meters)</Label>
          <Input
            id="radius"
            type="number"
            min="1"
            value={formData.radius}
            onChange={(e) => handleChange('radius', parseInt(e.target.value) || 100)}
          />
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-sm font-medium mb-4">Detection Types</h3>
        <div className="flex flex-wrap gap-4">
          {['inside', 'outside', 'enter', 'exit'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.detect_on.includes(type)}
                onChange={() => handleDetectToggle(type)}
              />
              <span className="text-sm capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </form>
  )
}