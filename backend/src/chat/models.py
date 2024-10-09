# chat/models.py

from tortoise import fields
from src.models import TimestampMixin
from tortoise.models import Model

class Channel(Model, TimestampMixin):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    description = fields.TextField(null=True)
    is_public = fields.BooleanField(default=True)
    created_by = fields.ForeignKeyField('models.User', related_name='created_channels')
    
    class Meta:
        table = "channels"

class ChannelMember(Model, TimestampMixin):
    id = fields.IntField(pk=True)
    channel = fields.ForeignKeyField('models.Channel', related_name='members')
    user = fields.ForeignKeyField('models.User', related_name='channel_memberships')
    role = fields.CharField(max_length=20, default="member")  # admin or member
    
    class Meta:
        table = "channel_members"
        unique_together = (("channel", "user"),)

class Message(Model, TimestampMixin):
    id = fields.IntField(pk=True)
    channel = fields.ForeignKeyField('models.Channel', related_name='messages')
    user = fields.ForeignKeyField('models.User', related_name='messages')
    content = fields.TextField()
    
    class Meta:
        table = "messages"
        