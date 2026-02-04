from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, RedisDsn, field_validator
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "GeoFence Service"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/geofence"

    # Tile38
    TILE38_URL: str = "redis://localhost:9851"

    # RabbitMQ
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # Auth
    SECRET_KEY: str = "secret-key-for-jwt-development-only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OIDC
    OIDC_JWKS_URL: Optional[str] = None
    OIDC_ISSUER: Optional[str] = None

settings = Settings()
