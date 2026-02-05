import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { geofenceApi, GeofenceCreateData } from '../lib/api'
import { toast } from 'sonner'

interface Geofence {
  id: number
  name: string
  uid: string
  description?: string
  mode: string
  shape_type: string
  shape_data: string
  detect_on: string[]
  created_at: number
}

export function useGeofences(offset = 0, limit = 100) {
  return useQuery({
    queryKey: ['geofences', offset, limit],
    queryFn: async () => {
      const { data } = await geofenceApi.list(offset, limit)
      return data as Geofence[]
    },
  })
}

export function useGeofence(id: number) {
  return useQuery({
    queryKey: ['geofences', id],
    queryFn: async () => {
      const { data } = await geofenceApi.get(id)
      return data as Geofence
    },
    enabled: !!id,
  })
}

export function useCreateGeofence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GeofenceCreateData) => geofenceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('Geofence created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create geofence: ${error.message}`)
    },
  })
}

export function useUpdateGeofence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GeofenceCreateData> }) =>
      geofenceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('Geofence updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update geofence: ${error.message}`)
    },
  })
}

export function useDeleteGeofence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => geofenceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('Geofence deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete geofence: ${error.message}`)
    },
  })
}

export function useMoveGeofence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, lat, lon }: { id: number; lat: number; lon: number }) =>
      geofenceApi.move(id, lat, lon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('Geofence moved successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to move geofence: ${error.message}`)
    },
  })
}