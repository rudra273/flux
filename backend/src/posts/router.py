import logging
from fastapi import APIRouter, HTTPException
from src.posts.models import Post
from src.posts.schemas import PostCreate, PostUpdate, PostInDB
from src.posts.exceptions import PostNotFoundError

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=PostInDB)
async def create_post_route(post: PostCreate):
    logger.info(f"Creating new post: {post.title}")
    return await Post.create(**post.dict())

@router.get("/{post_id}", response_model=PostInDB)
async def get_post_route(post_id: int):
    logger.info(f"Fetching post with id: {post_id}")
    post = await Post.get_or_none(id=post_id)
    if not post:
        logger.warning(f"Post with id {post_id} not found")
        raise PostNotFoundError(post_id)
    return post

@router.get("/", response_model=list[PostInDB])
async def get_all_posts_route():
    logger.info("Fetching all posts")
    return await Post.all()

@router.put("/{post_id}", response_model=PostInDB)
async def update_post_route(post_id: int, post_update: PostUpdate):
    logger.info(f"Updating post with id: {post_id}")
    post = await Post.get_or_none(id=post_id)
    if not post:
        logger.warning(f"Post with id {post_id} not found")
        raise PostNotFoundError(post_id)
    await post.update_from_dict(post_update.dict()).save()
    return post

@router.delete("/{post_id}")
async def delete_post_route(post_id: int):
    logger.info(f"Deleting post with id: {post_id}")
    post = await Post.get_or_none(id=post_id)
    if not post:
        logger.warning(f"Post with id {post_id} not found")
        raise PostNotFoundError(post_id)
    await post.delete()
    return {"message": "Post deleted successfully"} 


