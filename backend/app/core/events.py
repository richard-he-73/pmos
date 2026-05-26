"""
WebSocket 事件广播系统
用于在数据变更时通知前端
"""

from typing import Any
from app.core.websocket import manager


class EventType:
    """事件类型常量"""
    PROJECT_CREATED = 'project.created'
    PROJECT_UPDATED = 'project.updated'
    PROJECT_DELETED = 'project.deleted'
    TASK_CREATED = 'task.created'
    TASK_UPDATED = 'task.updated'
    TASK_DELETED = 'task.deleted'
    TASK_ASSIGNED = 'task.assigned'
    RISK_CREATED = 'risk.created'
    RISK_UPDATED = 'risk.updated'
    RISK_MITIGATED = 'risk.mitigated'
    NOTIFICATION_CREATED = 'notification.created'
    USER_STATUS_CHANGED = 'user.status_changed'


async def broadcast_event(event_type: str, data: Any):
    """广播事件给所有连接的客户端"""
    await manager.broadcast_json({
        'type': event_type,
        'data': data,
        'timestamp': None,
    })


async def notify_user(user_id: str, event_type: str, data: Any):
    """通知特定用户"""
    await manager.notify_user(user_id, {
        'type': event_type,
        'data': data,
        'timestamp': None,
    })


async def notify_project_created(project: dict):
    """通知项目创建"""
    await broadcast_event(EventType.PROJECT_CREATED, {
        'project_id': project.get('id'),
        'project_name': project.get('name'),
    })


async def notify_project_updated(project: dict):
    """通知项目更新"""
    await broadcast_event(EventType.PROJECT_UPDATED, {
        'project_id': project.get('id'),
        'project_name': project.get('name'),
    })


async def notify_task_created(task: dict):
    """通知任务创建"""
    await broadcast_event(EventType.TASK_CREATED, {
        'task_id': task.get('id'),
        'task_title': task.get('title'),
        'project_id': task.get('project_id'),
    })


async def notify_task_updated(task: dict):
    """通知任务更新"""
    await broadcast_event(EventType.TASK_UPDATED, {
        'task_id': task.get('id'),
        'task_title': task.get('title'),
        'project_id': task.get('project_id'),
        'status': task.get('status'),
    })


async def notify_risk_created(risk: dict):
    """通知风险创建"""
    await broadcast_event(EventType.RISK_CREATED, {
        'risk_id': risk.get('id'),
        'risk_title': risk.get('title'),
        'project_id': risk.get('project_id'),
    })


async def notify_task_assigned(task: dict, assignee_id: str):
    """通知任务分配"""
    await notify_user(assignee_id, EventType.TASK_ASSIGNED, {
        'task_id': task.get('id'),
        'task_title': task.get('title'),
        'project_id': task.get('project_id'),
    })
