# chat/router.py

from fastapi import APIRouter, Depends, HTTPException
from src.users.service import get_current_user
from src.users.models import User
from .schemas import (ChannelCreate, ChannelResponse, 
                        ChannelDetailResponse, MessageCreate, 
                        MessageResponse, ChannelMemberResponse)
from .models import Channel, ChannelMember, Message
from typing import List
import logging

logger = logging.getLogger(__name__)


router = APIRouter()


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



# Important: Place the search endpoint BEFORE any parameterized routes
@router.get("/channels/search", response_model=List[ChannelResponse])
async def search_channels(query: str = "", current_user: User = Depends(get_current_user)):
    logger.info(f"Searching channels with query: {query} by user: {current_user.username}")
    try:
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

        # Combine and deduplicate results
        channels = list({channel.id: channel for channel in public_channels + private_channels}.values())

        logger.info(f"Found {len(channels)} channels matching query: {query}")

        response = [
            ChannelResponse(
                id=channel.id,
                name=channel.name,
                description=channel.description,
                is_public=channel.is_public,
                created_at=channel.created_at,
                created_by=channel.created_by.username if channel.created_by else None
            )
            for channel in channels
        ]
        
        return response
    except Exception as e:
        logger.error(f"Error searching channels: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error searching channels")

@router.post("/channels", response_model=ChannelResponse)
async def create_channel(channel: ChannelCreate, current_user: User = Depends(get_current_user)):
    logger.info(f"Creating new channel: {channel.name} by user: {current_user.username}")
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
    logger.info(f"Fetching channels for user: {current_user.username}")
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
    logger.info(f"Fetching channel {channel_id} for user: {current_user.username}")
    
    # Get the channel with all related data
    channel = await Channel.get_or_none(id=channel_id).prefetch_related(
        'members__user', 
        'messages__user', 
        'created_by'
    )
    
    if not channel:
        logger.warning(f"Channel {channel_id} not found")
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Check if user is a member
    is_member = await ChannelMember.exists(channel=channel, user=current_user)
    
    # If it's a private channel and user is not a member, deny access
    if not channel.is_public and not is_member:
        logger.warning(f"User {current_user.username} attempted to access private channel {channel_id}")
        raise HTTPException(
            status_code=403, 
            detail="This is a private channel. You need to be a member to view details."
        )
    
    # For public channels or if user is a member, return full details
    members = [
        ChannelMemberResponse(
            user=member.user.username,
            role=member.role
        ) for member in channel.members
    ]
    
    # Only include messages if user is a member
    messages = []
    if is_member:
        messages = [
            MessageResponse(
                id=msg.id,
                content=msg.content,
                user=msg.user.username,
                created_at=msg.created_at
            ) for msg in channel.messages
        ]
    
    logger.info(f"Successfully fetched channel {channel_id} details for user {current_user.username}")
    
    return ChannelDetailResponse(
        id=channel.id,
        name=channel.name,
        description=channel.description,
        is_public=channel.is_public,
        created_at=channel.created_at,
        created_by=channel.created_by.username if channel.created_by else None,
        members=members,
        messages=messages
    )
