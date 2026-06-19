from rest_framework import viewsets
from rest_framework.response import Response
from pypinyin import lazy_pinyin
from .models import Department, UserOrganization
from .serializers import DepartmentSerializer, UserOrganizationSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        # 按上级部门分组，同级按拼音排序
        def sort_key(d):
            parent_py = ''.join(lazy_pinyin(d.parent.name)) if d.parent else ''
            name_py = ''.join(lazy_pinyin(d.name)) if d.name else ''
            return (0 if d.parent is None else 1, parent_py, name_py)
        sorted_list = sorted(list(queryset), key=sort_key)
        page = self.paginate_queryset(sorted_list)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(sorted_list, many=True)
        return Response(serializer.data)


class UserOrganizationViewSet(viewsets.ModelViewSet):
    queryset = UserOrganization.objects.all()
    serializer_class = UserOrganizationSerializer
