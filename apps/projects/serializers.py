from rest_framework import serializers
from .models import Project, ProjectMember


class ProjectSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.real_name', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'code', 'description', 'status',
            'start_date', 'end_date', 'owner', 'owner_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProjectDetailSerializer(ProjectSerializer):
    members = serializers.SerializerMethodField()

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['members']

    def get_members(self, obj):
        members = ProjectMember.objects.filter(project=obj, is_active=True)
        return ProjectMemberSerializer(members, many=True).data


class ProjectMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.real_name', read_only=True)

    class Meta:
        model = ProjectMember
        fields = [
            'id', 'user', 'user_name', 'project', 'role',
            'join_date', 'leave_date', 'is_active',
        ]
        read_only_fields = ['join_date']
