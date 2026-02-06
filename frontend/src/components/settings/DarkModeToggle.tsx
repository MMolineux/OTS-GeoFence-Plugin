import { useTheme } from "../../hooks/useTheme"
import { Moon, Sun } from "lucide-react"
import { Switch } from "../ui/Switch"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui/Card"

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                {isDark ? "Using dark theme" : "Using light theme"}
              </p>
            </div>
          </div>
          <Switch checked={isDark} onChange={toggleTheme} />
        </div>
      </CardContent>
    </Card>
  )
}