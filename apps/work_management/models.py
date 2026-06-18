from django.db import models
from django.conf import settings


class Equipment(models.Model):
    """设备管理"""

    class Status(models.TextChoices):
        AVAILABLE = 'available', '可用'
        IN_USE = 'in_use', '使用中'
        MAINTENANCE = 'maintenance', '维护中'
        RETIRED = 'retired', '已报废'

    name = models.CharField('设备名称', max_length=200)
    code = models.CharField('设备编号', max_length=50, unique=True)
    type = models.CharField('设备类型', max_length=50)
    specs = models.JSONField('规格参数', blank=True, default=dict)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.AVAILABLE,
    )
    borrower = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='借用人',
    )
    borrow_date = models.DateField('借用日期', null=True, blank=True)
    return_date = models.DateField('预计归还日期', null=True, blank=True)
    notes = models.TextField('备注', blank=True)
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
        ANNUAL = 'annual', '年假'
        SICK = 'sick', '病假'
        PERSONAL = 'personal', '事假'
        MARRIAGE = 'marriage', '婚假'
        MATERNITY = 'maternity', '产假'
        OTHER = 'other', '其他'

    class Status(models.TextChoices):
        PENDING = 'pending', '待审批'
        APPROVED = 'approved', '已批准'
        REJECTED = 'rejected', '已驳回'
        CANCELLED = 'cancelled', '已取消'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='leaves', verbose_name='申请人',
    )
    type = models.CharField('请假类型', max_length=20, choices=Type.choices)
    start_date = models.DateField('开始日期')
    end_date = models.DateField('结束日期')
    duration_days = models.DecimalField('天数', max_digits=4, decimal_places=1)
    reason = models.TextField('请假原因')
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.PENDING,
    )
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='approved_leaves',
        verbose_name='审批人',
    )
    approve_notes = models.TextField('审批意见', blank=True)
    cancel_date = models.DateField('销假日期', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '请假'
        verbose_name_plural = '请假'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} - {self.get_type_display()} ({self.start_date}~{self.end_date})'


class Timesheet(models.Model):
    """工时登记"""

    class Status(models.TextChoices):
        DRAFT = 'draft', '草稿'
        SUBMITTED = 'submitted', '已提交'
        APPROVED = 'approved', '已批准'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='timesheets', verbose_name='人员',
    )
    date = models.DateField('日期')
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE, verbose_name='项目',
    )
    task = models.ForeignKey(
        'plans.Task', on_delete=models.CASCADE,
        null=True, blank=True, verbose_name='任务',
    )
    hours = models.DecimalField('工时', max_digits=4, decimal_places=1)
    description = models.CharField('工作内容', max_length=500)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.DRAFT,
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '工时'
        verbose_name_plural = '工时'
        ordering = ['-date']

    def __str__(self):
        return f'{self.user} - {self.date} ({self.hours}h)'
