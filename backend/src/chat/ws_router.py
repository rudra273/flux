from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from src.users.service import get_current_user
from src.users.models import User
from .models import Channel, ChannelMember, Message
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel_id: int):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []
        self.active_connections[channel_id].append(websocket)

    def disconnect(self, websocket: WebSocket, channel_id: int):
        self.active_connections[channel_id].remove(websocket)

    async def broadcast(self, message: str, channel_id: int):
        for connection in self.active_connections.get(channel_id, []):
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: int, token: str):
    try:
        user = await get_current_user(token)
    except:
        await websocket.close(code=1008)  # Policy Violation
        return

    channel = await Channel.get_or_none(id=channel_id)
    if not channel:
        await websocket.close(code=1008)  # Policy Violation
        return

    if not await ChannelMember.exists(channel=channel, user=user):
        await websocket.close(code=1008)  # Policy Violation
        return

    await manager.connect(websocket, channel_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            new_message = await Message.create(channel=channel, user=user, content=message_data['content'])
            await manager.broadcast(json.dumps({
                "id": new_message.id,
                "content": new_message.content,
                "user": user.username,
                "created_at": new_message.created_at.isoformat()
            }), channel_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel_id)

        