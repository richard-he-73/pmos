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
        # 树形排序：父部门在前，子部门在后，同级按拼音排序
        all_depts = list(queryset)
        children = {}  # parent_id -> list
        root = []
        for d in all_depts:
            if d.parent_id is None:
                root.append(d)
            else:
                children.setdefault(d.parent_id, []).append(d)
        # 同级按拼音排序
        def py_key(d):
            return ''.join(lazy_pinyin(d.name)) if d.name else ''
        root.sort(key=py_key)
        for pid in children:
            children[pid].sort(key=py_key)
        # 广度优先遍历
        sorted_list = []
        queue = list(root)
        while queue:
            d = queue.pop(0)
            sorted_list.append(d)
            if d.id in children:
                queue.extend(children[d.id])
        page = self.paginate_queryset(sorted_list)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(sorted_list, many=True)
        return Response(serializer.data)


class UserOrganizationViewSet(viewsets.ModelViewSet):
    queryset = UserOrganization.objects.all()
    serializer_class = UserOrganizationSerializer
