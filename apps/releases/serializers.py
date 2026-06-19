from rest_framework import serializers
from .models import ReleaseDrill, ReleaseDeployment, ReleaseStep


class ReleaseDrillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReleaseDrill
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ReleaseDeploymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReleaseDeployment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ReleaseStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReleaseStep
        fields = '__all__'
