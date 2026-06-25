from django.db import models
from django.conf import settings


class Equipment(models.Model):
    """设备管理"""

    class TypeChoices(models.TextChoices):
        SERVER = 'server', '服务器'
        COMPUTER = 'computer', '计算机'
        PRINTER = 'printer', '打印机'
        STORAGE = 'storage', '移动存储'
        CONSUMABLE = 'consumable', '耗材'
        OTHER = 'other', '其他'

    class StatusChoices(models.TextChoices):
        NOT_ISSUED = 'not_issued', '未出库'
        IN_USE = 'in_use', '使用中'
        RECYCLED = 'recycled', '已回收'
        SCRAPPED = 'scrapped', '已报废'
        OTHER = 'other', '其他'

    name = models.CharField('设备名称', max_length=200, blank=True, default='')
    code = models.CharField('设备编号', max_length=50, blank=True, default='')
    type = models.CharField('设备类型', max_length=30, choices=TypeChoices.choices, default=TypeChoices.OTHER)
    specs = models.CharField('设备规格', max_length=500, blank=True, default='')
    quantity = models.IntegerField('设备数量', default=1)
    status = models.CharField(
        '状态', max_length=20, choices=StatusChoices.choices, default=StatusChoices.NOT_ISSUED,
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='equipments',
        verbose_name='所属项目',
    )
    notes = models.TextField('备注说明', blank=True, default='')
    borrower = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='借用人',
    )
    borrow_date = models.DateField('借用日期', null=True, blank=True)
    return_date = models.DateField('预计归还日期', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '设备'
        verbose_name_plural = '设备'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.code}] {self.name}'


class Leave(models.Model):
    """请假管理"""

    class Type(models.TextChoices):
        PERSONAL = 'personal', '事假'
        SICK = 'sick', '病假'
        ANNUAL = 'annual', '年假'
        MARRIAGE = 'marriage', '婚假'
        FUNERAL = 'funeral', '丧假'
        PATERNITY = 'paternity', '陪产假'
        COMPENSATORY = 'compensatory', '调休假'
        FAMILY_VISIT = 'family_visit', '探亲假'
        OTHER = 'other', '其他'

    class Status(models.TextChoices):
        PENDING = 'pending', '待审批'
        APPROVED = 'approved', '已批准'
        REJECTED = 'rejected', '已驳回'

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='leaves',
        verbose_name='所属项目',
    )
    applicant = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.CASCADE,
        null=True, blank=True, related_name='leaves',
        verbose_name='申请人',
    )
    type = models.CharField('请假类型', max_length=20, choices=Type.choices)
    start_date = models.DateTimeField('开始时间')
    end_date = models.DateTimeField('结束时间')
    duration_days = models.DecimalField('天数', max_digits=4, decimal_places=1, null=True, blank=True)
    status = models.CharField(
        '审批状态', max_length=20, choices=Status.choices, default=Status.PENDING,
    )
    approver = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='approved_leaves',
        verbose_name='审批人',
    )
    is_cancelled = models.BooleanField('销假状态', default=False)
    notes = models.TextField('备注说明', blank=True, default='')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '请假'
        verbose_name_plural = '请假'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.applicant} - {self.get_type_display()}'


class Timesheet(models.Model):
    """工时记录"""

    class TypeChoices(models.TextChoices):
        WORKDAY = 'workday', '工作日'
        HOLIDAY = 'holiday', '节假日'
        OVERTIME = 'overtime', '加班'
        LEAVE = 'leave', '请假'

    class StatusChoices(models.TextChoices):
        NORMAL = 'normal', '正常'
        ABNORMAL = 'abnormal', '异常'

    class ApprovalStatus(models.TextChoices):
        APPROVED = 'approved', '同意'
        RETURNED = 'returned', '退回'
        REJECTED = 'rejected', '拒绝'

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, verbose_name='项目',
    )
    reporter = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.CASCADE,
        null=True, blank=True, related_name='timesheets',
        verbose_name='填报人',
    )
    start_date = models.DateField('开始日期', null=True, blank=True)
    end_date = models.DateField('结束日期', null=True, blank=True)
    type = models.CharField('工时类型', max_length=20, choices=TypeChoices.choices, default=TypeChoices.WORKDAY)
    status = models.CharField('工时状态', max_length=20, choices=StatusChoices.choices, default=StatusChoices.NORMAL)
    approval_status = models.CharField('审批状态', max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.APPROVED)
    approver = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='approved_timesheets',
        verbose_name='审批人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '工时'
        verbose_name_plural = '工时'
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.reporter} - {self.start_date}~{self.end_date}'


class TimesheetDetail(models.Model):
    """工时明细"""
    timesheet = models.ForeignKey(
        Timesheet, on_delete=models.CASCADE,
        related_name='details', verbose_name='工时记录',
    )
    date = models.DateField('日期')
    type = models.CharField('工时类型', max_length=20, choices=Timesheet.TypeChoices.choices)
    hours = models.DecimalField('工时', max_digits=4, decimal_places=1, default=8.0)
    description = models.CharField('说明', max_length=200, blank=True, default='')

    class Meta:
        verbose_name = '工时明细'
        verbose_name_plural = '工时明细'
        ordering = ['date']
        unique_together = ['timesheet', 'date']

    def __str__(self):
        return f'{self.date} - {self.get_type_display()}'


class Issue(models.Model):
    """问题管理"""

    class IssueTypeChoices(models.TextChoices):
        PLAN_EXECUTION = 'plan_execution', '计划执行'
        RESOURCE = 'resource', '资源问题'
        CONFIG_ERROR = 'config_error', '配置错误'
        CHANGE_REQUEST = 'change_request', '变更请求'
        EXTERNAL_DEPENDENCY = 'external_dependency', '外部依赖'
        OTHER = 'other', '其他'

    class SeverityChoices(models.TextChoices):
        FATAL = 'fatal', '致命'
        SERIOUS = 'serious', '严重'
        NORMAL = 'normal', '一般'
        TIP = 'tip', '提示'

    class PriorityChoices(models.TextChoices):
        HIGH = 'high', '高'
        MEDIUM = 'medium', '中'
        LOW = 'low', '低'

    class SourceChoices(models.TextChoices):
        EXEC_TRACKING = 'exec_tracking', '执行跟踪'
        USER_FEEDBACK = 'user_feedback', '用户反馈'
        OTHER = 'other', '其他'

    class StatusChoices(models.TextChoices):
        NEW = 'new', '新建'
        CONFIRMED = 'confirmed', '已确认'
        ANALYZING = 'analyzing', '分析中'
        FIXING = 'fixing', '修复/解决中'
        PENDING_VERIFY = 'pending_verify', '待验证'
        CLOSED = 'closed', '已关闭'
        REOPENED = 'reopened', '重新打开'

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='issues',
        verbose_name='所属项目',
    )
    title = models.CharField('问题标题', max_length=300)
    description = models.TextField('问题描述', blank=True, default='')
    issue_type = models.CharField('问题类型', max_length=30, choices=IssueTypeChoices.choices, default=IssueTypeChoices.OTHER)
    severity = models.CharField('严重程度', max_length=20, choices=SeverityChoices.choices, default=SeverityChoices.NORMAL)
    priority = models.CharField('优先级', max_length=10, choices=PriorityChoices.choices, default=PriorityChoices.MEDIUM)
    source = models.CharField('问题来源', max_length=30, choices=SourceChoices.choices, default=SourceChoices.OTHER)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reported_issues',
        verbose_name='报告人',
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_issues',
        verbose_name='负责人',
    )
    stakeholders = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True,
        related_name='issue_stakeholders', verbose_name='干系人',
    )
    expected_resolution_date = models.DateField('期望解决日期', null=True, blank=True)
    status = models.CharField('问题状态', max_length=20, choices=StatusChoices.choices, default=StatusChoices.NEW)
    resolution = models.TextField('解决方案', blank=True, default='')
    attachment = models.FileField('附件', upload_to='issue_attachments/', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '问题'
        verbose_name_plural = '问题'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Risk(models.Model):
    """风险管理"""

    class CategoryChoices(models.TextChoices):
        SCHEDULE = 'schedule', '进度'
        REQUIREMENT = 'requirement', '需求'
        TECHNOLOGY = 'technology', '技术'
        RESOURCE = 'resource', '资源'
        EXTERNAL_DEPENDENCY = 'external_dependency', '外部依赖'
        COMPLIANCE = 'compliance', '合规'
        OTHER = 'other', '其他'

    class ProbabilityChoices(models.TextChoices):
        VERY_HIGH = 'very_high', '很高'
        HIGH = 'high', '高'
        MEDIUM = 'medium', '中'
        LOW = 'low', '低'
        VERY_LOW = 'very_low', '很低'

    class ImpactChoices(models.TextChoices):
        FATAL = 'fatal', '致命'
        SERIOUS = 'serious', '严重'
        NORMAL = 'normal', '一般'
        SLIGHT = 'slight', '轻微'

    class RiskLevelChoices(models.TextChoices):
        EXTREME = 'extreme', '极高'
        HIGH = 'high', '高'
        MEDIUM = 'medium', '中'
        LOW = 'low', '低'

    class StrategyChoices(models.TextChoices):
        AVOID = 'avoid', '规避'
        TRANSFER = 'transfer', '转移'
        MITIGATE = 'mitigate', '缓解'
        ACCEPT = 'accept', '接受'

    class StatusChoices(models.TextChoices):
        NEW = 'new', '新建'
        ASSESSING = 'assessing', '评估中'
        PLANNED = 'planned', '已制定应对'
        MONITORING = 'monitoring', '监控中'
        CLOSED = 'closed', '已关闭'

    # 概率与影响的权重映射（用于自动计算风险等级）
    PROBABILITY_WEIGHTS = {
        ProbabilityChoices.VERY_HIGH: 5,
        ProbabilityChoices.HIGH: 4,
        ProbabilityChoices.MEDIUM: 3,
        ProbabilityChoices.LOW: 2,
        ProbabilityChoices.VERY_LOW: 1,
    }
    IMPACT_WEIGHTS = {
        ImpactChoices.FATAL: 5,
        ImpactChoices.SERIOUS: 4,
        ImpactChoices.NORMAL: 3,
        ImpactChoices.SLIGHT: 2,
    }

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='risks',
        verbose_name='所属项目',
    )
    title = models.CharField('风险标题', max_length=300)
    description = models.TextField('风险描述', blank=True, default='')
    category = models.CharField('风险类别', max_length=30, choices=CategoryChoices.choices, default=CategoryChoices.OTHER)
    probability = models.CharField('发生概率', max_length=10, choices=ProbabilityChoices.choices, default=ProbabilityChoices.MEDIUM)
    impact = models.CharField('影响程度', max_length=10, choices=ImpactChoices.choices, default=ImpactChoices.NORMAL)
    risk_level = models.CharField('风险等级', max_length=10, choices=RiskLevelChoices.choices, blank=True, default='')
    early_signs = models.TextField('早期征兆', blank=True, default='')
    strategy = models.CharField('应对策略', max_length=10, choices=StrategyChoices.choices, default=StrategyChoices.ACCEPT)
    response_plan = models.TextField('应对计划', blank=True, default='')
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reported_risks',
        verbose_name='报告人',
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_risks',
        verbose_name='负责人',
    )
    stakeholders = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True,
        related_name='risk_stakeholders', verbose_name='干系人',
    )
    status = models.CharField('风险状态', max_length=20, choices=StatusChoices.choices, default=StatusChoices.NEW)
    attachment = models.FileField('附件', upload_to='risk_attachments/', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '风险'
        verbose_name_plural = '风险'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def calculate_risk_level(self) -> str:
        """根据概率×影响自动计算风险等级"""
        pw = self.PROBABILITY_WEIGHTS.get(self.probability, 3)
        iw = self.IMPACT_WEIGHTS.get(self.impact, 3)
        score = pw * iw
        if score >= 20:
            return self.RiskLevelChoices.EXTREME
        elif score >= 12:
            return self.RiskLevelChoices.HIGH
        elif score >= 6:
            return self.RiskLevelChoices.MEDIUM
        else:
            return self.RiskLevelChoices.LOW

    def save(self, *args, **kwargs):
        # 自动计算风险等级（仅在未手动覆盖时）
        if not self.risk_level:
            self.risk_level = self.calculate_risk_level()
        super().save(*args, **kwargs)
