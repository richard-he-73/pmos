from django.db import models
from django.conf import settings


class OperationLog(models.Model):
    """操作日志"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='操作人',
    )
    action = models.CharField('操作', max_length=50)  # create/update/delete
    model_name = models.CharField('模型', max_length=100)
    object_id = models.CharField('对象ID', max_length=50, blank=True)
    object_repr = models.CharField('对象描述', max_length=200, blank=True)
    detail = models.JSONField('详情', blank=True, default=dict)
    ip_address = models.GenericIPAddressField('IP地址', blank=True, null=True)
    created_at = models.DateTimeField('操作时间', auto_now_add=True)

    class Meta:
        verbose_name = '操作日志'
        verbose_name_plural = '操作日志'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.action} {self.model_name} by {self.user}'


class SystemConfig(models.Model):
    """系统配置（键值对）"""
    key = models.CharField('配置键', max_length=100, unique=True)
    value = models.JSONField('配置值')
    description = models.CharField('说明', max_length=200, blank=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '系统配置'
        verbose_name_plural = '系统配置'

    def __str__(self):
        return self.key
