import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { DarkModeToggle } from "../components/settings/DarkModeToggle"
import { DrawerPrefs } from "../components/settings/DrawerPrefs"
import { ApiConfig } from "../components/settings/ApiConfig"

export function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your GeoFence Admin UI
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <DarkModeToggle />
          <DrawerPrefs />
          <ApiConfig />
        </div>
      </div>
    </div>
  )
}