import requests
import json

# 先获取登录token
login_response = requests.post(
    "http://localhost:18001/api/v1/auth/login",
    json={"username": "admin", "password": "pmos01"}
)

if login_response.status_code != 200:
    print("❌ 登录失败")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

print("✅ 登录成功")

# 测试配置管理 - 创建配置项
print("\n=== 测试配置管理 ===")
config_item = {
    "name": "测试配置项",
    "value": "测试值",
    "type": "string",
    "category": "test",
    "description": "测试配置项描述",
    "is_sensitive": False
}

response = requests.post(
    "http://localhost:18001/api/v1/configuration/items",
    headers=headers,
    json=config_item
)

if response.status_code == 201:
    print("✅ 配置项创建成功")
    print(f"   响应: {response.json()}")
else:
    print(f"❌ 配置项创建失败: {response.status_code} - {response.text}")

# 测试演练管理 - 创建演练计划
print("\n=== 测试演练管理 ===")
drill_plan = {
    "project_id": "test-project",
    "name": "网络故障应急演练",
    "description": "测试网络故障应急响应流程",
    "type": "network",
    "status": "planned",
    "scheduled_date": "2026-06-01T10:00:00Z",
    "participants": ["user1", "user2"],
    "result": "",
    "lessons_learned": ""
}

response = requests.post(
    "http://localhost:18001/api/v1/configuration/drills",
    headers=headers,
    json=drill_plan
)

if response.status_code == 201:
    print("✅ 演练计划创建成功")
    print(f"   响应: {response.json()}")
else:
    print(f"❌ 演练计划创建失败: {response.status_code} - {response.text}")

# 测试投产管理 - 创建投产计划
print("\n=== 测试投产管理 ===")
deployment_plan = {
    "project_id": "test-project",
    "name": "V1.0版本投产",
    "description": "系统首次上线投产",
    "version": "1.0.0",
    "status": "planned",
    "scheduled_date": "2026-06-15T22:00:00Z",
    "rollback_plan": "回滚到上一版本",
    "approver_id": "admin",
    "deployed_by": "",
    "result": ""
}

response = requests.post(
    "http://localhost:18001/api/v1/configuration/deployments",
    headers=headers,
    json=deployment_plan
)

if response.status_code == 201:
    print("✅ 投产计划创建成功")
    print(f"   响应: {response.json()}")
else:
    print(f"❌ 投产计划创建失败: {response.status_code} - {response.text}")

# 测试工作记录 - 创建工时记录
print("\n=== 测试工作记录 ===")
work_record = {
    "user_id": "admin",
    "project_id": "test-project",
    "date": "2026-05-26T00:00:00Z",
    "hours": 8.0,
    "type": "work",
    "description": "完成项目需求分析",
    "status": "submitted"
}

response = requests.post(
    "http://localhost:18001/api/v1/configuration/work-records",
    headers=headers,
    json=work_record
)

if response.status_code == 201:
    print("✅ 工时记录创建成功")
    print(f"   响应: {response.json()}")
else:
    print(f"❌ 工时记录创建失败: {response.status_code} - {response.text}")

print("\n=== 所有模块测试完成 ===")