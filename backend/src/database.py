from tortoise import Tortoise
from src.config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DB_SSL_MODE
import ssl
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Create an SSL context
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

TORTOISE_ORM = {
    "connections": {
        "default": {
            "engine": "tortoise.backends.asyncpg",
            "credentials": {
                "user": DB_USER,
                "password": DB_PASSWORD,
                "database": DB_NAME,
                "host": DB_HOST,
                "port": int(DB_PORT),
                "ssl": ssl_context if DB_SSL_MODE.lower() == "require" else None,
            }
        }
    },
    "apps": {
        "models": {
            "models": ["src.posts.models", "src.users.models", "aerich.models"],  # Include aerich models
            "default_connection": "default",
        },
    },
    "use_tz": False,
    "timezone": "UTC"
}



async def init_db():
    logger.info("Initializing database...")
    await Tortoise.init(config=TORTOISE_ORM)
    logger.info("Generating schemas...")
    await Tortoise.generate_schemas(safe=True)
    logger.info("Database initialization completed.")

async def close_db():
    logger.info("Closing database connections...")
    await Tortoise.close_connections()
    logger.info("Database connections closed.")
    

