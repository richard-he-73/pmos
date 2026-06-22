from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, Role
from .serializers import UserSerializer, UserCreateSerializer, RoleSerializer


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        """管理员看到所有用户，普通用户只能看到自己"""
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def perform_update(self, serializer):
        """非管理员只能修改自己的信息"""
        if not self.request.user.is_superuser and serializer.instance.id != self.request.user.id:
            self.permission_denied(self.request)
        serializer.save()

    def perform_destroy(self, instance):
        """非管理员不能删除用户"""
        if not self.request.user.is_superuser:
            self.permission_denied(self.request)
        instance.delete()

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """修改密码（需旧密码验证）"""
        user = self.get_object()
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'detail': '请提供旧密码和新密码'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'detail': '旧密码不正确'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'detail': list(e)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': '密码修改成功'})

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """重置密码（管理员操作，无需旧密码）"""
        if not request.user.is_superuser:
            return Response({'detail': '无权限'}, status=status.HTTP_403_FORBIDDEN)

        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'detail': '请提供新密码'}, status=status.HTTP_400_BAD_REQUEST)

        user = self.get_object()
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'detail': list(e)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': '密码已重置'})

    @action(detail=False, methods=['get'])
    def generate_username(self, request):
        """根据中文姓名生成拼音用户名"""
        name = request.query_params.get('name', '').strip()
        if not name:
            return Response({'error': '请提供姓名'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from pypinyin import lazy_pinyin
            pinyin = ''.join(lazy_pinyin(name)).lower().replace(' ', '')
            username = pinyin
            suffix = 2
            while User.objects.filter(username=username).exists():
                username = f'{pinyin}{suffix}'
                suffix += 1
            return Response({'username': username, 'email': f'{username}@pmos.com'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
