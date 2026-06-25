from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class TestEnvironment(models.Model):
    """测试环境"""

    class Status(models.TextChoices):
        PLANNED = 'planned', '计划'
        ACTIVE = 'active', '启用'
        INACTIVE = 'inactive', '停用'
        DISCARDED = 'discarded', '废弃'

    name = models.CharField('环境名称', max_length=200)
    description = models.TextField('环境描述', blank=True, default='')
    config_info = models.TextField('配置信息', blank=True, default='')
    db_info = models.TextField('数据库信息', blank=True, default='')
    address_info = models.TextField('地址信息', blank=True, default='')
    status = models.CharField(
        '环境状态', max_length=20, choices=Status.choices, default=Status.PLANNED,
    )
    notes = models.TextField('备注说明', blank=True, default='')
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='test_environments', verbose_name='所属项目',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '测试环境'
        verbose_name_plural = '测试环境'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TestCase(models.Model):
    """测试用例"""

    class Type(models.TextChoices):
        FUNCTIONAL = 'functional', '功能测试'
        API = 'api', '接口测试'
        PERFORMANCE = 'performance', '性能测试'
        SECURITY = 'security', '安全测试'
        OTHER = 'other', '其他'

    class Priority(models.TextChoices):
        P0 = 'p0', 'P0-致命'
        P1 = 'p1', 'P1-高'
        P2 = 'p2', 'P2-中'
        P3 = 'p3', 'P3-低'

    class Status(models.TextChoices):
        DRAFT = 'draft', '草稿'
        ACTIVE = 'active', '启用'
        INACTIVE = 'inactive', '停用'
        DISCARDED = 'discarded', '废弃'

    name = models.CharField('用例名称', max_length=200)
    type = models.CharField(
        '用例类型', max_length=20, choices=Type.choices, default=Type.FUNCTIONAL,
    )
    module = models.CharField('所属模块', max_length=100, blank=True, default='')
    test_steps = models.TextField('测试步骤', blank=True, default='')
    expected_result = models.TextField('预期结果', blank=True, default='')
    requirement_baseline = models.ForeignKey(
        'requirements.RequirementBaseline', on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='需求基线',
    )
    related_requirements = models.ManyToManyField(
        'requirements.Requirement', blank=True,
        verbose_name='关联需求',
    )
    priority = models.CharField(
        '优先级', max_length=10, choices=Priority.choices, default=Priority.P2,
    )
    status = models.CharField(
        '用例状态', max_length=20, choices=Status.choices, default=Status.ACTIVE,
    )
    test_document = models.FileField(
        '测试文档', upload_to='testing/test_cases/', blank=True,
    )
    notes = models.TextField('备注说明', blank=True, default='')
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='test_cases', verbose_name='所属项目',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '测试用例'
        verbose_name_plural = '测试用例'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TestPlan(models.Model):
    """测试计划"""

    name = models.CharField('计划名称', max_length=200)
    goal = models.TextField('计划目标', blank=True, default='')
    start_date = models.DateField('开始日期', null=True, blank=True)
    end_date = models.DateField('结束日期', null=True, blank=True)
    test_cases = models.ManyToManyField(
        TestCase, blank=True,
        verbose_name='测试用例',
    )
    test_environment = models.ForeignKey(
        TestEnvironment, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='测试环境',
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='test_plan_assignees',
        verbose_name='测试负责人',
    )
    stakeholders = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True,
        related_name='test_plan_stakeholders',
        verbose_name='干系人',
    )
    notes = models.TextField('备注说明', blank=True, default='')
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='test_plans', verbose_name='所属项目',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '测试计划'
        verbose_name_plural = '测试计划'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TestExecution(models.Model):
    """测试执行"""

    class Result(models.TextChoices):
        PASS = 'pass', '通过'
        FAIL = 'fail', '失败'
        BLOCKED = 'blocked', '阻塞'
        SKIPPED = 'skipped', '跳过'

    test_plan = models.ForeignKey(
        TestPlan, on_delete=models.CASCADE,
        related_name='executions', verbose_name='计划名称',
    )
    test_case = models.ForeignKey(
        TestCase, on_delete=models.CASCADE,
        related_name='executions', verbose_name='关联用例',
    )
    executor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='test_executions',
        verbose_name='执行人',
    )
    execution_date = models.DateField('执行日期', null=True, blank=True)
    result = models.CharField(
        '执行结果', max_length=20, choices=Result.choices, default=Result.PASS,
    )
    evidence = models.FileField(
        '执行凭证', upload_to='testing/evidences/', blank=True,
    )
    notes = models.TextField('备注说明', blank=True, default='')
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='test_executions', verbose_name='所属项目',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '测试执行'
        verbose_name_plural = '测试执行'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.test_plan.name} - {self.test_case.name}'


class TestDefect(models.Model):
    """测试缺陷"""

    class Severity(models.TextChoices):
        FATAL = 'fatal', '致命'
        SERIOUS = 'serious', '严重'
        NORMAL = 'normal', '一般'
        SUGGESTION = 'suggestion', '建议'

    class Priority(models.TextChoices):
        P0 = 'p0', 'P0-致命'
        P1 = 'p1', 'P1-高'
        P2 = 'p2', 'P2-中'
        P3 = 'p3', 'P3-低'

    class Status(models.TextChoices):
        REPRODUCING = 'reproducing', '复现中'
        LOCATED = 'located', '已定位'
        RETESTING = 'retesting', '复测中'
        SUSPENDED = 'suspended', '已挂起'
        RESOLVED = 'resolved', '已解决'

    name = models.CharField('缺陷名称', max_length=200)
    description = models.TextField('缺陷描述', blank=True, default='')
    related_test_case = models.ForeignKey(
        TestCase, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='关联用例',
    )
    severity = models.CharField(
        '严重程度', max_length=20, choices=Severity.choices, default=Severity.NORMAL,
    )
    priority = models.CharField(
        '优先级', max_length=10, choices=Priority.choices, default=Priority.P2,
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='test_defects',
        verbose_name='负责人',
    )
    status = models.CharField(
        '缺陷状态', max_length=20, choices=Status.choices, default=Status.REPRODUCING,
    )
    notes = models.TextField('备注说明', blank=True, default='')
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='test_defects', verbose_name='所属项目',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '测试缺陷'
        verbose_name_plural = '测试缺陷'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.get_severity_display()}] {self.name}'


# ---- 测试报告通过 API 聚合，不需要独立模型 ----
