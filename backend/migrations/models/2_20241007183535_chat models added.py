from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "channels" (
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_public" BOOL NOT NULL  DEFAULT True,
    "created_by_id" INT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
        CREATE TABLE IF NOT EXISTS "channel_members" (
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "role" VARCHAR(20) NOT NULL  DEFAULT 'member',
    "channel_id" INT NOT NULL REFERENCES "channels" ("id") ON DELETE CASCADE,
    "user_id" INT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "uid_channel_mem_channel_93bf6b" UNIQUE ("channel_id", "user_id")
);
        CREATE TABLE IF NOT EXISTS "messages" (
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "channel_id" INT NOT NULL REFERENCES "channels" ("id") ON DELETE CASCADE,
    "user_id" INT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "channels";
        DROP TABLE IF EXISTS "channel_members";
        DROP TABLE IF EXISTS "messages";"""
