# PMOS 部署指南

## 环境要求

- Docker 24+ / Docker Compose 2.0+
- 或 Kubernetes 1.28+
- MongoDB 7.x
- Node.js 20+ (开发环境)
- Python 3.12+ (开发环境)

## 快速启动 (Docker Compose)

```bash
# 克隆仓库
git clone <repo-url>
cd PMOS

# 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 修改 JWT_SECRET 等敏感配置

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 访问应用
# 前端: http://localhost:80
# 后端 API: http://localhost:18001
# API 文档: http://localhost:18001/docs
```

## 开发环境

```bash
# 后端
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 18001

# 前端
cd frontend
npm install
npm run dev
```

## Kubernetes 部署

```bash
# 应用所有配置
kubectl apply -f deploy/k8s/

# 或使用 Helm (待实现)
# helm install pmos deploy/helm/
```

## 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| MONGO_URL | MongoDB 连接字符串 | mongodb://localhost:27017 |
| MONGO_DB_NAME | 数据库名称 | pmos |
| JWT_SECRET | JWT 签名密钥 | (必须修改) |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token 过期时间 | 1440 |
| APP_NAME | 应用名称 | PMOS |
| API_PREFIX | API 前缀 | /api/v1 |
| ALLOWED_ORIGINS | 允许的 CORS 源 | http://localhost:5173 |

## 监控与日志

- 健康检查: `/health`
- 日志: Docker logs / Kubernetes logs
- 指标: Prometheus (待集成)

## 数据库备份

```bash
# MongoDB 备份
mongodump --uri="mongodb://admin:password@localhost:27017/pmos" --out=/backup/$(date +%Y%m%d)

# MongoDB 恢复
mongorestore --uri="mongodb://admin:password@localhost:27017/pmos" /backup/20250521/
```

## 安全注意事项

1. 生产环境务必修改 `JWT_SECRET`
2. 使用 HTTPS (配置 TLS/SSL)
3. 配置防火墙规则
4. 定期更新依赖
5. 启用 MongoDB 认证
6. 使用 Secret 管理敏感信息
