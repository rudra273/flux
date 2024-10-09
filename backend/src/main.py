import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from src.database import init_db, close_db, TORTOISE_ORM

# routers import
from src.posts.router import router as posts_router
from src.users.router import router as users_router
from src.chat import router as chat_router
from src.chat import ws_router as chat_ws_router

from src.config import CORS_ALLOW_ORIGINS


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup database
register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=False,
    add_exception_handlers=True,
)


# Register routers
app.include_router(posts_router, prefix="/posts", tags=["posts"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(chat_router.router, prefix="/chat", tags=["chat"])
app.include_router(chat_ws_router.router, prefix="/chat", tags=["chat"])


# Setup events
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up the application")
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down the application")
    await close_db()

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the Flux API"}
