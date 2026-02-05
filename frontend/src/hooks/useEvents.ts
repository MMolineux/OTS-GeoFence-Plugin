import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '../lib/api'

interface GeofenceEvent {
  id: number
  geofence_id: number
  geofence_name?: string
  unit_uid: string
  unit_callsign?: string
  event_type: string
  timestamp: number
  raw_detail?: string
}

export function useEvents(offset = 0, limit = 50) {
  return useQuery({
    queryKey: ['events', offset, limit],
    queryFn: async () => {
      const { data } = await eventsApi.list(offset, limit)
      return data as GeofenceEvent[]
    },
  })
}