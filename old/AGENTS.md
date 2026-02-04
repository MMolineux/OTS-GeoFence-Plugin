# Agent Guidelines: OTS-GeoFence-Plugin

This document provides essential information for AI agents contributing to the OTS-GeoFence-Plugin repository.

## 1. Project Overview
The OTS-GeoFence-Plugin is a server-side GeoFence monitoring plugin for OpenTakServer (OTS). It leverages Tile38 for high-performance geospatial indexing and RabbitMQ for CoT (Cursor on Target) event processing.

## 2. Environment & Setup
- **Language:** Python 3.10 to 3.13
- **Dependency Manager:** [Poetry](https://python-poetry.org/)
- **Core Technologies:**
  - **OpenTakServer:** Plugin-based architecture.
  - **Tile38:** Geospatial database and geofencing engine.
  - **RabbitMQ:** Message broker for CoT events.
  - **Pydantic v2:** Data validation and settings management.
  - **Flask:** Web UI and API routes.

### Installation
```bash
poetry install
```

## 3. Build, Lint, and Test Commands

### Build
To build the plugin package:
```bash
poetry build
```

### Linting & Formatting
The project does not currently have a strictly enforced linter configuration, but it follows PEP 8.
- **Formatting:** Use 4-space indentation. Maintain trailing commas in multiline collections.
- **Recommended Tooling:** If introducing linting, prefer `ruff` for speed and comprehensive coverage.

### Testing
There are currently no unit tests in the repository.
- **Command:** `pytest` (when tests are added).
- **Single Test:** `pytest tests/test_file.py::test_function`
- **Goal:** Aim for unit tests in `tests/` covering `core/services` and `core/entities`.

## 4. Code Style & Conventions

### Naming Conventions
- **Classes:** `PascalCase` (e.g., `GeoFencePlugin`, `NotificationService`)
- **Functions & Methods:** `snake_case` (e.g., `activate`, `process_message`)
- **Variables & Attributes:** `snake_case` (e.g., `url_prefix`, `config_path`)
- **Private Members:** Prefix with a single underscore (e.g., `_load_config`, `_t38_client`).

### Typing
- **Type Hints:** Required for all new function and method signatures.
- **Pydantic:** Use `pydantic.BaseModel` for all data transfer objects (DTOs) and configuration models.
- **Imports:** Use `from typing import ...` for standard type hints (e.g., `Optional`, `List`, `Dict`, `Literal`).

### Imports
Order imports according to PEP 8:
1. Standard library imports.
2. Related third-party imports (Flask, Pydantic, etc.).
3. Local application/library specific imports.

Example:
```python
import os
import pathlib

from flask import Blueprint, jsonify
from pydantic import BaseModel

from ots_geofence_plugin.core.entities.geofence import GeoFence
```

### Error Handling
- **Safety First:** Plugins run within the OpenTakServer process. Wrap entry points and Flask routes in `try...except` blocks to prevent a plugin crash from taking down the entire server.
- **Exception Scope:** Prefer catching `Exception` over `BaseException` unless specifically handling system-level signals.
- **Logging:** Use `opentakserver.extensions.colorlog` or `logger`.
  - Errors: `logger.error(f"Reason: {e}")`
  - Debugging: `logger.debug(traceback.format_exc())`

## 5. Architecture & Design Patterns

### Directory Structure
- `ots_geofence_plugin/main.py`: Plugin entry point and Flask route definitions.
- `ots_geofence_plugin/app/`: Application-layer logic (e.g., CoT processors).
- `ots_geofence_plugin/core/`:
    - `entities/`: Pydantic models and Enums.
    - `services/`: Business logic and core functionality.
    - `interfaces/`: (In progress) Abstract base classes.
- `ots_geofence_plugin/infra/`: External integrations (RabbitMQ workers, Tile38 clients).
- `ots_geofence_plugin/ui/`: Frontend assets (index.html, assets).

### Plugin Lifecycle
- `activate(self, app: Flask)`: Initialize the plugin, load config, and spawn background workers.
- `stop(self)`: Gracefully shut down background threads or connections.

### Background Tasks
- Use `gevent` or `threading.Thread` for non-blocking workers (like RabbitMQ listeners).
- Ensure background threads are marked as `daemon=True` where appropriate or explicitly stopped in `stop()`.

### Pydantic v2 Patterns
- Use `model_dump()` instead of `dict()`.
- Use `model_validate()` instead of `from_orm()`.
- Define field descriptions for complex config items.

## 6. OpenTakServer Specifics
- **Logging:** Use the logger provided by `opentakserver.extensions.colorlog`.
- **Security:** Protect Flask routes using `@roles_accepted("administrator")` or similar decorators from `flask_security`.
- **Config:** Merge `DefaultConfig` with user overrides from the OTS data folder (`config.yml`).

## 7. Development Best Practices
- **Incomplete Files:** Several files in the current codebase are placeholders (e.g., `config.py`, `cot_processor.py`). Complete these by following existing patterns.
- **CoT Handling:** Use `BeautifulSoup(..., "xml")` for parsing CoT XML, or use established OTS utilities if available.
- **RabbitMQ:** The plugin listens to the `cot_controller` exchange (fanout). Ensure unique queue names or auto-delete queues for plugin-specific listeners.
- **Tile38:** Use `pyle38` for async/sync interactions. Geofence hooks should be managed carefully to avoid duplicate registration.

