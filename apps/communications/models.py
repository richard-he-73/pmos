from django.db import models


class CommType(models.Model):
    """沟通类型"""
    name = models.CharField('类型名称', max_length=50)
    description = models.TextField('类型描述', blank=True, default='')
    is_active = models.BooleanField('是否启用', default=True)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='comm_types',
        verbose_name='所属项目',
    )
    icon = models.CharField('图标', max_length=50, blank=True)
    sort_order = models.IntegerField('排序', default=0)

    class Meta:
        verbose_name = '沟通类型'
        verbose_name_plural = '沟通类型'
        ordering = ['sort_order']

    def __str__(self):
        return self.name


class CommRecord(models.Model):
    """沟通记录"""
    comm_type = models.ForeignKey(
        CommType, on_delete=models.CASCADE, verbose_name='沟通类型',
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='comm_records', verbose_name='所属项目',
    )
    subject = models.CharField('主题', max_length=200)
    content = models.TextField('内容', blank=True)
    conclusion = models.TextField('结论', blank=True, default='')
    initiator = models.ForeignKey(
        'organizations.UserOrganization', on_delete=models.CASCADE,
        related_name='initiated_comms', verbose_name='发起人',
    )
    participants = models.ManyToManyField(
        'organizations.UserOrganization', blank=True,
        related_name='participated_comms', verbose_name='参与人',
    )
    comm_date = models.DateTimeField('沟通时间')
    duration_minutes = models.IntegerField('时长(分钟)', null=True, blank=True)
    location = models.CharField('地点', max_length=200, blank=True)
    attachments = models.JSONField('附件', blank=True, default=list)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '沟通记录'
        verbose_name_plural = '沟通记录'
        ordering = ['-comm_date']

    def __str__(self):
        return f'[{self.comm_type}] {self.subject}'
