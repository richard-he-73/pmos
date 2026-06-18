from django.db import models
from django.conf import settings


class Project(models.Model):
    """项目"""

    class Status(models.TextChoices):
        PLANNING = 'planning', '规划中'
        ACTIVE = 'active', '进行中'
        CLOSED = 'closed', '已结束'

    name = models.CharField('项目名称', max_length=200)
    code = models.CharField('项目编号', max_length=50, unique=True)
    description = models.TextField('描述', blank=True)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices,
        default=Status.PLANNING,
    )
    start_date = models.DateField('开始日期', null=True, blank=True)
    end_date = models.DateField('结束日期', null=True, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='owned_projects', verbose_name='项目负责人',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_projects', verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '项目'
        verbose_name_plural = '项目'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.code}] {self.name}'


class ProjectMember(models.Model):
    """项目成员"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        verbose_name='用户',
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE,
        related_name='members', verbose_name='项目',
    )
    role = models.ForeignKey(
        'accounts.Role', on_delete=models.CASCADE, verbose_name='角色',
    )
    join_date = models.DateField('加入日期', auto_now_add=True)
    leave_date = models.DateField('离开日期', null=True, blank=True)
    is_active = models.BooleanField('是否在职', default=True)

    class Meta:
        verbose_name = '项目成员'
        verbose_name_plural = '项目成员'
        unique_together = ['user', 'project']
        ordering = ['project', 'user']

    def __str__(self):
        return f'{self.user} @ {self.project.name}'
