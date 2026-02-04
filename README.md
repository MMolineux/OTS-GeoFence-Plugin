# Standalone GeoFence Monitoring Service

This is a decoupled, high-performance geospatial monitoring service designed to ingest CoT data via RabbitMQ and provide real-time geofencing alerts.

## Project Structure
- `backend/`: FastAPI application, SQLModel, and high-throughput CoT worker.
- `frontend/`: React admin dashboard built with Vite, Shadcn/UI, and TanStack.
- `docker-compose.yml`: Local development stack including PostgreSQL, Tile38, and the service components.

## Getting Started
### Prerequisites
- Docker & Docker Compose
- Python 3.12+ (for local backend development)
- Node.js (for local frontend development)

### Local Setup
1. Clone the repository.
2. Run the stack: `docker-compose up --build`
3. Access the API at `http://localhost:8000`
4. Access the Admin UI at `http://localhost:5173` (when running local dev server)

## Core Capabilities
- **High Throughput**: Optimized for 3,000 pkts/sec.
- **Auto-Registration**: Native support for TAK `__geofence` CoT messages.
- **Multi-Auth**: OIDC/JWT, API Tokens, and Basic Auth.
- **Geospatial Engine**: Powered by Tile38.

## Reference
Original plugin code can be found in the `old/` directory.
