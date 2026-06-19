from django.db import models
from django.conf import settings


class Department(models.Model):
    """部门/组织"""
    name = models.CharField('部门名称', max_length=100)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children', verbose_name='上级部门',
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='managed_departments',
        verbose_name='部门负责人',
    )
    sort_order = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True)
    description = models.TextField('部门职责', blank=True, default='')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '部门'
        verbose_name_plural = '部门'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class UserOrganization(models.Model):
    """用户组织关系"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='org_memberships', verbose_name='用户',
    )
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE,
        related_name='members', verbose_name='部门',
    )
    position = models.CharField('职位', max_length=100, blank=True)
    is_leader = models.BooleanField('是否部门主管', default=False)
    joined_at = models.DateField('入职日期', null=True, blank=True)

    class Meta:
        verbose_name = '组织成员'
        verbose_name_plural = '组织成员'
        unique_together = ['user', 'department']
        ordering = ['department', 'user']

    def __str__(self):
        return f'{self.user} - {self.department}'
