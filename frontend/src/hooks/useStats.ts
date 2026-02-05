import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../lib/api'

interface Stats {
  active_geofences: number
  events_today: number
  units_tracked: number
  breach_rate: number
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await statsApi.get()
      return data as Stats
    },
    refetchInterval: 30000,
  })
}