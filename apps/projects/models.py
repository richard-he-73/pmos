from django.db import models
from django.conf import settings


class Project(models.Model):
    """项目"""

    # ── 项目类型 ──
    class ProjectType(models.TextChoices):
        MONTHLY = 'monthly', '人月型'
        FIXED = 'fixed', '项目制'
        RESOURCE_POOL = 'resource_pool', '资源池'

    # ── 项目领域 ──
    class Domain(models.TextChoices):
        OVERALL_PLANNING = 'overall_planning', '整体规划'
        PROJECT_MANAGEMENT = 'project_management', '项目管理'
        PROFESSIONAL_CONSULTING = 'professional_consulting', '专业咨询'

    # ── 咨询方向 ──
    class ConsultingDirection(models.TextChoices):
        CORE = 'core', '核心'
        CREDIT = 'credit', '信贷'
        CREDIT_CARD = 'credit_card', '信用卡'
        PAYMENT = 'payment', '支付'
        CHANNEL = 'channel', '渠道'
        OPERATIONS = 'operations', '运营'
        FINANCE_ACCOUNTING = 'finance_accounting', '财会'
        DIGITAL_TRANSFORM = 'digital_transform', '数字化转型'
        AI = 'ai', '人工智能'
        OTHER = 'other', '其他'
    class Status(models.TextChoices):
        PLANNING = 'planning', '计划中'
        ACTIVE = 'active', '进行中'
        PENDING_ACCEPTANCE = 'pending_acceptance', '待验收'
        CLOSED = 'closed', '已结项'

    # ── 合同签署状态 ──
    class ContractStatus(models.TextChoices):
        DRAFT = 'draft', '草拟中'
        PENDING_LEGAL = 'pending_legal', '待法审'
        PENDING_SIGN = 'pending_sign', '待签章'
        SIGNED = 'signed', '已签署'
        ARCHIVED = 'archived', '已归档'

    code = models.CharField('项目编号', max_length=50, unique=True)
    name = models.CharField('项目名称', max_length=200)
    description = models.TextField('描述', blank=True)

    project_domain = models.CharField(
        '项目领域', max_length=30, choices=Domain.choices,
        default=Domain.OVERALL_PLANNING,
    )
    consulting_direction = models.CharField(
        '咨询方向', max_length=30, choices=ConsultingDirection.choices,
        default=ConsultingDirection.OTHER,
    )

    project_type = models.CharField(
        '项目类型', max_length=20, choices=ProjectType.choices,
        default=ProjectType.MONTHLY,
    )

    start_date = models.DateField('开始日期', null=True, blank=True)
    end_date = models.DateField('结束日期', null=True, blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='owned_projects', verbose_name='项目负责人',
    )

    status = models.CharField(
        '项目状态', max_length=25, choices=Status.choices,
        default=Status.PLANNING,
    )

    contract_price = models.DecimalField(
        '合同价格', max_digits=12, decimal_places=2,
        null=True, blank=True,
    )
    budget_price = models.DecimalField(
        '预算价格', max_digits=12, decimal_places=2,
        null=True, blank=True,
    )

    contract_status = models.CharField(
        '合同签署状态', max_length=20, choices=ContractStatus.choices,
        default=ContractStatus.DRAFT,
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
