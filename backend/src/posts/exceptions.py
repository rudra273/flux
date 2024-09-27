from fastapi import HTTPException

class PostNotFoundError(HTTPException):
    def __init__(self, post_id: int):
        super().__init__(status_code=404, detail=f"Post with id {post_id} not found")
        