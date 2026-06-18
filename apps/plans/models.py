from django.db import models
from django.conf import settings


class Plan(models.Model):
    """计划（三级结构：里程碑→分组→详细计划）"""

    class PlanType(models.TextChoices):
        MILESTONE = 'milestone', '里程碑'
        GROUP = 'group', '分组计划'
        DETAIL = 'detail', '详细计划'

    class Status(models.TextChoices):
        DRAFT = 'draft', '草稿'
        IN_PROGRESS = 'in_progress', '进行中'
        COMPLETED = 'completed', '已完成'
        DELAYED = 'delayed', '已延期'

    name = models.CharField('计划名称', max_length=200)
    type = models.CharField('类型', max_length=20, choices=PlanType.choices)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children', verbose_name='上级计划',
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='plans', verbose_name='所属项目',
    )
    start_date = models.DateField('计划开始日期')
    end_date = models.DateField('计划结束日期')
    actual_end_date = models.DateField('实际结束日期', null=True, blank=True)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.DRAFT,
    )
    progress = models.IntegerField('进度(%)', default=0)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='负责人',
    )
    description = models.TextField('描述', blank=True)
    sort_order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '计划'
        verbose_name_plural = '计划'
        ordering = ['project', 'sort_order', 'start_date']

    def __str__(self):
        return f'[{self.get_type_display()}] {self.name}'


class Task(models.Model):
    """任务"""

    class Status(models.TextChoices):
        TODO = 'todo', '待办'
        IN_PROGRESS = 'in_progress', '进行中'
        DONE = 'done', '已完成'
        CLOSED = 'closed', '已关闭'

    class Priority(models.TextChoices):
        URGENT = 'urgent', '紧急'
        HIGH = 'high', '高'
        MEDIUM = 'medium', '中'
        LOW = 'low', '低'

    name = models.CharField('任务名称', max_length=200)
    description = models.TextField('描述', blank=True)
    plan = models.ForeignKey(
        Plan, on_delete=models.CASCADE,
        related_name='tasks', verbose_name='所属计划',
    )
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.TODO,
    )
    priority = models.CharField(
        '优先级', max_length=20, choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='tasks', verbose_name='负责人',
    )
    start_date = models.DateField('开始日期', null=True, blank=True)
    due_date = models.DateField('截止日期', null=True, blank=True)
    estimated_hours = models.DecimalField(
        '预估工时', max_digits=6, decimal_places=1,
        null=True, blank=True,
    )
    actual_hours = models.DecimalField(
        '实际工时', max_digits=6, decimal_places=1,
        null=True, blank=True,
    )
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='subtasks', verbose_name='父任务',
    )
    sort_order = models.IntegerField('排序', default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_tasks', verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '任务'
        verbose_name_plural = '任务'
        ordering = ['plan', 'sort_order']

    def __str__(self):
        return self.name
