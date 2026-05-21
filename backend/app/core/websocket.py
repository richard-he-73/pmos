"""
WebSocket 连接管理器
用于管理活跃 WebSocket 连接并支持广播消息
"""

from typing import Dict, List, Set
from fastapi import WebSocket
import json


class ConnectionManager:
    """WebSocket 连接管理器"""

    def __init__(self):
        # user_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # 广播监听器集合
        self.broadcast_listeners: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, user_id: str):
        """接受 WebSocket 连接"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    async def disconnect(self, websocket: WebSocket, user_id: str):
        """断开 WebSocket 连接"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        self.broadcast_listeners.discard(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """发送个人消息"""
        await websocket.send_text(message)

    async def send_personal_json(self, data: dict, websocket: WebSocket):
        """发送个人 JSON 消息"""
        await websocket.send_json(data)

    async def broadcast(self, message: str):
        """广播消息给所有连接"""
        disconnected = []
        for user_id, connections in list(self.active_connections.items()):
            for connection in connections:
                try:
                    await connection.send_text(message)
                except Exception:
                    disconnected.append((connection, user_id))

        # 清理断开的连接
        for conn, uid in disconnected:
            await self.disconnect(conn, uid)

    async def broadcast_json(self, data: dict):
        """广播 JSON 数据"""
        await self.broadcast(json.dumps(data))

    async def notify_user(self, user_id: str, data: dict):
        """通知特定用户"""
        if user_id in self.active_connections:
            message = json.dumps(data)
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    disconnected.append((connection, user_id))

            for conn, uid in disconnected:
                await self.disconnect(conn, uid)

    def get_active_user_count(self) -> int:
        """获取活跃用户数"""
        return len(self.active_connections)

    def get_connection_count(self) -> int:
        """获取总连接数"""
        return sum(len(conns) for conns in self.active_connections.values())


# 全局单例
manager = ConnectionManager()
