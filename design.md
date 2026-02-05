# Design Specification: Standalone GeoFence Service

## 1. Architecture Overview

### 1.1 GeoFence Engine (Tile38)
We leverage Tile38's native `SETHOOK` command to handle all geospatial monitoring logic. This offloads CPU-intensive calculations from the Python worker to Tile38.

**Data Flow**:
1.  **Ingest Worker**: Updates unit positions in Tile38 using `SETPOINT`.
2.  **API**: Creates geofences in Tile38 using `SETHOOK`.
3.  **Tile38**: Monitors positions. On breach, pushes JSON to RabbitMQ.

### 1.2 Alert Worker (Decoupled)
The Alert Worker is a separate process that listens to the `geofence_alerts` queue. It is entirely decoupled from the Ingest Worker and GeoFence Engine.

**Data Flow**:
1.  **Alert Worker**: Parses Tile38 JSON alerts.
2.  **Lookup**: Queries Postgres for notification rules associated with the Geofence ID.
3.  **Dispatch**: Sends notifications (Webhooks, Email, SMS) based on configured rules.

## 2. RabbitMQ Topology

*   **Exchange**: `geofence_alerts` (Type: `fanout`).
*   **Queue**: `geofence_alerts_queue` (Bound to `geofence_alerts`).
*   **Worker Exchange**: `cot_controller` (Existing, used for Ingest).

## 3. Tile38 Implementation Details

**Command Reference**: `SETHOOK name endpoint [META ...] NEARBY key FENCE`

*   **Endpoint**: `amqp://guest:guest@rabbitmq:5672/`
*   **Queue/Exchange**: The hook will be configured to push directly to the `geofence_alerts` exchange.
*   **Meta**: We pass `geofence_id` and `geofence_name` to help the Alert Worker identify the source.
*   **Monitoring**: `NEARBY points FENCE` (Monitors all points in the `points` collection against the hook's defined area).

## 4. Components

### 4.1 Ingest Worker
*   **Input**: CoT XML from `cot_controller` exchange.
*   **Action**: `SETPOINT units {uid} {lat} {lon}`.

### 4.2 API (FastAPI)
*   **POST /geofences**:
    1.  Validates shape data.
    2.  Saves to Postgres.
    3.  Calls `Tile38Service.create_hook()`.
*   **DELETE /geofences/{id}**:
    1.  Calls `Tile38Service.delete_hook()`.
    2.  Deletes from Postgres.

### 4.3 Alert Worker
*   **Input**: JSON messages from `geofence_alerts_queue`.
*   **Logic**:
    1.  Parse `geofence_id` from message.
    2.  Fetch `NotificationRules` from Postgres.
    3.  Execute notification dispatch.

## 5. Technical Stack Summary
*   **Backend**: FastAPI, SQLModel, `aio-pika`, `lxml`, `pyle38`.
*   **Database**: PostgreSQL 16+.
*   **Geospatial**: Tile38.
*   **Frontend**: React 18+, Tailwind CSS, Shadcn/UI, TanStack stack.
