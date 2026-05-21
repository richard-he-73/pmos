# PMOS 监控与告警配置指南

## 概述

PMOS 使用 Prometheus + Grafana 进行系统监控和可视化。

## 组件

| 组件 | 端口 | 说明 |
|------|------|------|
| Prometheus | 9090 | 指标收集与存储 |
| Grafana | 3000 | 可视化仪表盘 |
| Node Exporter | 9100 | 主机指标 |
| MongoDB Exporter | 9216 | 数据库指标 |

## 快速启动

```bash
cd deploy/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

## 访问

- Grafana: http://localhost:3000 (admin/pmos-admin)
- Prometheus: http://localhost:9090

## 告警规则

### 项目预警

- 超期任务数 > 0 → 触发告警
- 预算使用率 > 80% → 触发告警
- 高风险数 > 0 → 触发告警

### 系统预警

- API 响应时间 > 1s → 触发告警
- 错误率 > 5% → 触发告警
- 磁盘使用率 > 80% → 触发告警

## 集成

PMOS 后端通过 `/metrics` 端点暴露指标数据，Prometheus 定期抓取。
Grafana 仪表盘已预配置数据源和常用面板。
