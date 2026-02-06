import { useEffect } from "react"
import { Link } from "react-router-dom"
import { Settings, Map as MapIcon } from "lucide-react"
import { StatsGrid } from "../components/dashboard/StatsGrid"
import { MiniMap } from "../components/maps/MiniMap"
import { EventTable } from "../components/dashboard/EventTable"
import { useSocket } from "../hooks/useSocket"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Toaster, toast } from "sonner"

export function Dashboard() {
  useSocket()

  useEffect(() => {
    const notifyNewEvent = () => {
      toast.success("New event received", {
        description: "Check the event history table",
        duration: 3000,
      })
    }
    notifyNewEvent()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              GeoFence Monitoring Service
            </p>
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
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle className="text-base">Geofence Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 h-[calc(100%-60px)]">
                <MiniMap />
              </CardContent>
            </Card>
          </div>
        </div>

        <EventTable />

        <div className="mt-8 flex justify-center gap-6">
          <Link
            to="/geofences"
            className="text-sm text-primary hover:underline transition-colors"
          >
            Manage Geofences →
          </Link>
          <Link
            to="/settings"
            className="text-sm text-primary hover:underline transition-colors"
          >
            View Settings →
          </Link>
        </div>
      </div>
    </div>
  )
}