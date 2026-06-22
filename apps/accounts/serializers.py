from rest_framework import serializers
from .models import User, Role


class UserSerializer(serializers.ModelSerializer):
    active_project_name = serializers.CharField(source='active_project.name', read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'real_name', 'email', 'phone',
                  'position', 'department', 'avatar', 'is_active',
                  'is_superuser', 'date_joined', 'last_login',
                  'active_project', 'active_project_name']
        read_only_fields = ['date_joined', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(
        choices=[('admin', '管理员'), ('user', '用户')], write_only=True,
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'password2', 'real_name',
                  'email', 'phone', 'position', 'department', 'user_type']

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e))
        return value

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({'password2': '两次输入的密码不一致'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user_type = validated_data.pop('user_type', 'user')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        if user_type == 'admin':
            user.is_superuser = True
            user.is_staff = True
        user.save()
        return user


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['is_system', 'created_at']
