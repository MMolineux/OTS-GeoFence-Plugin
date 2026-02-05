import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Map as MapIcon } from 'lucide-react'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { MiniMap } from '../components/maps/MiniMap'
import { EventTable } from '../components/dashboard/EventTable'
import { useSocket } from '../hooks/useSocket'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Toaster, toast } from 'sonner'

export function Dashboard() {
  useSocket()

  useEffect(() => {
    const notifyNewEvent = () => {
      toast.success('New event received', {
        description: 'Check the event history table',
        duration: 3000,
      })
    }
    notifyNewEvent()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Toaster position="top-right" />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">GeoFence Monitoring Service</p>
          </div>
          <div className="flex gap-3">
            <Link to="/geofences">
              <Button variant="outline">
                <MapIcon className="w-4 h-4 mr-2" />
                Geofence Editor
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <StatsGrid />
          </div>
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-4 h-full">
                <h2 className="text-sm font-medium text-slate-500 mb-3">Geofence Overview</h2>
                <MiniMap />
              </CardContent>
            </Card>
          </div>
        </div>

        <EventTable />

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/geofences" className="text-sm text-blue-600 hover:underline">
            Manage Geofences →
          </Link>
          <Link to="/settings" className="text-sm text-blue-600 hover:underline">
            View Settings →
          </Link>
        </div>
      </div>
    </div>
  )
}