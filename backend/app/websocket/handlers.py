from typing import Any, Dict

import socketio

# Create a Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

# Example WebSocket event handlers


@sio.event
async def connect(sid: str, environ: Dict[str, Any]):
    """Handle client connection."""
    print(f"Client {sid} connected")
    await sio.emit("connected", {"message": "Welcome to Doqu!"}, room=sid)


@sio.event
async def disconnect(sid: str):
    """Handle client disconnection."""
    print(f"Client {sid} disconnected")
