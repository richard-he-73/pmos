# PMOS - Project Management Operating System

## 概述
PMOS 是一个现代化的项目管理平台，基于 FastAPI + React + MongoDB 构建。

## 技术栈
- **前端**: React 18 + TypeScript + Ant Design + ECharts
- **后端**: Python 3.12 + FastAPI + Motor (async MongoDB)
- **数据库**: MongoDB 7
- **部署**: Docker / Kubernetes

## 快速启动

```bash
# Docker Compose (推荐)
docker-compose up -d

# 开发环境
cd backend && uv run uvicorn app.main:app --reload
cd frontend && npm run dev
```

## 项目结构
```
PMOS/
├── backend/          # FastAPI 后端
│   ├── app/         # 应用代码
│   │   ├── api/v1/  # API 路由
│   │   ├── core/    # 核心配置
│   │   ├── models/  # 数据模型
│   │   └── schemas/ # Pydantic schemas
│   └── tests/       # 单元测试
├── frontend/         # React 前端
│   ├── src/         # 源代码
│   │   ├── api/     # API 客户端
│   │   ├── features/# 功能模块
│   │   └── types/   # TypeScript 类型
├── deploy/           # 部署配置
│   ├── k8s/         # Kubernetes manifests
│   └── nginx.conf   # Nginx 配置
└── docker-compose.yml
```

## 功能模块
- ✅ 项目管理
- ✅ 任务管理
- ✅ 资源管理
- ✅ 风险管理
- ✅ 需求管理
- ✅ 开发管理 (迭代/代码评审)
- ✅ 测试管理 (用例/缺陷/报告)
- ✅ 数据可视化 (ECharts)
- ✅ 甘特图
- ✅ 权限管理 (RBAC)
- ✅ 通知系统
- ✅ 沟通/配置/演练/投产/工作管理
- ✅ 报表导出 (CSV/JSON)

## 文档
- [部署指南](deploy/DEPLOYMENT.md)
- [API 文档](http://localhost:18001/docs) (运行后访问)
- [项目架构](PROJECT_PLAN.md)

## License
Enterprise
