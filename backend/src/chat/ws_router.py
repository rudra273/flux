from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from src.users.service import get_current_user
from src.users.models import User
from .models import Channel, ChannelMember, Message
import json
import asyncio

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[tuple[WebSocket, User]]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, channel_id: int, user: User):
        await websocket.accept()
        async with self._lock:
            if channel_id not in self.active_connections:
                self.active_connections[channel_id] = []
            self.active_connections[channel_id].append((websocket, user))

    async def disconnect(self, websocket: WebSocket, channel_id: int):
        async with self._lock:
            if channel_id in self.active_connections:
                self.active_connections[channel_id] = [
                    conn for conn in self.active_connections[channel_id]
                    if conn[0] != websocket
                ]
                if not self.active_connections[channel_id]:
                    del self.active_connections[channel_id]

    async def broadcast(self, message: str, channel_id: int, exclude: WebSocket = None):
        if channel_id in self.active_connections:
            for connection, _ in self.active_connections[channel_id]:
                if connection != exclude:
                    try:
                        await connection.send_text(message)
                    except WebSocketDisconnect:
                        await self.disconnect(connection, channel_id)
                    except Exception as e:
                        print(f"Error broadcasting message: {e}")

manager = ConnectionManager()

@router.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: int, token: str):
    try:
        user = await get_current_user(token)
        channel = await Channel.get_or_none(id=channel_id)
        if not channel or not await ChannelMember.exists(channel=channel, user=user):
            await websocket.close(code=1008)
            return

        await manager.connect(websocket, channel_id, user)
        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                new_message = await Message.create(
                    channel=channel,
                    user=user,
                    content=message_data['content']
                )
                response = json.dumps({
                    "id": str(new_message.id),
                    "content": new_message.content,
                    "user": user.username,
                    "created_at": new_message.created_at.isoformat()
                })
                await manager.broadcast(response, channel_id)
        except WebSocketDisconnect:
            await manager.disconnect(websocket, channel_id)
        except Exception as e:
            print(f"Error in websocket connection: {e}")
            await manager.disconnect(websocket, channel_id)
    except Exception as e:
        print(f"Error establishing websocket connection: {e}")
        await websocket.close(code=1008) 