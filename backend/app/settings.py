from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    supabase_url: str = ""
    supabase_anon_key: str = ""
    github_app_client_id: str = ""
    github_app_client_secret: str = ""
    github_app_id: str = ""
    github_app_private_key_path: str = ""
    frontend_url: str = "http://localhost:5173"


settings = Settings()
