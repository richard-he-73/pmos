#!/usr/bin/env python3
"""测试用户登录脚本"""
import httpx
import json

BASE_URL = "http://localhost:18001/api/v1"

users = [
    {"username": "admin", "password": "Admin@123456"},
    {"username": "manager1", "password": "Manager@123"},
    {"username": "developer1", "password": "Dev@123456"},
    {"username": "tester1", "password": "Test@123456"},
]


def test_login():
    with httpx.Client(base_url=BASE_URL) as client:
        for user in users:
            try:
                response = client.post("/auth/login", json=user)
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ 登录成功: {user['username']}")
                    print(f"   Token: {data['access_token'][:30]}...")
                    print(f"   Token 类型: {data['token_type']}")
                    print()
                else:
                    print(f"❌ 登录失败: {user['username']}")
                    print(f"   状态码: {response.status_code}")
                    print(f"   响应: {response.text}")
                    print()
            except Exception as e:
                print(f"❌ 请求异常: {user['username']} - {e}")
                print()


if __name__ == "__main__":
    print("=" * 60)
    print("PMOS 测试用户登录验证")
    print("=" * 60)
    print()
    test_login()
    print("=" * 60)
    print("登录验证完成!")
    print("=" * 60)
