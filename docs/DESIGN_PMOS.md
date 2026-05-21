---
version: alpha
name: PMOS-Design-Language
description: 项目管理操作平台 (PMOS) 的设计系统 — 基于 OKLCH 色彩空间的企业级管理界面。主色调为清新绿色，配合中性灰蓝背景，营造专业且舒缓的视觉体验。采用清晰的网格布局、卡片式数据展示和纯 CSS 实现的可视化图表。

colors:
  bg: "oklch(98% 0.005 250)"
  surface: "oklch(100% 0 0)"
  fg: "oklch(22% 0.02 240)"
  muted: "oklch(50% 0.018 240)"
  border: "oklch(90% 0.008 240)"
  accent: "oklch(58% 0.16 145)"
  accent-hover: "oklch(52% 0.14 145)"
  accent-soft: "oklch(95% 0.04 145)"
  danger: "oklch(55% 0.18 25)"
  danger-soft: "oklch(95% 0.04 25)"
  warning: "oklch(70% 0.12 80)"
  warning-soft: "oklch(96% 0.03 80)"
  success: "oklch(60% 0.16 145)"
  success-soft: "oklch(95% 0.04 145)"
  info: "oklch(55% 0.14 250)"
  info-soft: "oklch(95% 0.04 240)"
  muted-soft: "oklch(97% 0.02 240)"
  shadow-ambient: "0 1px 3px rgba(0,0,0,0.06)"
  shadow-card: "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)"
  shadow-elevated: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)"

typography:
  font-display: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif"
  font-body: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif"
  font-mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, Menlo, monospace"
  display-xl:
    fontFamily: "{typography.font-display}"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1
  display-lg:
    fontFamily: "{typography.font-display}"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.1
  display-md:
    fontFamily: "{typography.font-display}"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.2
  heading-lg:
    fontFamily: "{typography.font-display}"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.25
  heading-md:
    fontFamily: "{typography.font-display}"
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.33
  body-lg:
    fontFamily: "{typography.font-body}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: "{typography.font-body}"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  body-mono:
    fontFamily: "{typography.font-mono}"
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.4
  label-sm:
    fontFamily: "{typography.font-display}"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.33
    textTransform: uppercase
    letterSpacing: 0.04em
  micro:
    fontFamily: "{typography.font-body}"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: 0.06em

rounded:
  sm: 4px
  md: 6px
  lg: 8px
  pill: 12px
  full: 50%

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px

borderWidth:
  hairline: 1px
  thin: 2px

components:
  header:
    backgroundColor: "{colors.surface}"
    height: 56px
    padding: 0 24px
    borderBottom: "{borderWidth.hairline} solid {colors.border}"
    boxShadow: "{colors.shadow-ambient}"
  sidebar:
    backgroundColor: "{colors.surface}"
    width: 260px
    borderRight: "{borderWidth.hairline} solid {colors.border}"
    padding: 16px 0
  main:
    padding: 24px
    gap: 24px
  kpi-card:
    backgroundColor: "{colors.surface}"
    borderRadius: "{rounded.lg}"
    padding: 20px 16px
    border: "{borderWidth.hairline} solid {colors.border}"
    boxShadow: "{colors.shadow-card}"
  module-card:
    backgroundColor: "{colors.surface}"
    borderRadius: "{rounded.lg}"
    padding: 16px
    border: "{borderWidth.hairline} solid {colors.border}"
    boxShadow: "{colors.shadow-card}"
  chart-card:
    backgroundColor: "{colors.surface}"
    borderRadius: "{rounded.lg}"
    padding: 20px
    border: "{borderWidth.hairline} solid {colors.border}"
    boxShadow: "{colors.shadow-card}"
  alert-info:
    backgroundColor: "oklch(97% 0.02 240)"
    border: "{borderWidth.hairline} solid oklch(90% 0.04 240)"
    borderRadius: "{rounded.md}"
    padding: 12px 16px
  alert-warn:
    backgroundColor: "oklch(97% 0.03 80)"
    border: "{borderWidth.hairline} solid oklch(90% 0.05 80)"
    borderRadius: "{rounded.md}"
    padding: 12px 16px
  alert-crit:
    backgroundColor: "oklch(97% 0.02 25)"
    border: "{borderWidth.hairline} solid oklch(90% 0.04 25)"
    borderRadius: "{rounded.md}"
    padding: 12px 16px
  nav-item:
    padding: 9px 16px
    margin: 0 8px
    borderRadius: "{rounded.md}"
    fontSize: 14px
  nav-item-active:
    backgroundColor: "{colors.accent}"
    color: "#ffffff"
    fontWeight: 600
  button-primary:
    backgroundColor: "{colors.accent}"
    color: "#ffffff"
    borderRadius: "{rounded.md}"
    padding: 8px 16px
    fontWeight: 600
  button-secondary:
    backgroundColor: "{colors.surface}"
    color: "{colors.fg}"
    border: "{borderWidth.hairline} solid {colors.border}"
    borderRadius: "{rounded.md}"
    padding: 8px 16px
  search-box:
    backgroundColor: "{colors.bg}"
    border: "{borderWidth.hairline} solid {colors.border}"
    borderRadius: "{rounded.md}"
    padding: 7px 12px 7px 34px
    width: 240px
  status-pill-ok:
    backgroundColor: "{colors.success-soft}"
    color: "oklch(45% 0.12 145)"
    borderRadius: 12px
    padding: 2px 8px
    fontSize: 11px
  status-pill-warn:
    backgroundColor: "{colors.warning-soft}"
    color: "oklch(55% 0.10 80)"
    borderRadius: 12px
    padding: 2px 8px
    fontSize: 11px
  status-pill-alert:
    backgroundColor: "{colors.danger-soft}"
    color: "oklch(50% 0.12 25)"
    borderRadius: 12px
    padding: 2px 8px
    fontSize: 11px
---

## Overview

PMOS 的设计语言以 **OKLCH 色彩空间**为核心，营造专业、清晰的企业管理界面。主色调采用绿色系 `oklch(58% 0.16 145)`，象征成长与稳定；背景使用中性灰蓝 `oklch(98% 0.005 250)`，提供舒适的阅读体验。

界面采用 **Header + Sidebar + Main** 的三栏经典布局，卡片式数据展示贯穿所有模块。可视化图表使用纯 CSS/SVG 实现，保障加载性能的同时提供流畅的交互动效。

**关键特征:**

- OKLCH 色彩空间统一管理全系统颜色，确保视觉一致性
- 绿色主色调 `oklch(58% 0.16 145)` 作为品牌色，应用于导航高亮、CTA 按钮、图表强调
- 三级预警系统 (info/warn/crit) 对应蓝/橙/红语义色
- 卡片式布局统一所有数据展示模块 (KPI/ Module/ Chart)
- 纯 CSS/SVG 实现环形图和条形图，保证性能与动效
- 等宽字体用于所有数值显示，增强数字可读性
- 响应式断点自适应网格布局

## Colors

> **Source files:** [`design/dashboard.html`](file:///Users/hefeng/AiApp/PMOS/design/dashboard.html), [`design/project-management.html`](file:///Users/hefeng/AiApp/PMOS/design/project-management.html), [`design/resource-management.html`](file:///Users/hefeng/AiApp/PMOS/design/resource-management.html)

### Semantic Colors

| Token | Value | Use |
| --- | --- | --- |
| `{colors.accent}` | `oklch(58% 0.16 145)` | 主品牌色：导航高亮、CTA 按钮、图表强调 |
| `{colors.accent-hover}` | `oklch(52% 0.14 145)` | 主品牌色悬停状态 |
| `{colors.accent-soft}` | `oklch(95% 0.04 145)` | 品牌色柔和背景 (状态标签) |
| `{colors.success}` | `oklch(60% 0.16 145)` | 成功状态、上升趋势 |
| `{colors.success-soft}` | `oklch(95% 0.04 145)` | 成功状态柔和背景 |
| `{colors.warning}` | `oklch(70% 0.12 80)` | 警告状态、中等优先级 |
| `{colors.warning-soft}` | `oklch(96% 0.03 80)` | 警告状态柔和背景 |
| `{colors.danger}` | `oklch(55% 0.18 25)` | 错误/危险状态、下降趋势 |
| `{colors.danger-soft}` | `oklch(95% 0.04 25)` | 危险状态柔和背景 |
| `{colors.info}` | `oklch(55% 0.14 250)` | 信息/次要强调 |
| `{colors.info-soft}` | `oklch(95% 0.04 240)` | 信息状态柔和背景 |

### Surface Colors

| Token | Value | Use |
| --- | --- | --- |
| `{colors.bg}` | `oklch(98% 0.005 250)` | 全局背景色 |
| `{colors.surface}` | `oklch(100% 0 0)` | 卡片/面板/导航表面 |
| `{colors.border}` | `oklch(90% 0.008 240)` | 边框/分隔线 |
| `{colors.muted}` | `oklch(50% 0.018 240)` | 次要文字/标签 |

### Text Colors

| Token | Value | Use |
| --- | --- | --- |
| `{colors.fg}` | `oklch(22% 0.02 240)` | 主要文字 |
| `{colors.muted}` | `oklch(50% 0.018 240)` | 次要文字、辅助信息 |

### Shadows

| Token | Value | Use |
| --- | --- | --- |
| `{colors.shadow-ambient}` | `0 1px 3px rgba(0,0,0,0.06)` | 环境阴影 (Header) |
| `{colors.shadow-card}` | `0 4px 12px rgba(0,0,0,0.08)` | 卡片悬浮阴影 |
| `{colors.shadow-elevated}` | `0 8px 24px rgba(0,0,0,0.10)` | 高悬浮起阴影 |

## Typography

### Font Family

系统字体栈优先使用 **Apple System**:

- **Display/UI**: `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif`
- **Monospace**: `'JetBrains Mono', 'IBM Plex Mono', ui-monospace, Menlo, monospace`

### Hierarchy

| Token | Size | Weight | Line Height | Use |
| --- | --- | --- | --- | --- |
| `{typography.display-xl}` | 28px | 700 | 1.0 | KPI 数值、核心数据 |
| `{typography.display-lg}` | 24px | 700 | 1.1 | 模块统计数据 |
| `{typography.display-md}` | 18px | 600 | 1.2 | OPS 数据、Logo |
| `{typography.heading-lg}` | 16px | 700 | 1.25 | 章节标题 |
| `{typography.heading-md}` | 15px | 700 | 1.33 | 图表标题 |
| `{typography.body-lg}` | 14px | 400 | 1.5 | 正文内容 |
| `{typography.body-md}` | 13px | 400 | 1.5 | 辅助文字 |
| `{typography.body-mono}` | 13px | 700 | 1.4 | 数值显示 |
| `{typography.label-sm}` | 12px | 600 | 1.33 | 标签 (大写) |
| `{typography.micro}` | 11px | 600 | 1.45 | 元数据、页脚 |

### Principles

- **等宽字体用于所有数值**：KPI、图表、OPS 数据统一使用 `{typography.font-mono}`
- **粗体强调**：数值显示使用 700 字重，增强视觉层次
- **大写字母标签**：KPI 标签使用 `text-transform: uppercase` + `letter-spacing: 0.04em`
- **微间距增强可读性**：小字号配合增加的行间距

## Layout

### Spacing System

基于 **8px 栅格系统**:

- `{spacing.xxs}` 2px — 微调间距
- `{spacing.xs}` 4px — 紧密间距
- `{spacing.sm}` 8px — 标准紧缩
- `{spacing.md}` 12px — 常规间距
- `{spacing.lg}` 16px — 标准间距
- `{spacing.xl}` 24px — 大间距
- `{spacing.xxl}` 32px — 超大间距

**Section 边距:**

- Header/Sidebar: 24px 内边距
- Main content: 24px 外边距，24px 卡片间距
- Mobile: 16px 内边距

### Grid & Container

**桌面端 (≥1600px):**

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (height: 56px)                                        │
├──────────┬──────────────────────────────────────────────────┤
│ 260px    │                                                  │
│ SIDEBAR  │  MAIN CONTENT (gap: 24px)                        │
│          │  ┌──────┬──────┬──────┬──────┬──────┬──────┐    │
│ 导航菜单   │  │ KPI  │ KPI  │ KPI  │ KPI  │ KPI  │ KPI  │    │
│          │  │      │      │      │      │      │      │    │
│          │  └──────┴──────┴──────┴──────┴──────┴──────┘    │
│          │  ┌──────────────┐  ┌──────────────┐             │
│          │  │  环形图      │  │  条形图      │             │
│          │  └──────────────┘  └──────────────┘             │
└──────────┴──────────────────────────────────────────────────┘
```

**响应式断点:**

| 断点 | KPI 网格 | 模块网格 | 图表布局 | Sidebar |
| --- | --- | --- | --- | --- |
| ≥1600px | 6 列 | 5 列 | 2 列 | 显示 |
| 1200-1600px | 3 列 | 3 列 | 2 列 | 显示 |
| 768-1200px | 2 列 | 2 列 | 1 列 | 显示 |
| <768px | 2 列 | 2 列 | 1 列 | 隐藏 |

### 卡片间距

- KPI 卡片：16px
- 模块卡片：12px
- 图表卡片：20px

## Elevation & Depth

| Level | 阴影值 | 使用场景 |
| --- | --- | --- |
| 0 | Flat | 默认表面 |
| 1 | `{colors.shadow-ambient}` | Header 底部阴影 |
| 2 | `{colors.shadow-card}` | 卡片标准悬浮 |
| 3 | `{colors.shadow-elevated}` | 卡片高亮悬浮 |

### 深度系统

卡片使用双层阴影系统:

- **标准状态**: `{colors.shadow-card}` — 温和的深度提示
- **悬浮状态**: `{colors.shadow-elevated}` + `translateY(-2px)` — 明显的交互反馈

## Shapes

### Border Radius Scale

| Token | Value | Use |
| --- | --- | --- |
| `{rounded.sm}` | 4px | 微调元素 |
| `{rounded.md}` | 6px | 输入框、导航项、预警卡片 |
| `{rounded.lg}` | 8px | 所有卡片 (KPI/Module/Chart/OPS) |
| `{rounded.pill}` | 12px | 状态标签 |
| `{rounded.full}` | 50% | 用户头像、环形图 |

### KPI 卡片顶部色条

```css
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;  /* 顶部强调条 */
  border-radius: {rounded.lg} {rounded.lg} 0 0;
  background: var(--topic-color);
}
```

## Components

### Header

**布局组成:**

- **左侧**: Logo + 面包屑
- **右侧**: 搜索框 + 用户头像

**搜索框:**

- 宽度：240px
- 左侧放大镜图标 (emoji  реализация)
- 聚焦时边框变为主题色

**用户头像:**

- 尺寸：32x32px
- 圆形 (`{rounded.full}`)
- 主题色背景 + 白色文字

### Sidebar Navigation

**导航项:**

```
┌─────────────────────┐
│ ◻  概览面板          │ ← 激活状态 bg:accent
├─────────────────────┤
│ 🗂  项目管理          │
├─────────────────────┤
│ 👥  资源管理          │
│ ...                 │
└─────────────────────┘
```

- **尺寸**: 9px 上下内边距，16px 左右内边距
- **间距**: 8px 外边距 (上下)
- **激活状态**: 主题色背景 + 白色文字 + 600 字重

**系统分隔:**

- `text-transform: uppercase`
- `font-size: 11px`
- `letter-spacing: 0.06em`
- `color: muted`

### KPI Card

**结构:**

```
┌─────── top accent bar (3px) ───────┐
│ [LABEL - uppercase + muted]        │
│                                      │
│             48                      │ ← display-xl, mono, 700
│         ▲ 12.5% 同比                 │ ← trend indicator
└──────────────────────────────────────┘
```

**变体:**

- `kpi-card.accent` — 主题强调 (项目总数)
- `kpi-card.success` — 积极指标 (进行中项目)
- `kpi-card.info` — 信息指标 (完成率)
- `kpi-card.warning` — 警告指标 (里程碑率)
- `kpi-card.danger` — 危险指标 (待处理)
- `kpi-card.muted` — 中性指标 (团队成员)

### Module Card

**结构:**

```
┌────────────────────────────┐
│ [icon]  模块名称            │
│                            │
│           156              │ ← stat: display-lg
│           人                │ ← statLabel: muted
│                            │
├────────────────────────────┤
│ [status]  查看详情→         │
```

**点击交互:**

- 悬浮：`shadow-elevated` + `translateY(-2px)`
- 点击：进入对应模块页面

### Chart Card

**环形图 (Donut Chart):**

```css
.donut-wrap svg {
  transform: rotate(-90deg);  /* 起始点在顶部 */
}

circle {
  stroke-dasharray: circumference proportion;
  transition: stroke-dasharray .8s ease-out;
}
```

**条形图 (Bar Chart):**

```css
.bar-track {
  background: {colors.bg};
  height: 22px;
  border-radius: {rounded.sm};
}

.bar-fill {
  height: 100%;
  border-radius: {rounded.sm};
  transition: width .8s ease-out;
}
```

### Alert Cards

**三级预警系统:**

| 类型 | 背景 | 边框 | 图标 | 使用场景 |
| --- | --- | --- | --- | --- |
| info | `{alert-info.bg}` | `{alert-info.border}` | ℹ️ | 日常提示 |
| warn | `{alert-warn.bg}` | `{alert-warn.border}` | ⚠️ | 需注意事项 |
| crit | `{alert-crit.bg}` | `{alert-crit.border}` | 🚨 | 高风险项 |

### Quick Actions

**按钮样式:**

```
┌────────────────┐  ← button-secondary (default)
│ ➕ 新建项目      │  ← button-primary (accent)
└────────────────┘
```

- **主要操作**: 主题色背景 + 白色文字
- **次要操作**: 透明背景 + 边框
- **悬浮**: 背景色微调 + 边框高亮

### Status Pill

**状态标签:**

| 状态 | 背景色 | 文字色 | 场景 |
| --- | --- | --- | --- |
| OK | `{colors.success-soft}` | oklch(45% 0.12 145) | 运行正常 |
| Warn | `{colors.warning-soft}` | oklch(55% 0.10 80) | 轻微异常 |
| Alert | `{colors.danger-soft}` | oklch(50% 0.12 25) | 严重问题 |

## Do's and Don'ts

### Do

- 使用 OKLCH 色彩空间确保颜色视觉一致性
- KPI 数值使用等宽字体 + 700 字重，增强数字可读性
- 卡片悬浮时使用 `translateY(-2px)` 组合阴影增强交互反馈
- 环形图使用 SVG + `stroke-dasharray` 实现平滑过渡动画
- KPI 顶部强调条 `3px` 色条区分卡片主题
- 搜索框使用 emoji 图标 (🔍) 保持轻量 (实现简单)
- Alert 卡片使用 emoji 图标 (ℹ️⚠️🚨) 清晰传达预警等级

### Don't

- 不要用纯黑 (`#000`) 替代深色 OKLCH 值
- 不要在数值显示中使用比例字体 (必须等宽)
- 不要在大字号中使用线宽字重 (保持 700)
- 不要在移动端显示侧边导航 (改用汉堡菜单)
- 不要用 JS 库实现图表 (纯 CSS/SVG 保持性能)
- 不要在小字号中使用普通字重 (小号用 600+ 增强可读性)

## Responsive Behavior

### Breakpoint 策略

**桌面端 (≥1600px):**

- 6 列 KPI 网格，5 列模块网格
- Side bar 始终显示
- 图表双列布局

**平板 (768-1200px):**

- 3 列 KPI 网格，2-3 列模块网格
- Sidebar 保持显示
- 图表单列布局 (堆叠)

**移动 (<768px):**

- 2 列 KPI 网格，2 列模块网格
- Sidebar 隐藏 (汉堡菜单)
- 所有布局单列堆叠

### Touch Targets

- 导航项：最小 40px 高度
- 按钮：最小 40x40px 触控区域
- 搜索框：44px 高度 (iOS 兼容)

### 降级策略

- Display 字号：28px → 24px → 20px 随断点缩小
- 网格列数：自动递减，最后一列为弹性填充
- Sidebar：完全隐藏，不保留占用空间

## Iteration Guide

1. 颜色使用 OKLCH 命名法 (`oklch(百分比 饱和度 角度)`)
2. 引用组件名称直接使用 class 名 (`.kpi-card`, `.module-card`)
3. 数值显示必须使用 `{typography.font-mono}` + 700 字重
4. 阴影使用预定义变量 (`{colors.shadow-card}`)
5. 圆角遵循 `{rounded.*}` 命名体系
6. 按钮尺寸固定为 `8px 16px` padding
7. 间距基于 8px 倍数，统一使用 `{spacing.*}` 变量
