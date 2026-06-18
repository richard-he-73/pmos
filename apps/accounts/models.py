from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """扩展用户模型"""
    real_name = models.CharField('姓名', max_length=50, blank=True)
    phone = models.CharField('手机号', max_length=20, blank=True)
    avatar = models.ImageField('头像', upload_to='avatars/', blank=True)
    position = models.CharField('职位', max_length=100, blank=True)
    department = models.CharField('部门', max_length=100, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'
        ordering = ['-date_joined']

    def __str__(self):
        return self.real_name or self.username


class Role(models.Model):
    """角色"""
    name = models.CharField('角色名称', max_length=50)
    code = models.CharField('角色编码', max_length=50, unique=True)
    description = models.TextField('描述', blank=True)
    permissions = models.ManyToManyField(
        'auth.Permission', verbose_name='权限', blank=True,
    )
    is_system = models.BooleanField('系统内置', default=False)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '角色'
        verbose_name_plural = '角色'
        ordering = ['name']

    def __str__(self):
        return self.name

