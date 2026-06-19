from django.db import models
from django.conf import settings


class ReleaseDrill(models.Model):
    """投产演练"""

    class Status(models.TextChoices):
        PLANNED = 'planned', '待演练'
        IN_PROGRESS = 'in_progress', '演练中'
        COMPLETED = 'completed', '已完成'
        FAILED = 'failed', '演练失败'

    name = models.CharField('演练名称', max_length=200)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='release_drills', verbose_name='所属项目',
    )
    planned_date = models.DateTimeField('计划演练时间')
    actual_date = models.DateTimeField('实际演练时间', null=True, blank=True)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.PLANNED,
    )
    checklist = models.JSONField('检查项', blank=True, default=list)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True,
        related_name='drill_participations', verbose_name='参与人',
    )
    result = models.TextField('演练结果', blank=True)
    notes = models.TextField('备注', blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_drills', verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '投产演练'
        verbose_name_plural = '投产演练'
        ordering = ['-planned_date']

    def __str__(self):
        return self.name


class ReleaseDeployment(models.Model):
    """投产指挥"""

    class Status(models.TextChoices):
        PENDING = 'pending', '待执行'
        IN_PROGRESS = 'in_progress', '进行中'
        COMPLETED = 'completed', '已完成'
        ROLLED_BACK = 'rolled_back', '已回滚'
        CANCELLED = 'cancelled', '已取消'

    name = models.CharField('投产名称', max_length=200)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='release_deployments', verbose_name='所属项目',
    )
    version = models.CharField('版本号', max_length=50, blank=True)
    planned_date = models.DateTimeField('计划投产时间')
    actual_date = models.DateTimeField('实际投产时间', null=True, blank=True)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.PENDING,
    )
    commander = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='commanded_deployments',
        verbose_name='指挥人',
    )
    rollback_plan = models.TextField('回滚方案', blank=True)
    result = models.TextField('投产结果', blank=True)
    notes = models.TextField('备注', blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_deployments', verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '投产指挥'
        verbose_name_plural = '投产指挥'
        ordering = ['-planned_date']

    def __str__(self):
        return self.name


class ReleaseStep(models.Model):
    """投产步骤"""

    class Status(models.TextChoices):
        PENDING = 'pending', '待执行'
        RUNNING = 'running', '执行中'
        SUCCESS = 'success', '成功'
        FAILED = 'failed', '失败'
        SKIPPED = 'skipped', '已跳过'

    deployment = models.ForeignKey(
        ReleaseDeployment, on_delete=models.CASCADE,
        related_name='steps', verbose_name='所属投产',
    )
    name = models.CharField('步骤名称', max_length=200)
    description = models.TextField('步骤说明', blank=True)
    order = models.IntegerField('执行顺序', default=0)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.PENDING,
    )
    executor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='release_steps',
        verbose_name='执行人',
    )
    duration_minutes = models.IntegerField('预计时长(分钟)', null=True, blank=True)
    output = models.TextField('执行输出', blank=True)
    started_at = models.DateTimeField('开始时间', null=True, blank=True)
    completed_at = models.DateTimeField('完成时间', null=True, blank=True)

    class Meta:
        verbose_name = '投产步骤'
        verbose_name_plural = '投产步骤'
        ordering = ['deployment', 'order']

    def __str__(self):
        return f'{self.deployment.name} - {self.name}'
