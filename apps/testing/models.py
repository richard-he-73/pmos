from django.db import models
from django.conf import settings


class TestPlan(models.Model):
    """测试计划"""

    class Status(models.TextChoices):
        DRAFT = 'draft', '草稿'
        IN_PROGRESS = 'in_progress', '执行中'
        COMPLETED = 'completed', '已完成'
        BLOCKED = 'blocked', '已阻塞'

    name = models.CharField('计划名称', max_length=200)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='test_plans', verbose_name='所属项目',
    )
    version = models.CharField('版本', max_length=50, blank=True)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.DRAFT,
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='负责人',
    )
    start_date = models.DateField('开始日期', null=True, blank=True)
    end_date = models.DateField('结束日期', null=True, blank=True)
    description = models.TextField('描述', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '测试计划'
        verbose_name_plural = '测试计划'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TestCase(models.Model):
    """测试用例"""

    class Type(models.TextChoices):
        FUNCTIONAL = 'functional', '功能测试'
        PERFORMANCE = 'performance', '性能测试'
        SECURITY = 'security', '安全测试'
        UI = 'ui', 'UI测试'
        API = 'api', '接口测试'

    class Priority(models.TextChoices):
        HIGH = 'high', '高'
        MEDIUM = 'medium', '中'
        LOW = 'low', '低'

    name = models.CharField('用例名称', max_length=200)
    precondition = models.TextField('前置条件', blank=True)
    steps = models.JSONField('测试步骤', blank=True, default=list)
    expected_result = models.TextField('预期结果', blank=True)
    type = models.CharField(
        '类型', max_length=20, choices=Type.choices, default=Type.FUNCTIONAL,
    )
    priority = models.CharField(
        '优先级', max_length=20, choices=Priority.choices, default=Priority.MEDIUM,
    )
    status = models.CharField('状态', max_length=20, default='active')
    module = models.CharField('模块', max_length=100, blank=True)
    requirement = models.ForeignKey(
        'requirements.SoftwareRequirement', on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='关联需求',
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


class TestRun(models.Model):
    """测试执行记录"""

    class Result(models.TextChoices):
        PASS = 'pass', '通过'
        FAIL = 'fail', '失败'
        BLOCKED = 'blocked', '阻塞'
        UNTESTED = 'untested', '未执行'

    test_case = models.ForeignKey(
        TestCase, on_delete=models.CASCADE, related_name='test_runs',
        verbose_name='测试用例',
    )
    test_plan = models.ForeignKey(
        TestPlan, on_delete=models.CASCADE, related_name='test_runs',
        verbose_name='测试计划',
    )
    executor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='执行人',
    )
    result = models.CharField(
        '执行结果', max_length=20, choices=Result.choices, default=Result.UNTESTED,
    )
    actual_result = models.TextField('实际结果', blank=True)
    notes = models.TextField('备注', blank=True)
    executed_at = models.DateTimeField('执行时间', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '测试执行'
        verbose_name_plural = '测试执行'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.test_case.name} - {self.get_result_display()}'


class Bug(models.Model):
    """缺陷"""

    class Severity(models.TextChoices):
        CRITICAL = 'critical', '致命'
        MAJOR = 'major', '严重'
        MINOR = 'minor', '一般'
        TRIVIAL = 'trivial', '轻微'

    class Status(models.TextChoices):
        NEW = 'new', '新建'
        CONFIRMED = 'confirmed', '已确认'
        IN_PROGRESS = 'in_progress', '处理中'
        RESOLVED = 'resolved', '已解决'
        CLOSED = 'closed', '已关闭'

    class Resolution(models.TextChoices):
        FIXED = 'fixed', '已修复'
        DUPLICATE = 'duplicate', '重复'
        NOT_A_BUG = 'not_a_bug', '非缺陷'
        DEFERRED = 'deferred', '延期处理'

    title = models.CharField('标题', max_length=200)
    description = models.TextField('描述', blank=True)
    severity = models.CharField(
        '严重程度', max_length=20, choices=Severity.choices, default=Severity.MINOR,
    )
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.NEW,
    )
    source = models.CharField('来源', max_length=50, default='test')
    module = models.CharField('模块', max_length=100, blank=True)
    version_found = models.CharField('发现版本', max_length=50, blank=True)
    version_fixed = models.CharField('修复版本', max_length=50, blank=True)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='reported_bugs', verbose_name='报告人',
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_bugs',
        verbose_name='处理人',
    )
    related_test_run = models.ForeignKey(
        TestRun, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='关联测试执行',
    )
    related_requirement = models.ForeignKey(
        'requirements.SoftwareRequirement', on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='关联需求',
    )
    resolution = models.CharField(
        '解决方案', max_length=20, choices=Resolution.choices,
        null=True, blank=True,
    )
    resolution_notes = models.TextField('解决说明', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '缺陷'
        verbose_name_plural = '缺陷'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.get_severity_display()}] {self.title}'
