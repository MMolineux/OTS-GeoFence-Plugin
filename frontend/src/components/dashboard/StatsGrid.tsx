import { StatsCard } from './StatsCard'
import { Activity, Users, AlertTriangle, Percent } from 'lucide-react'
import { useStats } from '../../hooks/useStats'

export function StatsGrid() {
  const { data: stats, isLoading, error } = useStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load stats
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Geofences"
        value={stats?.active_geofences || 0}
        icon={Activity}
      />
      <StatsCard
        title="Events Today"
        value={stats?.events_today || 0}
        icon={AlertTriangle}
      />
      <StatsCard
        title="Units Tracked"
        value={stats?.units_tracked || 0}
        icon={Users}
      />
      <StatsCard
        title="Breach Rate"
        value={`${stats?.breach_rate || 0}%`}
        icon={Percent}
      />
    </div>
  )
}