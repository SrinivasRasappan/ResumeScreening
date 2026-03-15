from typing import List, Optional
from pydantic import root_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: Optional[str] = None
    dry_run: bool = False
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

    @root_validator(pre=True)
    def validate_api_key_or_dry_run(cls, values):
        dry_run = values.get("dry_run") or False
        api_key = values.get("anthropic_api_key")

        if not dry_run and not api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY must be set unless DRY_RUN is enabled. "
                "To start the server without a key, set DRY_RUN=true."
            )

        return values

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
