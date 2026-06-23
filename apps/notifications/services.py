import re
from django.conf import settings

NOTIFICATION_TYPES = {
    'task_assigned': '任务分配',
    'task_updated': '任务更新',
    'bug_reported': '缺陷报告',
    'bug_assigned': '缺陷分配',
    'project_created': '项目创建',
    'project_updated': '项目更新',
    'project_member_added': '项目成员',
    'requirement_updated': '需求更新',
    'plan_updated': '计划更新',
    'release_planned': '投产计划',
    'system_notice': '系统通知',
}


def notify_user(recipient_id, type, related_obj=None, extra=''):
    """发送通知给单个用户"""
    title = _build_title(type, related_obj, extra)
    related_type = related_obj._meta.model_name if related_obj else ''
    related_id = related_obj.id if related_obj else None
    project_id = _extract_project_id(related_obj)
    content = _build_content(type, related_obj)
    _dispatch(recipient_id, type, title, content, related_type, related_id, project_id)


def notify_users(user_ids, type, related_obj=None, extra=''):
    """发送通知给多个用户"""
    if not user_ids:
        return
    title = _build_title(type, related_obj, extra)
    related_type = related_obj._meta.model_name if related_obj else ''
    related_id = related_obj.id if related_obj else None
    project_id = _extract_project_id(related_obj)
    content = _build_content(type, related_obj)
    _dispatch_bulk(user_ids, type, title, content, related_type, related_id, project_id)


def _extract_project_id(obj):
    """从关联对象中提取项目ID"""
    if obj is None:
        return None
    if hasattr(obj, '_meta') and obj._meta.model_name == 'project':
        return obj.id
    if hasattr(obj, 'project_id') and obj.project_id is not None:
        return obj.project_id
    if hasattr(obj, 'project') and obj.project is not None:
        return obj.project_id if hasattr(obj, 'project_id') else (obj.project.id if obj.project else None)
    return None


# ── 模板引擎 ──

_VARIABLE_MAP = {}
"""动态变量名到对象属性的映射，见 _build_var_map()"""


def _build_var_map(obj):
    """根据对象类型构建变量名 → 属性值/方法的映射"""
    m = {}

    # 通用字段
    m['name'] = getattr(obj, 'name', None) or getattr(obj, 'title', None) or ''
    m['description'] = getattr(obj, 'description', '') or ''
    m['code'] = getattr(obj, 'code', '') or ''

    # 状态/类型等带 choices 的字段 → 显示中文值
    for field_name in ['status', 'type', 'priority', 'severity', 'project_type', 'contract_status']:
        raw = getattr(obj, field_name, None)
        if raw is not None:
            # 尝试获取 get_xxx_display()
            display_method = getattr(obj, f'get_{field_name}_display', None)
            m[field_name] = display_method() if display_method else raw
        else:
            m[field_name] = ''

    # 日期字段文本化
    for field_name in ['start_date', 'end_date', 'due_date', 'planned_date', 'created_at']:
        val = getattr(obj, field_name, None)
        m[field_name] = str(val)[:10] if val else ''

    # 模型特定别名
    model_name = obj._meta.model_name if hasattr(obj, '_meta') else ''
    if model_name == 'task':
        m['task_name'] = m['name']
        m['priority'] = getattr(obj, 'get_priority_display', lambda: '')() or ''
        m['assignee'] = getattr(obj, 'assignee_name', '') or ''
        m['due_date'] = str(getattr(obj, 'due_date', '') or '')[:10]
    elif model_name == 'bug':
        m['bug_title'] = m['name']
        m['module'] = getattr(obj, 'module', '') or ''
        m['source'] = getattr(obj, 'source', '') or ''
        # name 对 Bug 是 title
        m['name'] = getattr(obj, 'title', '') or ''
    elif model_name == 'project':
        m['project_name'] = m['name']
        m['project_code'] = m['code']
        m['project_type'] = getattr(obj, 'get_project_type_display', lambda: '')() or ''
    elif model_name == 'plan':
        m['plan_name'] = m['name']
        m['plan_type'] = getattr(obj, 'get_type_display', lambda: '')() or ''
        m['progress'] = str(getattr(obj, 'progress', '') or '')

    # 尝试提取 project name
    if hasattr(obj, 'project') and obj.project:
        m['project_name'] = getattr(obj.project, 'name', '') or m.get('project_name', '')

    return m


def _render_template(template_str, obj):
    """渲染模板字符串，替换 {{变量名}} 为实际值"""
    if not template_str or not obj:
        return template_str or ''

    var_map = _build_var_map(obj)

    def replacer(match):
        var_name = match.group(1).strip()
        return var_map.get(var_name, '')

    return re.sub(r'\{\{(\w+)\}\}', replacer, template_str)


def _get_template(type_code):
    """获取匹配的通知模板（按 code）"""
    try:
        from .models import NotificationTemplate
        return NotificationTemplate.objects.filter(code=type_code).first()
    except Exception:
        return None


def _build_title(type, obj, extra=''):
    """构建通知标题 — 优先使用模板，回退硬编码"""
    template = _get_template(type)
    if template and template.title_template:
        rendered = _render_template(template.title_template, obj)
        if rendered.strip():
            return rendered.strip()

    # 回退：原有硬编码逻辑
    name = getattr(obj, 'name', '') or getattr(obj, 'title', '') or str(obj) if obj else ''
    prefix = NOTIFICATION_TYPES.get(type, type)
    return f'{prefix}: {name}' if name else prefix


def _build_content(type, obj):
    """构建通知内容 — 优先使用模板，回退对象描述"""
    template = _get_template(type)
    if template and template.content_template:
        rendered = _render_template(template.content_template, obj)
        if rendered.strip():
            return rendered.strip()

    # 回退
    if not obj:
        return ''
    desc = getattr(obj, 'description', '') or ''
    return desc[:200] if desc else str(obj)[:200]


def _dispatch(recipient_id, type, title, content, related_type, related_id, project_id=None):
    """同步发送通知"""
    from .models import Notification
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        Notification.objects.create(
            recipient=User.objects.get(id=recipient_id),
            type=type, title=title, content=content,
            related_type=related_type, related_id=related_id,
            project_id=project_id,
        )
    except Exception:
        pass


def _dispatch_bulk(user_ids, type, title, content, related_type, related_id, project_id=None):
    """批量同步发送"""
    from .models import Notification
    from django.contrib.auth import get_user_model
    User = get_user_model()
    users = User.objects.filter(id__in=user_ids)
    notifications = [
        Notification(
            recipient=user, type=type, title=title, content=content,
            related_type=related_type, related_id=related_id,
            project_id=project_id,
        )
        for user in users
    ]
    Notification.objects.bulk_create(notifications)
