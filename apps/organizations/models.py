from django.db import models
from django.conf import settings
from apps.resources.models import Consultant


class Department(models.Model):
    """部门/组织"""
    name = models.CharField('部门名称', max_length=100)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='departments',
        verbose_name='所属项目',
    )
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children', verbose_name='上级部门',
    )
    manager = models.ForeignKey(
        'resources.Consultant', on_delete=models.SET_NULL,
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
    """组织成员（项目团队）"""
    PROJECT_ROLE_CHOICES = [
        ('project_director', '项目总监'),
        ('project_manager', '项目经理'),
        ('consulting_expert', '咨询专家'),
        ('consulting_advisor', '咨询顾问'),
        ('consulting_assistant', '咨询助理'),
        ('other', '其他'),
    ]

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='org_members',
        verbose_name='所属项目',
    )
    consultant = models.ForeignKey(
        Consultant, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='org_memberships',
        verbose_name='资源',
    )
    name = models.CharField('姓名', max_length=50, blank=True)
    gender = models.CharField('性别', max_length=10, blank=True)
    age = models.IntegerField('年龄', null=True, blank=True)
    rank = models.CharField('职级', max_length=30, blank=True)
    project_role = models.CharField('项目岗位', max_length=50, choices=PROJECT_ROLE_CHOICES, blank=True)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE,
        related_name='members', verbose_name='所属部门',
    )
    phone = models.CharField('联系电话', max_length=30, blank=True)
    email = models.EmailField('联系邮箱', blank=True)
    joined_at = models.DateField('加入日期', null=True, blank=True)

    class Meta:
        verbose_name = '组织成员'
        verbose_name_plural = '组织成员'
        ordering = ['department', 'name']

    def __str__(self):
        return self.name or f'成员 #{self.pk}'
