# Design Specification: Standalone GeoFence Service

## 1. Core Features

### 1.1 Native Auto-Registration
- **Description**: Automatically detects and registers `__geofence` CoT messages (type `u-d-g`) from TAK clients.
- **Behavior**: Newly detected fences are created in `Report-Only` mode by default.
- **Parsing**: Extracts boundary shapes (circular, polygonal) and metadata from the CoT XML.

### 1.2 Highly Configurable Event Handling
- **Monitoring Modes**: `Active`, `Report-Only`, `Inactive`, and `Archive`.
- **Trigger Types**: `enter`, `exit`, `cross`, `inside`, and `outside`.
- **Granular Filtering**: Filter notifications by:
  - Callsign (regex)
  - CoT Type (e.g., `a-f-G`)
  - Speed thresholds
  - Time-of-day windows

### 1.3 Multi-Channel Notifications
- **Supported Channels**: Webhooks (HTTP POST), Email (SMTP), SMS, Discord, Slack, and RabbitMQ re-broadcast.
- **Extensibility**: Interface-based design to allow rapid addition of new channels.

### 1.4 High-Throughput Ingestion
- **Target Performance**: Sustained 3,000 pkts/sec from 500+ emitters.
- **Implementation**: Asynchronous `aio-pika` consumer with high-performance XML parsing (`lxml`).
- **Optimization**: Zero-polling monitoring using Tile38 native Geofence Hooks.

### 1.5 Admin Dashboard
- **Tech Stack**: React + Vite + Shadcn/UI + TanStack (Query, Table, Router).
- **Map View**: Basic map component (Leaflet/MapLibre) to visualize geofence boundaries.
- **Management**: UI for CRUD operations on fences, notification rules, and viewing historical logs.

### 1.6 Modern Authentication
- **OIDC/JWKS**: Integration with providers like Dex or Keycloak.
- **API Tokens**: Support for headless/automated tool access.
- **Basic Auth**: Optional fallback for initial setup or local management.

## 2. Functional Requirements

- **FR1 (Performance)**: The system must sustain 3,000 messages per second under load.
- **FR2 (Decoupling)**: The system must operate independently of OpenTakServer codebase/utilities.
- **FR3 (Data Integrity)**: All configurations and breach events must be persisted in PostgreSQL.
- **FR4 (Real-time)**: Geofence breaches must trigger notifications with sub-second latency (excluding network transport).

## 3. User Stories

- **US1**: As an admin, I want to see all active geofences on a map to verify coverage.
- **US2**: As an operator, I want to create a geofence in ATAK and have the server automatically start logging its breaches.
- **US3**: As a developer, I want to use a single `docker-compose.yml` to spin up the entire development environment.
- **US4**: As an admin, I want to restrict notifications to only trigger when a specific unit type enters a restricted zone.

## 4. Technical Stack Summary
- **Backend**: FastAPI, SQLModel (SQLAlchemy + Pydantic v2), `aio-pika`, `lxml`.
- **Database**: PostgreSQL 16+.
- **Geospatial**: Tile38.
- **Frontend**: React 18+, Tailwind CSS, Shadcn/UI, TanStack stack.
