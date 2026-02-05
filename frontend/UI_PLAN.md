# GeoFence Admin UI - Implementation Plan

## Pages Structure

```
/ (Dashboard)
/geofences (Geofence Editor)
/settings (Settings)
```

---

## 1. Dashboard Page

### Layout
```
┌─────────────────────────────────────────────────┐
│ Logo + Title + Nav Links (Dashboard, Settings)   │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│  Stats   │  Mini Map Card                        │
│  Cards   │  (Large card, ~50% of right column)   │
│          │                                       │
├──────────┴───────────────────────────────────────┤
│                                               │
│  Event History Table                            │
│                                               │
└─────────────────────────────────────────────────┘
```

### Stats Cards (Grid of 4)
- **Active Geofences**: Count in `active` mode
- **Events Today**: Count with timestamp >= midnight
- **Units Tracked**: Unique UIDs in last 24h
- **Breach Rate**: Percentage of breach events

### Mini Map Card
- Leaflet, dark theme
- Shows geofence circles only
- Click → opens full Geofence Editor
- Size: Larger than stats cards, takes ~50% of right column height

### Event History Table
- TanStack Table
- Columns: When (relative), Callsign, Event Type, Geofence Name
- Real-time: Socket.io for live updates
- Toast notification on new events

---

## 2. Geofence Editor Page

### Layout
```
┌─────────────────────────────────────────────────┐
│ Title + "Back to Dashboard" link                  │
├─────────────────────────────────────────────────┤
│           Interactive Map (Full Width)           │
│                                                │
│  Radial Menu (on left-click):                   │
│  ┌─────────────────┐                           │
│  │      Add        │                           │
│  ├─────────────────┤                           │
│  │     Edit        │                           │
│  ├─────────────────┤                           │
│  │     Move        │                           │
│  ├─────────────────┤                           │
│  │     Delete      │                           │
│  └─────────────────┘                           │
├─────────────────────────────────────────────────┤
│  Drawer (Right slide-over, ~400px):              │
│  Form: Name, UID, Mode, Description, Circle Config│
│  Detections: Inside/Outside/Enter/Exit checkboxes│
│  Buttons: Submit, Cancel, Reset                 │
└─────────────────────────────────────────────────┘
```

### Radial Menu
- Trigger: Left-click on empty map space
- Buttons: Add, Edit, Move, Delete
- **Add**: Opens drawer, pre-fills center from click
- **Edit**: Opens drawer with selected geofence data
- **Move**: Drag mode, updates center on drop (requires `PATCH /move` endpoint)
- **Delete**: Confirmation dialog → DELETE endpoint

### Drawer
- Slide-over (covers partial content)
- Persists form data until submitted/reset
- Width: ~400px, responsive

---

## 3. Settings Page

```
┌─────────────────────────────────────────────────┐
│ Title + "Back to Dashboard" link                 │
├─────────────────────────────────────────────────┤
│  Theme                                          │
│  [x] Dark Mode Toggle                           │
│                                                │
│  Drawer Preferences                             │
│  ○ Slide-over  ○ Push                          │
│  Width: [____] px (default: 400)               │
│                                                │
│  API Configuration (read-only)                  │
│  API URL: http://localhost:8000                │
│  WebSocket URL: ws://localhost:8000/ws         │
└─────────────────────────────────────────────────┘
```

---

## Backend Enhancements Required

1. **`GET /api/v1/stats`** - Returns active_geofences, events_today, units_tracked, breach_rate

2. **`GET /api/v1/events?limit=50`** - Returns GeofenceEvent with geofence.name joined

3. **`PATCH /api/v1/geofences/{id}/move`** - Updates center lat/lon, recreates hook

4. **Socket.io Server**:
   - Emit: `geofence:created`, `geofence:updated`, `geofence:deleted`, `event:new`
   - Library: `python-socketio[asyncio]`
