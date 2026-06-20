from rest_framework import viewsets
from rest_framework.response import Response
from django.db.models import Case, When, Value, IntegerField
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

    def get_queryset(self):
        # 部门层级排序（与 DepartmentViewSet 先序遍历一致）
        all_depts = list(Department.objects.all())
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
        dept_order_list = []
        def dfs(nodes):
            for d in nodes:
                dept_order_list.append(d.id)
                if d.id in children:
                    dfs(children[d.id])
        dfs(root)
        dept_order = Case(
            *[When(department_id=id, then=Value(i)) for i, id in enumerate(dept_order_list)],
            default=Value(9999),
            output_field=IntegerField(),
        )
        role_order = Case(
            When(project_role='project_director', then=Value(0)),
            When(project_role='project_manager', then=Value(1)),
            When(project_role='consulting_expert', then=Value(2)),
            When(project_role='consulting_advisor', then=Value(3)),
            When(project_role='consulting_assistant', then=Value(4)),
            When(project_role='other', then=Value(5)),
            default=Value(99),
            output_field=IntegerField(),
        )
        return UserOrganization.objects.all().annotate(
            dept_order=dept_order,
            role_order=role_order,
        ).order_by(
            'dept_order',
            'role_order',
            'name',
        )
