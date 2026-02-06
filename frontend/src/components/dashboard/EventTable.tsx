import { useEvents } from "../../hooks/useEvents"
import { formatRelativeTime } from "../../lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/Card"

interface GeofenceEvent {
  id: number
  unit_callsign?: string
  event_type: string
  geofence_name?: string
  timestamp: number
}

function EventRow({ event }: { event: GeofenceEvent }) {
  const getEventColor = (type: string) => {
    switch (type) {
      case "enter":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "exit":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground w-24">
          {formatRelativeTime(event.timestamp)}
        </span>
        <span className="font-medium w-32">
          {event.unit_callsign || "-"}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getEventColor(
            event.event_type
          )}`}
        >
          {event.event_type}
        </span>
        <span className="text-sm text-muted-foreground">
          {event.geofence_name || `ID: ${event.id}`}
        </span>
      </div>
    </div>
  )
}

export function EventTable() {
  const { data: events, isLoading, error } = useEvents()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse mb-2" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load events
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="divide-y divide-border">
            {events.map((event: GeofenceEvent) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No events yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}