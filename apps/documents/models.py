from django.db import models
from django.conf import settings


class DocumentCategory(models.Model):
    """文档分类"""
    name = models.CharField('分类名称', max_length=100)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children', verbose_name='上级分类',
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='doc_categories', verbose_name='所属项目',
    )
    sort_order = models.IntegerField('排序', default=0)

    class Meta:
        verbose_name = '文档分类'
        verbose_name_plural = '文档分类'
        ordering = ['project', 'sort_order']

    def __str__(self):
        return self.name


class Document(models.Model):
    """文档"""

    class Status(models.TextChoices):
        DRAFT = 'draft', '草稿'
        PUBLISHED = 'published', '已发布'
        ARCHIVED = 'archived', '已归档'

    title = models.CharField('标题', max_length=200)
    content = models.TextField('内容', blank=True)
    category = models.ForeignKey(
        DocumentCategory, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='documents', verbose_name='分类',
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='documents', verbose_name='所属项目',
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='创建人',
    )
    version = models.IntegerField('版本', default=1)
    status = models.CharField(
        '状态', max_length=20, choices=Status.choices, default=Status.DRAFT,
    )
    file = models.FileField('附件', upload_to='documents/', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '文档'
        verbose_name_plural = '文档'
        ordering = ['-updated_at']

    def __str__(self):
        return self.title
