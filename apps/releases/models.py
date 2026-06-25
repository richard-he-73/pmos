from django.db import models
from django.conf import settings


class ReleaseDrill(models.Model):
    """投产演练"""

    class TargetEnvironmentChoices(models.TextChoices):
        TEST = 'test', '测试环境'
        PRE_PROD = 'pre_prod', '预发布环境'
        GRAY_RELEASE = 'gray_release', '生产灰度环境'
        OTHER = 'other', '其他环境'

    class ScenarioChoices(models.TextChoices):
        NORMAL_DEPLOY = 'normal_deploy', '正常部署'
        SERVICE_DOWN = 'service_down', '服务宕机'
        ROLLBACK = 'rollback', '异常回滚'
        BUSINESS_VERIFY = 'business_verify', '业务验证'
        MONITOR_ALERT = 'monitor_alert', '监控告警'
        OTHER = 'other', '其他'

    class ConclusionChoices(models.TextChoices):
        PASS = 'pass', '通过'
        CONDITIONAL_PASS = 'conditional_pass', '条件通过'
        FAIL = 'fail', '不通过'
        PENDING = 'pending', '待判定'

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='release_drills',
        verbose_name='所属项目',
    )
    name = models.CharField('演练名称', max_length=300)
    description = models.TextField('演练描述', blank=True, default='')
    target_environment = models.CharField(
        '目标环境', max_length=20, choices=TargetEnvironmentChoices.choices,
        default=TargetEnvironmentChoices.TEST,
    )
    scenario = models.CharField(
        '演练场景', max_length=20, choices=ScenarioChoices.choices,
        default=ScenarioChoices.NORMAL_DEPLOY,
    )
    steps = models.TextField('演练步骤', blank=True, default='')
    prerequisites = models.TextField('前置条件', blank=True, default='')
    expected_results = models.TextField('预期结果', blank=True, default='')
    criteria = models.TextField('判定标准', blank=True, default='')
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='drill_assignees',
        verbose_name='负责人',
    )
    stakeholders = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True,
        related_name='drill_stakeholders', verbose_name='干系人',
    )
    conclusion = models.CharField(
        '演练结论', max_length=20, choices=ConclusionChoices.choices,
        default=ConclusionChoices.PENDING,
    )
    notes = models.TextField('备注说明', blank=True, default='')
    attachment = models.FileField('附件', upload_to='drill_attachments/', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '投产演练'
        verbose_name_plural = '投产演练'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ReleasePlan(models.Model):
    """投产计划"""

    class ReleaseTypeChoices(models.TextChoices):
        REGULAR = 'regular', '常规发布'
        HOTFIX = 'hotfix', '紧急修复'
        NON_FUNCTIONAL = 'non_functional', '非功能变更'
        INFRASTRUCTURE = 'infrastructure', '基础设施变更'

    class TargetEnvironmentChoices(models.TextChoices):
        PRE_PROD = 'pre_prod', '预发布环境'
        GRAY_RELEASE = 'gray_release', '生产灰度环境'
        PRODUCTION = 'production', '生产环境'

    class DeploymentMethodChoices(models.TextChoices):
        COLD_DEPLOY = 'cold_deploy', '停机冷部署'
        ONLINE_DEPLOY = 'online_deploy', '联机热部署'

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='release_plans',
        verbose_name='所属项目',
    )
    name = models.CharField('计划名称', max_length=300)
    release_type = models.CharField(
        '发布类型', max_length=20, choices=ReleaseTypeChoices.choices,
        default=ReleaseTypeChoices.REGULAR,
    )
    target_environment = models.CharField(
        '目标环境', max_length=20, choices=TargetEnvironmentChoices.choices,
        default=TargetEnvironmentChoices.PRODUCTION,
    )
    related_system = models.CharField('关联系统', max_length=200, blank=True, default='')
    deployment_method = models.CharField(
        '部署方式', max_length=20, choices=DeploymentMethodChoices.choices,
        default=DeploymentMethodChoices.COLD_DEPLOY,
    )
    planned_start_time = models.DateTimeField('计划开始时间', null=True, blank=True)
    expected_end_time = models.DateTimeField('预期结束时间', null=True, blank=True)
    content = models.TextField('上线内容', blank=True, default='')
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='plan_assignees',
        verbose_name='负责人',
    )
    stakeholders = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True,
        related_name='plan_stakeholders', verbose_name='干系人',
    )
    notes = models.TextField('备注说明', blank=True, default='')
    attachment = models.FileField('附件', upload_to='plan_attachments/', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '投产计划'
        verbose_name_plural = '投产计划'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
