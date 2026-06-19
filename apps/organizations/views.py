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
        # 先序遍历：父→子→孙紧随其后，同级按拼音排序
        all_depts = list(queryset)
        children = {}
        root = []
        for d in all_depts:
            if d.parent_id is None:
                root.append(d)
            else:
                children.setdefault(d.parent_id, []).append(d)

        def py_key(d):
            return ''.join(lazy_pinyin(d.name)) if d.name else ''
        root.sort(key=py_key)
        for pid in children:
            children[pid].sort(key=py_key)
        # 先序（深度优先）遍历
        sorted_list = []
        def dfs(nodes):
            for d in nodes:
                sorted_list.append(d)
                if d.id in children:
                    dfs(children[d.id])
        dfs(root)
        page = self.paginate_queryset(sorted_list)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(sorted_list, many=True)
        return Response(serializer.data)


class UserOrganizationViewSet(viewsets.ModelViewSet):
    queryset = UserOrganization.objects.all()
    serializer_class = UserOrganizationSerializer
