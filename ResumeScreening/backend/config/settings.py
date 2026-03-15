from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "null",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
