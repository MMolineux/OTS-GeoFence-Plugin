import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DarkModeToggle } from '../components/settings/DarkModeToggle'
import { DrawerPrefs } from '../components/settings/DrawerPrefs'
import { ApiConfig } from '../components/settings/ApiConfig'

export function Settings() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your GeoFence Admin UI</p>
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