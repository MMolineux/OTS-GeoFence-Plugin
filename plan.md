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
- [x] Initialize project structure (monorepo style).
- [x] Setup Docker Compose with PostgreSQL 16, Tile38, and a placeholder for the API.
- [x] Implement FastAPI core with SQLModel and migration support (Alembic).
- [x] Configure Dependency Injection for DB sessions and Tile38 clients.

### Phase 2: Multi-Auth Security Layer
- [ ] Implement JWT/JWKS validation for OIDC providers.
- [ ] Implement API Token management and validation.
- [ ] Implement Basic Auth for bootstrap/internal access.

### Phase 3: High-Throughput Worker & Ingestion
- [x] Implement `asyncio` worker with `aio-pika` optimized for 3,000 pkts/sec.
- [x] Create a high-performance `lxml` based CoT parser.
- [x] Implement native `__geofence` auto-registration logic.
- [x] Setup Tile38 Geofence Hooks for zero-polling monitoring.

### Phase 4: Modern Admin UI
- [ ] Scaffold React app with Vite, Tailwind, and Shadcn/UI.
- [ ] Integrate MapLibre/Leaflet for geofence visualization.
- [ ] Build TanStack Table for high-performance log viewing.

---


## 3. Directory Structure (Current)
```text
backend/app/
├── api/                # REST Endpoints
├── core/               # Security, Config, Logging
├── db/                 # SQLModel Setup & Migrations
├── models/             # Pydantic & DB Schemas
├── services/           # Business Logic (Tile38, Notif)
├── workers/            # Async CoT Consumers
│   ├── ingest/          # CoT ingestion worker
│   └── alert/          # Alert processing worker
└── pyproject.toml
frontend/               # React Application (future)
docker-compose.yml      # Full Stack Orchestration
plan.md                 # This file
```


## 4. Key Design Considerations
- **Independence**: The service must not import `opentakserver` or any internal OTS utilities.
- **Extensibility**: The notification system should be interface-based to allow adding new channels (Discord, Slack, etc.) easily.
- **Resilience**: The RabbitMQ worker should handle connection drops gracefully using retry logic.
- **Performance**: Use Tile38's `NEARBY` or `WITHIN` geofence hooks for zero-polling monitoring.

---


## 5. Technical Details

### RabbitMQ Topology
- **COT_RABBITMQ_URL**: `amqp://guest:guest@rabbitmq:5672/` - For ingest worker listening to `cot_controller` exchange
- **GEOFENCE_RABBITMQ_URL**: `amqp://guest:guest@rabbitmq:5672/` - For alert worker and Tile38 SETHOOK
- **GEOFENCE_EXCHANGE**: `geofence_alerts` - Fanout exchange for geofence alerts

### Workers Structure
- `workers/ingest/main.py`: Listens to `cot_controller` exchange, parses CoT XML, updates unit positions in Tile38
- `workers/alert/main.py`: Listens to `geofence_alerts` exchange, processes Tile38 hook events, logs alerts


## 6. Outstanding Tasks (TODOs)

### geofences.py Endpoints
1. **Line 35**: `make this operation atomic`
   - Issue: Creating geofence registers hook in DB then Tile38. If Tile38 fails, DB and Tile38 are out of sync.
   - Solution: Implement distributed transaction pattern or compensation logic.

2. **Line 95**: `Logic for Tile38 Hook updates would go here`
   - Issue: Updating a geofence (PATCH) doesn't update the Tile38 hook.
   - Solution: Delete old hook and create new one when shape/mode changes.

3. **Line 97**: `hooks are immutable and deleted/recreated if shape changes`
   - This is the current workaround but needs to be implemented.

### Alert Worker
4. **TODO**: Implement notification dispatch logic
   - Issue: `alert/main.py` logs alerts but doesn't send notifications.
   - Solution: Lookup notification rules in Postgres and dispatch to configured channels (email, webhook, etc.).

### Tile38 Service
5. **TODO**: Support additional shape types
   - Issue: Currently only Circle shapes are supported.
   - Solution: Add support for Polygon, Rectangle using Tile38 WITHIN/INTERSECTS.

6. **TODO**: Handle hook creation failures gracefully
   - Issue: If SETHOOK fails, there's no retry logic.
   - Solution: Implement exponential backoff retry for hook creation.

---


## 7. Known Issues

### RabbitMQ Precondition Errors
- When restarting workers, old exchanges/queues with different durability settings may cause `PRECONDITION_FAILED` errors.
- Resolution: Manually delete the exchange/queue via RabbitMQ Management API:
  ```bash
  curl -u guest:guest -X DELETE "http://localhost:15672/api/exchanges/%2f/geofence_alerts"
  curl -u guest:guest -X DELETE "http://localhost:15672/api/queues/%2f/geofence_alerts_queue"
  ```
