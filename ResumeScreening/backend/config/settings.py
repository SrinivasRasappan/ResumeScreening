from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # OpenAI Configuration
    openai_api_key: str
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # CORS Configuration
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Load settings
settings = Settings()
