import logging
from tortoise.models import Model
from tortoise import fields
from src.models import TimestampMixin

logger = logging.getLogger(__name__)

class Post(Model, TimestampMixin):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    content = fields.TextField()
  
    class Meta:
        table = "posts"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        logger.info(f"Post instance created: {self.title}")

        