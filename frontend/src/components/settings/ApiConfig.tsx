import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui/Card"

const API_URL = import.meta.env.VITE_API_URL || ""
const SOCKET_URL = import.meta.env.VITE_API_URL || ""

export function ApiConfig() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">API URL</p>
          <p className="font-mono text-sm bg-muted p-2 rounded">
            {API_URL || "/proxy"}/api/v1
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            WebSocket URL
          </p>
          <p className="font-mono text-sm bg-muted p-2 rounded">
            {SOCKET_URL || "/proxy"}/socket.io
          </p>
        </div>
      </CardContent>
    </Card>
  )
}