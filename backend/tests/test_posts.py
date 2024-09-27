import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from tortoise.contrib.test import initializer, finalizer

from src.main import app
from src.posts.models import Post
from src.database import TORTOISE_ORM

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="module")
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture(scope="module")
async def initialize_tests(request):
    initializer(
        modules=TORTOISE_ORM["apps"]["models"]["models"],
        db_url="sqlite://:memory:",
        app_label="models",
    )
    yield
    finalizer()

@pytest.mark.asyncio
async def test_create_post(async_client, initialize_tests):
    response = await async_client.post("/posts/", json={"title": "Test Post", "content": "This is a test post"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Post"
    assert data["content"] == "This is a test post"
    assert "id" in data

@pytest.mark.asyncio
async def test_get_post(async_client, initialize_tests):
    # Create a post first
    create_response = await async_client.post("/posts/", json={"title": "Test Post", "content": "This is a test post"})
    post_id = create_response.json()["id"]

    # Now try to get the post
    response = await async_client.get(f"/posts/{post_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Post"
    assert data["content"] == "This is a test post"
    assert data["id"] == post_id

@pytest.mark.asyncio
async def test_get_all_posts(async_client, initialize_tests):
    # Create multiple posts
    await async_client.post("/posts/", json={"title": "Test Post 1", "content": "Content 1"})
    await async_client.post("/posts/", json={"title": "Test Post 2", "content": "Content 2"})

    response = await async_client.get("/posts/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # There should be at least 2 posts
    assert all(isinstance(post, dict) for post in data)  # All items should be dictionaries

@pytest.mark.asyncio
async def test_update_post(async_client, initialize_tests):
    # Create a post first
    create_response = await async_client.post("/posts/", json={"title": "Original Title", "content": "Original content"})
    post_id = create_response.json()["id"]

    # Update the post
    update_response = await async_client.put(f"/posts/{post_id}", json={"title": "Updated Title", "content": "Updated content"})
    assert update_response.status_code == 200
    updated_data = update_response.json()
    assert updated_data["title"] == "Updated Title"
    assert updated_data["content"] == "Updated content"

    # Verify the update
    get_response = await async_client.get(f"/posts/{post_id}")
    assert get_response.status_code == 200
    get_data = get_response.json()
    assert get_data["title"] == "Updated Title"
    assert get_data["content"] == "Updated content"

@pytest.mark.asyncio
async def test_delete_post(async_client, initialize_tests):
    # Create a post first
    create_response = await async_client.post("/posts/", json={"title": "To Be Deleted", "content": "This post will be deleted"})
    post_id = create_response.json()["id"]

    # Delete the post
    delete_response = await async_client.delete(f"/posts/{post_id}")
    assert delete_response.status_code == 200

    # Try to get the deleted post
    get_response = await async_client.get(f"/posts/{post_id}")
    assert get_response.status_code == 404  # Not Found