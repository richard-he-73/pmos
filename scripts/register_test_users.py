#!/usr/bin/env python3
"""注册测试用户脚本"""
import httpx
import json

BASE_URL = "http://localhost:18001/api/v1"

users = [
    {
        "username": "admin",
        "email": "admin@pmos.com",
        "password": "Admin@123456",
        "display_name": "系统管理员",
        "role": "admin",
        "department": "PMO",
    },
    {
        "username": "manager1",
        "email": "manager@pmos.com",
        "password": "Manager@123",
        "display_name": "项目经理",
        "role": "manager",
        "department": "产品研发部",
    },
    {
        "username": "developer1",
        "email": "dev@pmos.com",
        "password": "Dev@123456",
        "display_name": "开发工程师",
        "role": "member",
        "department": "技术部",
    },
    {
        "username": "tester1",
        "email": "tester@pmos.com",
        "password": "Test@123456",
        "display_name": "测试工程师",
        "role": "member",
        "department": "质量保障部",
    },
]


def register_users():
    with httpx.Client(base_url=BASE_URL) as client:
        for user in users:
            try:
                response = client.post("/auth/register", json=user)
                if response.status_code == 201:
                    data = response.json()
                    print(
                        f"✅ 用户创建成功: {user['username']} ({user['display_name']})"
                    )
                    print(f"   ID: {data.get('_id', data.get('id'))}")
                    print(f"   角色: {data.get('role')}")
                    print(f"   部门: {data.get('department')}")
                    print()
                elif response.status_code == 400:
                    print(
                        f"⚠️  用户已存在: {user['username']} - {response.json().get('detail')}"
                    )
                    print()
                else:
                    print(f"❌ 注册失败: {user['username']}")
                    print(f"   状态码: {response.status_code}")
                    print(f"   响应: {response.text}")
                    print()
            except Exception as e:
                print(f"❌ 请求异常: {user['username']} - {e}")
                print()


if __name__ == "__main__":
    print("=" * 60)
    print("PMOS 测试用户注册")
    print("=" * 60)
    print()
    register_users()
    print("=" * 60)
    print("注册完成!")
    print("=" * 60)
