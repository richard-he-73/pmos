from rest_framework import serializers
from .models import CommType, CommRecord


class CommTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommType
        fields = '__all__'


class CommRecordSerializer(serializers.ModelSerializer):
    initiator_name = serializers.CharField(source='initiator.name', read_only=True)
    comm_type_name = serializers.CharField(source='comm_type.name', read_only=True)
    participants_names = serializers.SerializerMethodField()

    def get_participants_names(self, obj):
        return list(obj.participants.values_list('name', flat=True))

    class Meta:
        model = CommRecord
        fields = '__all__'
        read_only_fields = ['created_at']
