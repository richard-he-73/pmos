from django.db import models
from django.conf import settings


class BusinessRequirement(models.Model):
    """业务需求"""

    class Status(models.TextChoices):
        PROPOSED = 'proposed', '已提议'
        APPROVED = 'approved', '已批准'
        REJECTED = 'rejected', '已驳回'
        DEFERRED = 'deferred', '已推迟'

    code = models.CharField('需求编号', max_length=50, unique=True)
    name = models.CharField('需求名称', max_length=200)
    description = models.TextField('描述', blank=True)
    source = models.CharField('来源', max_length=50, blank=True)
    priority = models.CharField('优先级', max_length=20, default='medium')
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.PROPOSED,
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='business_requirements', verbose_name='所属项目',
    )
    submitter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='提交人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '业务需求'
        verbose_name_plural = '业务需求'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.code}] {self.name}'


class SoftwareRequirement(models.Model):
    """软件需求"""

    class Status(models.TextChoices):
        PROPOSED = 'proposed', '已提议'
        APPROVED = 'approved', '已批准'
        IN_DEVELOPMENT = 'in_development', '开发中'
        TESTING = 'testing', '测试中'
        COMPLETED = 'completed', '已完成'
        REJECTED = 'rejected', '已驳回'

    code = models.CharField('需求编号', max_length=50, unique=True)
    name = models.CharField('需求名称', max_length=200)
    description = models.TextField('描述', blank=True)
    business_requirement = models.ForeignKey(
        BusinessRequirement, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='software_requirements',
        verbose_name='关联业务需求',
    )
    module = models.CharField('功能模块', max_length=100, blank=True)
    priority = models.CharField('优先级', max_length=20, default='medium')
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.PROPOSED,
    )
    version = models.CharField('目标版本', max_length=50, blank=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='负责人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '软件需求'
        verbose_name_plural = '软件需求'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.code}] {self.name}'
