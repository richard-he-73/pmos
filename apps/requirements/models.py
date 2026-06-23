from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Requirement(models.Model):
    """需求"""
    class Type(models.TextChoices):
        BUSINESS = 'business', '业务需求'
        SOFTWARE_FUNC = 'software_func', '软件功能需求'
        SOFTWARE_PERF = 'software_perf', '软件性能需求'
        OTHER = 'other', '其他需求'

    class Status(models.TextChoices):
        SUBMITTED = 'submitted', '已提交'
        PENDING_REVIEW = 'pending_review', '待评审'
        REVIEW_PASSED = 'review_passed', '评审通过'
        BASELINED = 'baselined', '纳入基线'

    type = models.CharField('需求类型', max_length=30, choices=Type.choices)
    name = models.CharField('需求名称', max_length=200)
    description = models.TextField('需求描述', blank=True, default='')
    assignee = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='requirements',
        verbose_name='需求负责人',
    )
    due_date = models.DateField('需求完成日期', null=True, blank=True)
    notes = models.TextField('备注说明', blank=True, default='')
    document = models.FileField('需求文档', upload_to='requirements/', blank=True)
    status = models.CharField('状态', max_length=30, choices=Status.choices, default=Status.SUBMITTED)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='requirements', verbose_name='所属项目',
    )
    submitter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='提交人',
    )
    review_assignee = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='review_requirements',
        verbose_name='评审负责人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '需求'
        verbose_name_plural = '需求'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.get_type_display()}] {self.name}'


class RequirementReview(models.Model):
    """需求评审"""
    class ReviewMethod(models.TextChoices):
        MEETING = 'meeting', '会议'
        EMAIL = 'email', '邮件'
        CIRCULATION = 'circulation', '传签'
        OTHER = 'other', '其他'

    class Conclusion(models.TextChoices):
        PASS = 'pass', '通过'
        CONDITIONAL_PASS = 'conditional_pass', '有条件通过'
        FAIL = 'fail', '不通过'

    requirement = models.ForeignKey(
        Requirement, on_delete=models.CASCADE,
        related_name='reviews', verbose_name='关联需求',
    )
    reviewer = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.SET_NULL,
        null=True, related_name='conducted_reviews', verbose_name='评审负责人',
    )
    stakeholders = models.ManyToManyField(
        'organizations.UserOrganization', blank=True,
        related_name='participated_reviews', verbose_name='评审干系人',
    )
    review_method = models.CharField('评审方式', max_length=20, choices=ReviewMethod.choices)
    review_date = models.DateField('评审日期')
    conclusion = models.CharField('评审结论', max_length=30, choices=Conclusion.choices)
    notes = models.TextField('备注说明', blank=True, default='')
    document = models.FileField('评审文件', upload_to='reviews/', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '需求评审'
        verbose_name_plural = '需求评审'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.requirement.name} - {self.get_conclusion_display()}'


class RequirementBaseline(models.Model):
    """需求基线"""
    type = models.CharField('需求类型', max_length=30, choices=Requirement.Type.choices)
    name = models.CharField('基线名称', max_length=200)
    description = models.TextField('基线描述', blank=True, default='')
    version = models.CharField('基线版本', max_length=50, blank=True, default='')
    notes = models.TextField('备注说明', blank=True, default='')
    requirements = models.ManyToManyField(
        Requirement, related_name='baselines',
        verbose_name='基线需求',
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='requirement_baselines', verbose_name='所属项目',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '需求基线'
        verbose_name_plural = '需求基线'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['project', 'name', 'version'], name='uq_baseline_project_name_version'),
        ]

    def __str__(self):
        return f'{self.name} v{self.version}'


class RequirementChange(models.Model):
    """需求变更"""
    class ApprovalStatus(models.TextChoices):
        PENDING = 'pending', '待审批'
        APPROVED = 'approved', '审批通过'
        REJECTED = 'rejected', '审批不通过'

    baseline = models.ForeignKey(
        RequirementBaseline, on_delete=models.CASCADE,
        related_name='changes', verbose_name='所属基线',
    )
    baseline_version = models.CharField('基线版本', max_length=50)
    object_desc = models.TextField('变更对象')
    content = models.TextField('变更内容')
    assignee = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='change_assignees',
        verbose_name='变更负责人',
    )
    approver = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='change_approvers',
        verbose_name='变更审批人',
    )
    approval_status = models.CharField(
        '审批状态', max_length=20, choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    notes = models.TextField('备注说明', blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='创建人',
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '需求变更'
        verbose_name_plural = '需求变更'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.baseline.name} - {self.object_desc[:30]}'
