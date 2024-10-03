from tortoise.models import Model
from tortoise import fields
from src.models import TimestampMixin

class User(Model, TimestampMixin):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    email = fields.CharField(max_length=255, unique=True, null=True)
    password = fields.CharField(max_length=255)
    is_active = fields.BooleanField(default=True)
    role = fields.CharField(max_length=20, default="member")
    
    class Meta:
        table = "users"

    def __str__(self):
        return self.username