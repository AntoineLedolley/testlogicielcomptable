from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://cogirbook:password@localhost:5432/cogirbook"
    anthropic_api_key: str = ""
    secret_key: str = "change-me-in-production"
    debug: bool = True

    class Config:
        env_file = "../../.env"
        extra = "ignore"


settings = Settings()
