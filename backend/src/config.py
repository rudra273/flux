import os
from dotenv import load_dotenv

load_dotenv()

def get_env_variable(var_name):
    value = os.getenv(var_name)
    if value is None:
        raise ValueError(f"Environment variable {var_name} is not set")
    return value


SECRET_KEY = get_env_variable("SECRET_KEY")

# Database configuration
DB_USER = get_env_variable("DB_USER")
DB_PASSWORD = get_env_variable("DB_PASSWORD")
DB_HOST = get_env_variable("DB_HOST")
DB_PORT = get_env_variable("DB_PORT")
DB_NAME = get_env_variable("DB_NAME")
DB_SSL_MODE = get_env_variable("DB_SSL_MODE")

# CORS configuration
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS").split(",")


DATABASE_URL = f"postgres://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"