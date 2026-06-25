from django.db import models


class DashboardConfig(models.Model):
    """用户看板配置"""
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, verbose_name='用户')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, null=True, blank=True, verbose_name='项目')
    config = models.JSONField(default=dict, verbose_name='配置内容')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '看板配置'
        verbose_name_plural = '看板配置'
        unique_together = [('user', 'project')]

    def __str__(self):
        return f'{self.user} - {self.project or "全局"}'
