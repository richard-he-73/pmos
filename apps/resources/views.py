from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Case, When, Value, IntegerField, F, Q
from django.contrib.auth import get_user_model
from .models import Consultant, ProjectResource, ResourceChangeLog
from .serializers import ConsultantSerializer, ProjectResourceSerializer, ResourceChangeLogSerializer

User = get_user_model()


class ConsultantViewSet(viewsets.ModelViewSet):
    queryset = Consultant.objects.all()
    serializer_class = ConsultantSerializer

    def get_queryset(self):
        qs = Consultant.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)

        rank_order = Case(
            When(rank='director', then=Value(0)),
            When(rank='senior', then=Value(1)),
            When(rank='consultant', then=Value(2)),
            When(rank='assistant', then=Value(3)),
            When(rank='other', then=Value(4)),
            default=Value(99),
            output_field=IntegerField(),
        )
        return qs.annotate(
            rank_order=rank_order
        ).order_by(
            'rank_order',
            F('entry_date').asc(nulls_last=True),
            F('exit_date').asc(nulls_last=True),
        )

    @action(detail=False, methods=['get'])
    def check_user_by_name(self, request):
        """检查指定姓名是否已有对应系统用户"""
        name = request.query_params.get('name', '').strip()
        if not name:
            return Response({'error': '请提供姓名'}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(
            Q(real_name=name) | Q(username=name)
        ).values('id', 'username', 'real_name', 'email', 'is_active')

        return Response({'exists': users.exists(), 'users': list(users)})

    @action(detail=False, methods=['post'])
    def create_with_user(self, request):
        """创建资源，并可选同步创建系统用户"""
        from pypinyin import lazy_pinyin

        serializer = ConsultantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consultant = serializer.save()

        create_user = request.data.get('create_user', True)
        linked_user_id = request.data.get('linked_user_id')

        if create_user and linked_user_id:
            # 关联已有系统用户
            try:
                user = User.objects.get(id=linked_user_id)
                consultant.user = user
                consultant.save(update_fields=['user'])
            except User.DoesNotExist:
                pass
        elif create_user:
            # 同步创建系统用户
            name = consultant.name.strip()
            # 生成拼音用户名
            pinyin = ''.join(lazy_pinyin(name)).lower().replace(' ', '')
            username = pinyin
            suffix = 2
            while User.objects.filter(username=username).exists():
                username = f'{pinyin}{suffix}'
                suffix += 1

            user = User.objects.create_user(
                username=username,
                real_name=name,
                email=f'{username}@pmos.com',
                password='Pmos@2026',
                is_active=True,
            )
            consultant.user = user
            consultant.save(update_fields=['user'])

        return Response(
            ConsultantSerializer(consultant).data,
            status=status.HTTP_201_CREATED,
        )


class ProjectResourceViewSet(viewsets.ModelViewSet):
    queryset = ProjectResource.objects.all()
    serializer_class = ProjectResourceSerializer


class ResourceChangeLogViewSet(viewsets.ModelViewSet):
    queryset = ResourceChangeLog.objects.all()
    serializer_class = ResourceChangeLogSerializer
