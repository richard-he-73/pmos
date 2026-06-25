from rest_framework import viewsets
from rest_framework.response import Response
from django.db.models import Case, When, Value, IntegerField
from pypinyin import lazy_pinyin
from .models import Department, UserOrganization
from .serializers import DepartmentSerializer, UserOrganizationSerializer


def _build_dept_order():
    """构建部门先序遍历排序：父→子，同级按拼音"""
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

    order_list = []

    def dfs(nodes):
        for d in nodes:
            order_list.append(d)
            if d.id in children:
                dfs(children[d.id])

    dfs(root)
    return order_list


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        qs = Department.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        # 先序遍历确保树形显示顺序
        sorted_list = [d for d in _build_dept_order() if d in list(queryset)]
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
        qs = UserOrganization.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)

        # 部门层级排序（与 DepartmentViewSet 先序遍历一致）
        dept_order_list = [d.id for d in _build_dept_order()]
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
        return qs.annotate(
            dept_order=dept_order,
            role_order=role_order,
        ).order_by(
            'dept_order',
            'role_order',
            'name',
        )
