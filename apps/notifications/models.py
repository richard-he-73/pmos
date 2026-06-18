from django.db import models
from django.conf import settings


class Notification(models.Model):
    """消息通知"""
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='notifications', verbose_name='接收人',
    )
    type = models.CharField('通知类型', max_length=50)
    title = models.CharField('标题', max_length=200)
    content = models.TextField('内容', blank=True)
    is_read = models.BooleanField('已读', default=False)
    read_at = models.DateTimeField('阅读时间', null=True, blank=True)
    related_type = models.CharField('关联类型', max_length=50, blank=True)
    related_id = models.IntegerField('关联ID', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '通知'
        verbose_name_plural = '通知'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.type}] {self.title}'


class NotificationTemplate(models.Model):
    """通知模板"""
    code = models.CharField('模板编码', max_length=50, unique=True)
    title_template = models.CharField('标题模板', max_length=200)
    content_template = models.TextField('内容模板')
    description = models.CharField('说明', max_length=200, blank=True)

    class Meta:
        verbose_name = '通知模板'
        verbose_name_plural = '通知模板'

    def __str__(self):
        return self.code
