# Project Transition Plan: Standalone GeoFence Service

This document outlines the architectural transition of the OTS-GeoFence-Plugin from an OpenTakServer (OTS) plugin to a standalone, decoupled microservice.

## 1. Architectural Vision
The new service will be a modern, high-performance geospatial monitoring engine that operates independently of OTS, communicating only via RabbitMQ for CoT data ingestion.

### Tech Stack
- **Backend**: FastAPI (Python 3.12+), SQLModel (SQLAlchemy + Pydantic), `aio-pika` (Async RabbitMQ).
- **Database**: PostgreSQL (Configuration & Logs).
- **Geospatial Engine**: Tile38.
- **Frontend**: React (Vite), Tailwind CSS, Shadcn/UI, TanStack (Query, Table, Router).
- **Authentication**: Multi-strategy (OIDC/JWKS, API Token, Basic Auth).
- **Infrastrucutre**: Docker Compose.

---

## 2. Implementation Phases

### Phase 1: Backend & Infrastructure Scaffold
- [ ] Initialize project structure (monorepo style).
- [ ] Setup Docker Compose with PostgreSQL 16, Tile38, and a placeholder for the API.
- [ ] Implement FastAPI core with SQLModel and migration support (Alembic).
- [ ] Configure Dependency Injection for DB sessions and Tile38 clients.

### Phase 2: Multi-Auth Security Layer
- [ ] Implement JWT/JWKS validation for OIDC providers.
- [ ] Implement API Token management and validation.
- [ ] Implement Basic Auth for bootstrap/internal access.

### Phase 3: High-Throughput Worker & Ingestion
- [ ] Implement `asyncio` worker with `aio-pika` optimized for 3,000 pkts/sec.
- [ ] Create a high-performance `lxml` based CoT parser.
- [ ] Implement native `__geofence` auto-registration logic.
- [ ] Setup Tile38 Geofence Hooks for zero-polling monitoring.

### Phase 4: Modern Admin UI
- [ ] Scaffold React app with Vite, Tailwind, and Shadcn/UI.
- [ ] Integrate MapLibre/Leaflet for geofence visualization.
- [ ] Build TanStack Table for high-performance log viewing.

---

## 3. Detailed Directory Structure (Proposed)
```text
/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # REST Endpoints
│   │   ├── core/           # Security, Config, Logging
│   │   ├── db/             # SQLModel Setup & Migrations
│   │   ├── models/         # Pydantic & DB Schemas
│   │   ├── services/       # Business Logic (Tile38, Notif)
│   │   └── worker/         # Async CoT Consumer
│   └── pyproject.toml
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI Library (Shadcn)
│   │   ├── hooks/          # Data Fetching (TanStack)
│   │   └── pages/          # Admin Views
│   └── package.json
├── docker-compose.yml      # Full Stack Orchestration
└── plan.md                 # This file
```

## 4. Key Design Considerations
- **Independence**: The service must not import `opentakserver` or any internal OTS utilities.
- **Extensibility**: The notification system should be interface-based to allow adding new channels (Discord, Slack, etc.) easily.
- **Resilience**: The RabbitMQ worker should handle connection drops gracefully using retry logic.
- **Performance**: Use Tile38's `NEARBY` or `WITHIN` geofence hooks for zero-polling monitoring.

