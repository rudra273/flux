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
        

class Profile(Model, TimestampMixin):
    id = fields.IntField(pk=True)
    user = fields.OneToOneField('models.User', on_delete=fields.CASCADE, related_name='profile')
    first_name = fields.CharField(max_length=50, null=True)
    last_name = fields.CharField(max_length=50, null=True)
    bio = fields.TextField(null=True)
    dob = fields.DateField(null=True)
    
    class Meta:
        table = "profiles"

    def __str__(self):
        return f"Profile for {self.user.username}"
