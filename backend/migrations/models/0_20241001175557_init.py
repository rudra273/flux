from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "username" VARCHAR(50) NOT NULL UNIQUE,
    "email" VARCHAR(255)  UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "is_active" BOOL NOT NULL  DEFAULT True,
    "role" VARCHAR(20) NOT NULL  DEFAULT 'member'
);
CREATE TABLE IF NOT EXISTS "posts" (
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" INT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
