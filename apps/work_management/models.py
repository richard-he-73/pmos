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
