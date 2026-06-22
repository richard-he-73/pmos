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

    class DocType(models.TextChoices):
        REPORT = 'report', '报告'
        PLAN = 'plan', '方案'
        REQUIREMENT = 'requirement', '需求'
        MINUTES = 'minutes', '纪要'
        OTHER = 'other', '其他'

    class ArchiveStatus(models.TextChoices):
        UNARCHIVED = 'unarchived', '未归档'
        ARCHIVED = 'archived', '已归档'

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        null=True, blank=True, related_name='documents', verbose_name='所属项目',
    )
    doc_type = models.CharField('文档类型', max_length=20, choices=DocType.choices, default=DocType.OTHER)
    title = models.CharField('文档标题', max_length=200, blank=True, default='')
    version = models.CharField('文档版本', max_length=50, blank=True, default='')
    file_format = models.CharField('文档格式', max_length=20, blank=True, default='')
    file_size = models.CharField('文档大小', max_length=50, blank=True, default='')
    upload_time = models.DateTimeField('上传时间', null=True, blank=True)
    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='上传人',
    )
    archive_status = models.CharField(
        '归档状态', max_length=20, choices=ArchiveStatus.choices, default=ArchiveStatus.UNARCHIVED,
    )
    file = models.FileField('文件', upload_to='documents/', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', null=True, blank=True)

    class Meta:
        verbose_name = '文档'
        verbose_name_plural = '文档'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
