import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket, connectSocket, disconnectSocket, SOCKET_EVENTS } from '../lib/socket'
import { toast } from 'sonner'

export function useSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    connectSocket()

    const handleGeofenceCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.info('New geofence created')
    }

    const handleGeofenceUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.info('Geofence updated')
    }

    const handleGeofenceDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.info('Geofence deleted')
    }

    const handleEventNew = (event: { event_type: string; callsign?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success(`New event: ${event.event_type}${event.callsign ? ` - ${event.callsign}` : ''}`)
    }

    socket.on(SOCKET_EVENTS.GEOFENCE_CREATED, handleGeofenceCreated)
    socket.on(SOCKET_EVENTS.GEOFENCE_UPDATED, handleGeofenceUpdated)
    socket.on(SOCKET_EVENTS.GEOFENCE_DELETED, handleGeofenceDeleted)
    socket.on(SOCKET_EVENTS.EVENT_NEW, handleEventNew)

    return () => {
      socket.off(SOCKET_EVENTS.GEOFENCE_CREATED)
      socket.off(SOCKET_EVENTS.GEOFENCE_UPDATED)
      socket.off(SOCKET_EVENTS.GEOFENCE_DELETED)
      socket.off(SOCKET_EVENTS.EVENT_NEW)
      disconnectSocket()
    }
  }, [queryClient])

  return { isConnected: socket.connected }
}