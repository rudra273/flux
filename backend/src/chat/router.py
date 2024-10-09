# chat/router.py

from fastapi import APIRouter, Depends, HTTPException
from src.users.service import get_current_user
from src.users.models import User
from .schemas import (ChannelCreate, ChannelResponse, 
                        ChannelDetailResponse, MessageCreate, 
                        MessageResponse, ChannelMemberResponse)
from .models import Channel, ChannelMember, Message
from typing import List

router = APIRouter()

@router.post("/channels", response_model=ChannelResponse)
async def create_channel(channel: ChannelCreate, current_user: User = Depends(get_current_user)):
    new_channel = await Channel.create(**channel.dict(), created_by_id=current_user.id)
    await ChannelMember.create(channel=new_channel, user=current_user, role="admin")
    return ChannelResponse(
        id=new_channel.id,
        name=new_channel.name,
        description=new_channel.description,
        is_public=new_channel.is_public,
        created_at=new_channel.created_at,
        created_by=current_user.username
    )

@router.get("/channels", response_model=List[ChannelResponse])
async def get_channels(current_user: User = Depends(get_current_user)):
    user_channels = await ChannelMember.filter(user=current_user).prefetch_related('channel', 'channel__created_by')
    return [
        ChannelResponse(
            id=member.channel.id,
            name=member.channel.name,
            description=member.channel.description,
            is_public=member.channel.is_public,
            created_at=member.channel.created_at,
            created_by=member.channel.created_by.username if member.channel.created_by else None
        )
        for member in user_channels
    ]

@router.get("/channels/{channel_id}", response_model=ChannelDetailResponse)
async def get_channel(channel_id: int, current_user: User = Depends(get_current_user)):
    channel = await Channel.get_or_none(id=channel_id).prefetch_related('members__user', 'messages__user', 'created_by')
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    if not await ChannelMember.exists(channel=channel, user=current_user):
        raise HTTPException(status_code=403, detail="You are not a member of this channel")
    
    return ChannelDetailResponse(
        id=channel.id,
        name=channel.name,
        description=channel.description,
        is_public=channel.is_public,
        created_at=channel.created_at,
        created_by=channel.created_by.username if channel.created_by else None,
        members=[ChannelMemberResponse(user=member.user.username, role=member.role) for member in channel.members],
        messages=[MessageResponse(id=msg.id, content=msg.content, user=msg.user.username, created_at=msg.created_at) for msg in channel.messages]
    )

@router.post("/channels/{channel_id}/messages", response_model=MessageResponse)
async def create_message(channel_id: int, message: MessageCreate, current_user: User = Depends(get_current_user)):
    channel = await Channel.get_or_none(id=channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    if not await ChannelMember.exists(channel=channel, user=current_user):
        raise HTTPException(status_code=403, detail="You are not a member of this channel")
    
    new_message = await Message.create(channel_id=channel_id, user_id=current_user.id, **message.dict())
    return MessageResponse(
        id=new_message.id,
        content=new_message.content,
        user=current_user.username,
        created_at=new_message.created_at
    )


@router.post("/channels/{channel_id}/join")
async def join_channel(channel_id: int, current_user: User = Depends(get_current_user)):
    channel = await Channel.get_or_none(id=channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    if not channel.is_public:
        raise HTTPException(status_code=403, detail="This channel is private")
    
    if await ChannelMember.exists(channel=channel, user=current_user):
        raise HTTPException(status_code=400, detail="Already a member of this channel")
    
    await ChannelMember.create(channel=channel, user=current_user, role="member")
    return {"message": "Successfully joined the channel"}

@router.delete("/channels/{channel_id}/leave")
async def leave_channel(channel_id: int, current_user: User = Depends(get_current_user)):
    channel = await Channel.get_or_none(id=channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    membership = await ChannelMember.get_or_none(channel=channel, user=current_user)
    if not membership:
        raise HTTPException(status_code=400, detail="Not a member of this channel")
    
    if membership.role == "admin" and await ChannelMember.filter(channel=channel, role="admin").count() == 1:
        raise HTTPException(status_code=400, detail="Cannot leave channel - you are the only admin")
    
    await membership.delete()
    return {"message": "Successfully left the channel"}



@router.get("/channels/search", response_model=List[ChannelResponse])
async def search_channels(query: str = "", current_user: User = Depends(get_current_user)):
    # Find all public channels matching the query
    public_channels = await Channel.filter(
        name__icontains=query, 
        is_public=True
    ).prefetch_related('created_by')

    # Find all private channels the user is a member of matching the query
    private_channels = await Channel.filter(
        name__icontains=query, 
        is_public=False, 
        members__user=current_user
    ).prefetch_related('created_by')

    # Combine the results
    channels = list(set(public_channels + private_channels))

    

    return [
        ChannelResponse(
            id=channel.id,
            name=channel.name,
            description=channel.description,
            is_public=channel.is_public,
            created_at=channel.created_at,
            created_by=channel.created_by.username
        )
        for channel in channels
    ]
