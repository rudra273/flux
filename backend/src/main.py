import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from src.posts.router import router as posts_router
from src.database import init_db, close_db, TORTOISE_ORM

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=False,
    add_exception_handlers=True,
)

app.include_router(posts_router, prefix="/posts", tags=["posts"])

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
