# src/posts/service.py
from src.posts.models import Post
from src.posts.schemas import PostCreate, PostUpdate
from src.exceptions import NotFoundError

async def create_post(post: PostCreate) -> Post:
    return await Post.create(**post.dict())

async def get_post(post_id: int) -> Post:
    post = await Post.get_or_none(id=post_id)
    if not post:
        raise NotFoundError(f"Post with id {post_id} not found")
    return post

async def get_all_posts() -> list[Post]:
    return await Post.all()

async def update_post(post_id: int, post_update: PostUpdate) -> Post:
    post = await get_post(post_id)
    await post.update_from_dict(post_update.dict()).save()
    return post

async def delete_post(post_id: int) -> None:
    post = await get_post(post_id)
    await post.delete()

