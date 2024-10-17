import logging
from fastapi import APIRouter, HTTPException, Depends
from src.posts.models import Post
from src.posts.schemas import PostCreate, PostUpdate, PostInDB, PostWithUser
from src.posts.exceptions import PostNotFoundError
from src.users.service import get_current_user
from src.users.models import User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=PostInDB)
async def create_post_route(post: PostCreate, current_user: User = Depends(get_current_user)):
    logger.info(f"Creating new post: {post.title}")
    post_dict = post.dict()
    post_dict['user'] = current_user
    return await Post.create(**post_dict)


@router.get("/{post_id}", response_model=PostWithUser)
async def get_post_route(post_id: int):
    logger.info(f"Fetching post with id: {post_id}")
    
    # Fetch the post by ID
    post = await Post.get_or_none(id=post_id)
    
    if not post:
        logger.warning(f"Post with id {post_id} not found")
        raise PostNotFoundError(post_id)
    
    # Fetch the user associated with the post
    user = await User.get(id=post.user_id)
    
    # Return the post data along with the username
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "username": user.username,  
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }




@router.get("/", response_model=list[PostWithUser])
async def get_all_posts():
    logger.info("Fetching all posts")
    
    # Fetch all posts
    posts = await Post.all()
    
    # Create a list to store the response data
    result = []
    
    # Loop through each post and fetch the corresponding username from the User table
    for post in posts:
        # Fetch the user using the user_id from the post
        user = await User.get(id=post.user_id)
        
        # Append the post data with the username to the result
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "username": user.username,  # Get username from User table
            "created_at": post.created_at,
            "updated_at": post.updated_at,
        })
    
    return result


@router.put("/{post_id}", response_model=PostInDB)
async def update_post_route(post_id: int, post_update: PostUpdate, current_user: User = Depends(get_current_user)):
    logger.info(f"Updating post with id: {post_id}")
    post = await Post.get_or_none(id=post_id, user=current_user)
    if not post:
        logger.warning(f"Post with id {post_id} not found or doesn't belong to the current user")
        raise PostNotFoundError(post_id)
    await post.update_from_dict(post_update.dict(exclude_unset=True)).save()
    return post

@router.delete("/{post_id}")
async def delete_post_route(post_id: int, current_user: User = Depends(get_current_user)):
    logger.info(f"Deleting post with id: {post_id}")
    post = await Post.get_or_none(id=post_id, user=current_user)
    if not post:
        logger.warning(f"Post with id {post_id} not found or doesn't belong to the current user")
        raise PostNotFoundError(post_id)
    await post.delete()
    return {"message": "Post deleted successfully"}
