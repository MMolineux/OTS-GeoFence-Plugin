import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function ApiConfig() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">API URL</p>
          <p className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
            {API_URL}/api/v1
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">WebSocket URL</p>
          <p className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
            {SOCKET_URL}/socket.io
          </p>
        </div>
      </CardContent>
    </Card>
  )
}