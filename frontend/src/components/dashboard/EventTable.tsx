import { useEvents } from '../../hooks/useEvents'
import { formatRelativeTime } from '../../lib/utils'

interface GeofenceEvent {
  id: number
  unit_callsign?: string
  event_type: string
  geofence_name?: string
  timestamp: number
}

export function EventTable() {
  const { data: events, isLoading, error } = useEvents()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="rounded-lg border border-slate-200 dark:border-slate-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 border-b border-slate-100 dark:border-slate-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 py-4">Failed to load events</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Events</h2>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">When</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Callsign</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Event</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Geofence</th>
            </tr>
          </thead>
          <tbody>
            {events?.map((event: GeofenceEvent) => (
              <tr key={event.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {formatRelativeTime(event.timestamp)}
                </td>
                <td className="px-4 py-3 font-medium">{event.unit_callsign || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    event.event_type === 'enter' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    event.event_type === 'exit' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {event.event_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {event.geofence_name || `ID: ${event.id}`}
                </td>
              </tr>
            ))}
            {!events?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No events yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}