from django.db import models
from django.conf import settings


class Consultant(models.Model):
    """咨询人员"""
    GENDER_CHOICES = [('male', '男'), ('female', '女')]
    RANK_CHOICES = [
        ('director', '咨询总监'),
        ('senior', '高级咨询师'),
        ('consultant', '咨询师'),
        ('assistant', '咨询助理'),
        ('other', '其他'),
    ]
    STATUS_CHOICES = [
        ('pending_entry', '待入场'),
        ('entered', '已入场'),
        ('pending_exit', '待离场'),
        ('exited', '已离场'),
    ]

    name = models.CharField('姓名', max_length=50)
    gender = models.CharField('性别', max_length=10, choices=GENDER_CHOICES)
    age = models.IntegerField('年龄', null=True, blank=True)
    rank = models.CharField('职级', max_length=30, choices=RANK_CHOICES, default='consultant')
    status = models.CharField('可用状态', max_length=30, choices=STATUS_CHOICES, default='pending_entry')
    entry_date = models.DateField('入场日期', null=True, blank=True)
    exit_date = models.DateField('离场日期', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '咨询人员'
        verbose_name_plural = '咨询人员'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ProjectResource(models.Model):
    """项目资源（人员进出管理）"""
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='resources', verbose_name='项目',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='人员',
    )
    role_in_project = models.CharField('项目角色', max_length=100, blank=True)
    join_date = models.DateField('加入日期')
    leave_date = models.DateField('离开日期', null=True, blank=True)
    allocation = models.IntegerField('投入比例(%)', default=100)
    notes = models.TextField('备注', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '项目资源'
        verbose_name_plural = '项目资源'
        ordering = ['project', 'join_date']
        unique_together = ['project', 'user', 'join_date']

    def __str__(self):
        return f'{self.user} @ {self.project.name}'


class ResourceChangeLog(models.Model):
    """资源变更日志"""
    resource = models.ForeignKey(
        ProjectResource, on_delete=models.CASCADE,
        related_name='change_logs', verbose_name='资源',
    )
    change_type = models.CharField('变更类型', max_length=50)  # join/leave/role_change
    operator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='操作人',
    )
    detail = models.JSONField('变更详情', blank=True, default=dict)
    changed_at = models.DateTimeField('变更时间', auto_now_add=True)

    class Meta:
        verbose_name = '资源变更日志'
        verbose_name_plural = '资源变更日志'
        ordering = ['-changed_at']
