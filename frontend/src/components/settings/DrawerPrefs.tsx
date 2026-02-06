import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui/Card"
import { Input } from "../ui/Input"
import { Label } from "../ui/Label"

interface DrawerPrefs {
  width: number
}

export function DrawerPrefs() {
  const [prefs, setPrefs] = useState<DrawerPrefs>({ width: 400 })

  useEffect(() => {
    const stored = localStorage.getItem("drawerPrefs")
    if (stored) {
      setPrefs(JSON.parse(stored))
    }
  }, [])

  const handleWidthChange = (width: number) => {
    const newPrefs = { ...prefs, width }
    setPrefs(newPrefs)
    localStorage.setItem("drawerPrefs", JSON.stringify(newPrefs))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drawer Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="drawerWidth">Drawer Width (px)</Label>
          <Input
            id="drawerWidth"
            type="number"
            min="300"
            max="600"
            value={prefs.width}
            onChange={(e) =>
              handleWidthChange(parseInt(e.target.value) || 400)
            }
          />
          <p className="text-sm text-muted-foreground">
            Default: 400px. Range: 300-600px.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}