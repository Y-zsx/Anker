# ANKERHUB - AI 耳机模拟系统

## 系统实现报告

> **版本：** 1.0.0
> **技术栈：** FastAPI + React 19 + TypeScript + Tailwind CSS 4 + SQLite
> **架构：** 三层设计 — 设备模拟 → AI 处理 → UI

---

## 1. 项目概述

ANKERHUB 是一个全栈模拟系统，展示了 AI 蓝牙耳机的完整设备-APP-云端-AI 流程。系统覆盖了从设备连接、音频采集、AI 处理（转录、翻译、摘要）到性能报告的全链路用户旅程。

系统实现了所有核心任务需求以及多项加分功能，提供了完整的闭环演示，包含实时数据流、持久化数据存储和精美的移动端优先 UI。

---

## 2. 架构

```
┌─────────────────────────────────────────────────────┐
│                   前端 (React 19)                    │
│  PhoneFrame → TabBar → 页面                          │
│  设备  │  聆听  │  记录  │  报告  │  设置             │
│                  AppContext (状态管理)                 │
├───────────────────┬─────────────────────────────────┤
│  REST API + SSE   │  Vite 开发服务器 (5173)          │
├───────────────────┴─────────────────────────────────┤
│                   后端 (FastAPI)                      │
│  设备模拟器        │  音频模拟器     │  AI 服务       │
│  单例模式         │  实时 SSE       │  模拟+持久化    │
├─────────────────────────────────────────────────────┤
│                   数据层 (SQLite)                     │
│  会话记录 │ 设备事件 │ 性能指标                        │
│  AI 配置  │ 隐私设置                                   │
└─────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 后端 API | FastAPI + Uvicorn | REST + SSE 数据流 |
| ORM | SQLAlchemy (异步) | 数据库抽象 |
| 数据库 | aiosqlite / SQLite | 持久化存储 |
| 前端 | React 19 + TypeScript | UI 组件 |
| 样式 | Tailwind CSS 4 | 移动端优先响应式 |
| 图标 | lucide-react | 图标库 |
| 状态管理 | React Context | 全局状态管理 |
| 构建 | Vite 8 | 开发服务器 + 打包工具 |

---

## 3. 模块实现

### 3.1 设备连接（DeviceConnect）

**实现文件：** `backend/services/device_simulator.py`、`backend/routers/devices.py`、`frontend/pages/PageDevice.tsx`

- 模拟蓝牙耳机完整生命周期：`搜索中 → 连接中 → 握手 → 已连接`
- SSE 实时推送连接进度更新
- 设备状态管理，包含电量消耗模拟、信号波动、温度监控
- 设备发现功能，内置模拟设备目录（earbuds_pro_001）
- 断开连接时自动清理并重置状态

**核心功能：**
- 4 阶段连接流程，用户可见进度提示
- 电量随时间递减（后台异步任务）
- 信号强度真实波动（-35 至 -55 dBm）
- 温度模拟（30-42°C 范围）
- 音频延迟模拟（15-45ms）

### 3.2 设备监控（DeviceMonitor）

**实现文件：** `backend/services/device_simulator.py`、`frontend/pages/PageDevice.tsx`

实时监控仪表板展示：
- 电池百分比及图标指示
- 信号强度（RSSI）及质量指示
- 固件版本显示
- 当前温度
- 音频延迟测量
- 麦克风状态开关
- 连接运行时长追踪
- 设备 ID 和连接类型详情
- 连接时间记录

### 3.3 音频采集（AudioCapture）

**实现文件：** `backend/services/audio_simulator.py`、`backend/routers/audio.py`、`frontend/pages/PageListen.tsx`

- 实时音频指标 SSE 推送，频率 4Hz（每 250ms）
- 四种场景模式：会议、学习、办公、日常
- 实时波形可视化（40 条动态柱状图）
- 实时计时器显示（100ms 精度）
- 音量、噪声等级、清晰度评分指示
- 开始/停止录音控制

**数据流：**
1. 用户选择场景 → 点击"开始聆听"
2. 后端模拟音频采集，逐步生成转录文本
3. 前端以 4Hz 频率接收指标流，实时更新 UI
4. 用户点击"停止" → 音频采集结束，保存指标快照

### 3.4 AI 处理（AIProcessing）

**实现文件：** `backend/routers/ai.py`、`frontend/context/AppContext.tsx`

SSE 流式 AI 处理管线：
1. **转录中** — 语音转文字模拟
2. **翻译中** — 跨语言翻译（英→中 / 中→英）
3. **摘要中** — 内容摘要生成
4. **完成** — 返回结果

每个阶段实时报告进度（0-100%）和置信度评分。

**各场景模拟数据：**
- 会议：产品规划讨论
- 学习：AI 课程讲座
- 办公：音乐播放和专注模式指令
- 日常：天气和日常活动

### 3.5 结果展示（ResultPresentation）

**实现文件：** `frontend/pages/PageResults.tsx`

- 日期命名条目：`2026年5月26日 17:09`
- 播放可视化波形条
- 可展开详情视图，展示：
  - 原始转录文本
  - 翻译文本
  - AI 生成摘要
- 年/月/日级联日期筛选
- **复制**：复制到剪贴板（带确认提示）
- **下载**：导出为 `.txt` 文件
- 当前筛选标签显示
- 空状态引导提示

### 3.6 性能报告（PerformanceReport）

**实现文件：** `backend/routers/report.py`、`frontend/pages/PageReport.tsx`

- 概览卡片：平均响应时间、总处理次数
- SVG 环形图展示转录准确率（按质量着色）
- AI 处理时间及质量趋势指标
- 连接稳定性（运行时间百分比）
- 响应时间趋势柱状图（按会话对比）
- 环境信息：噪声等级、语速、当前设备
- 瓶颈检测与警告
- 个性化优化建议

### 3.7 设置（隐私与配置）

**实现文件：** `frontend/pages/PageSettings.tsx`、`backend/routers/report.py`

- 设备管理：当前设备显示、自动重连开关、麦克风权限
- 音频设置：源语言/目标语言选择
- 隐私控制：仅本地模式开关、数据保留期限（7/30/90 天）、分析数据收集选项
- **清除所有数据**：后端 API，删除会话记录、性能指标和非必要设备事件
- 可展开隐私详情，包含数据存储说明
- 关于部分：应用版本、架构、协议信息

---

## 4. 加分功能实现

### 4.1 隐私与信任模块

| 功能 | 实现 |
|------|------|
| 录音前权限对话框 | 上拉弹窗说明数据收集内容，含允许/拒绝按钮 |
| 处理后隐私提示 | Toast 通知："您的音频数据已在本地处理，未上传至任何云端服务器" |
| 清除隐私数据 | 后端 DELETE 接口，带确认对话框 |
| 数据保留设置 | 可配置 7/30/90 天自动过期 |
| 仅本地模式开关 | 隐私设置控制 |

### 4.2 导出与分享

| 功能 | 实现 |
|------|------|
| 复制到剪贴板 | 格式化会话数据（转录+翻译+摘要），含场景标签 |
| 下载为 .txt | 创建 blob 下载，日期命名文件 |
| 复制确认 | 视觉对勾 + "已复制" 反馈 |

### 4.3 异常处理

| 功能 | 实现 |
|------|------|
| 意外断连检测 | `wasConnectedRef` 追踪 AppContext，检测 phase=idle 但已连接状态 |
| 自动弹出断连弹窗 | 全屏模态框，含"重新连接"和"关闭"选项 |
| 一键重连 | 导航至设备页面并重新发起连接 |
| 主动断连跳过 | 用户主动断开连接不触发弹窗 |

---

## 5. 数据库结构

### 5.1 会话记录（sessions）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String(36) | 主键（UUID） |
| device_id | String(64) | 关联设备 |
| scenario | String(32) | 会议/学习/办公/日常 |
| created_at | DateTime | UTC 时间戳 |
| duration_sec | Float | 录音时长 |
| original_text | Text | 转录结果 |
| translated_text | Text | 翻译结果 |
| summary | Text | AI 摘要 |
| confidence | Float | 置信度评分 |
| processing_time_ms | Integer | AI 处理时间 |
| confidence_segments | JSON | 分段置信度 |
| ai_mode | String(32) | 标准/高精度 |

### 5.2 设备事件（device_events）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String(36) | 主键 |
| device_id | String(64) | 设备标识符 |
| device_name | String(128) | 显示名称 |
| event_type | String(32) | 已连接/已断开 |
| timestamp | DateTime | 事件时间 |
| battery_pct | Integer | 事件时电量 |
| signal_strength | Integer | 事件时信号强度 |

### 5.3 性能指标（performance_metrics）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String(36) | 主键 |
| session_id | String(36) | 外键关联会话 |
| scenario | String(32) | 场景类型 |
| processing_time_ms | Integer | 处理耗时 |
| confidence | Float | 置信度评分 |
| ai_mode | String(32) | 使用的 AI 模式 |
| noise_level | Float | 环境噪声 |
| clarity_score | Float | 音频清晰度 |
| created_at | DateTime | 创建时间 |

### 5.4 AI 配置（ai_configs）与隐私设置（privacy_settings）
配置和偏好存储表。

---

## 6. API 接口

### 设备管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/devices` | 获取可用设备列表 |
| POST | `/api/device/connect/{id}` | 连接设备（SSE） |
| POST | `/api/device/disconnect` | 断开设备连接 |
| GET | `/api/device/status` | 获取当前设备状态 |

### 音频采集
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/audio/start/{scenario}` | 开始录音（SSE） |
| POST | `/api/audio/stop` | 停止录音 |
| GET | `/api/audio/state` | 获取当前音频状态 |

### AI 处理
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/process?scenario={s}` | 处理音频（SSE） |
| GET | `/api/ai/config` | 获取 AI 配置 |
| GET | `/api/ai/result` | 获取最新 AI 结果 |

### 报告
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/report` | 获取性能报告 |
| GET | `/api/report/sessions` | 获取会话历史 |
| DELETE | `/api/report/clear` | 清除所有用户数据 |

### 健康检查
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 系统健康检查 |

---

## 7. 前端页面

| 页面 | 路由（标签） | 核心功能 |
|------|-------------|---------|
| PageDevice | 设备 | 连接流程、设备指标、设备管理 |
| PageListen | 聆听 | 场景选择、波形展示、计时、录音控制 |
| PageResults | 记录 | 会话历史、日期筛选、导出/下载 |
| PageReport | 报告 | 准确率图表、趋势分析、瓶颈检测、优化建议 |
| PageSettings | 设置 | 隐私、设备、音频、关于 |

---

## 8. 关键设计决策

### 8.1 模拟器单例模式

DeviceSimulator 和 AudioSimulator 使用单例模式，在多次 HTTP 请求间维持状态。这对于 SSE 流式模型至关重要，录音状态必须在开始/停止/指标请求之间保持持久化。

### 8.2 SSE 实时数据流

所有实时数据（连接进度、音频指标、AI 处理进度）均通过 POST + ReadableStream 使用 Server-Sent Events。优势包括：
- 单向服务器到客户端流式传输
- 无需 WebSocket 复杂性
- 原生浏览器支持
- 自动重连处理

### 8.3 React Context 状态管理

所有全局状态通过 React Context（AppContext）管理，而非 Redux/Zustand。这适用于应用适中的状态复杂度，保持代码库简洁可审计。

### 8.4 移动端优先设计

- 375x812 手机框架，便于桌面调试
- 底部标签导航（5 个标签）
- 每页独立的设备状态守卫，而非标签级禁用
- 深色主题，ANKERHUB 品牌风格

### 8.5 SQLite 持久化

异步 SQLite（aiosqlite）通过 SQLAlchemy ORM 提供：
- 零外部依赖
- 基于文件的持久化
- 完整 SQL 支持
- 易于备份/导出

---

## 9. 运行方式

### 后端
```bash
cd d:\考试
pip install -r requirements.txt
python -m backend.main
# 服务器运行于 http://localhost:8000
```

### 前端
```bash
cd d:\考试\frontend
npm install
npm run dev
# 开发服务器运行于 http://localhost:5173
# 代理：/api → http://localhost:8000
```

### 数据库
首次启动后端时自动初始化：
```
python -m backend.scripts.init_db
```

---

## 10. 任务覆盖总结

| 需求 | 状态 | 说明 |
|------|------|------|
| 设备连接 | ✅ 完成 | 4 阶段 SSE 流式推送，信号强度 |
| 设备监控 | ✅ 完成 | 电量、信号、固件、温度、延迟 |
| 音频采集 | ✅ 完成 | 波形、指标、开始/停止、场景 |
| AI 处理 | ✅ 完成 | 转录/翻译/摘要，进度 SSE |
| 结果展示 | ✅ 完成 | 文本卡片、播放可视化 |
| 性能报告 | ✅ 完成 | 图表、瓶颈检测、优化建议 |
| 隐私与信任 | ✅ 完成 | 权限对话框、隐私提示、数据清除 |
| 导出与分享 | ✅ 完成 | 剪贴板复制、.txt 下载 |
| 异常处理 | ✅ 完成 | 断连自动弹窗、重连提示 |
| 场景感知 | ⚠️ 部分 | 场景选择已实现；自动检测未实现 |

**总体覆盖率：核心需求 95%+ 及 3/4 项加分功能**

---

## 11. 文件结构

```
d:\考试\
├── README.md                              # 本文件
├── requirements.txt                       # Python 依赖
├── backend/
│   ├── main.py                            # FastAPI 入口
│   ├── config.py                          # 设置管理
│   ├── database.py                        # 异步 SQLAlchemy 引擎
│   ├── dependencies.py                    # FastAPI 依赖
│   ├── logging_config.py                  # 日志配置
│   ├── middleware/
│   │   └── error_handler.py              # 全局错误处理
│   ├── models/
│   │   ├── db.py                          # 5 个 ORM 模型
│   │   └── schemas.py                     # Pydantic 模式
│   ├── routers/
│   │   ├── devices.py                     # 设备连接/断开（SSE）
│   │   ├── audio.py                       # 音频采集（SSE, 4Hz）
│   │   ├── ai.py                          # AI 处理（SSE）
│   │   └── report.py                      # 报告 + 会话 + 清除
│   ├── services/
│   │   ├── device_simulator.py            # 硬件模拟单例
│   │   ├── audio_simulator.py             # 音频采集模拟
│   │   ├── ai_service.py                  # AI 服务（旧版）
│   │   ├── audio_service.py               # 音频服务（旧版）
│   │   ├── device_service.py              # 设备服务（旧版）
│   │   └── report_service.py              # 报告服务（旧版）
│   └── scripts/
│       └── init_db.py                     # 数据库初始化
├── frontend/
│   ├── index.html                         # HTML 入口
│   ├── package.json                       # Node 依赖
│   ├── vite.config.ts                     # Vite + 代理配置
│   ├── tailwind.config.js                 # Tailwind 配置
│   └── src/
│       ├── main.tsx                       # React 入口
│       ├── App.tsx                        # 根组件（5 个标签）
│       ├── api/
│       │   └── index.ts                   # API 客户端 + SSE 辅助
│       ├── components/
│       │   ├── DisconnectModal.tsx        # 意外断连弹窗
│       │   ├── EarbudsHero.tsx            # SVG 耳机插图
│       │   ├── PhoneFrame.tsx             # 手机框架容器
│       │   └── TabBar.tsx                 # 底部标签导航
│       ├── context/
│       │   └── AppContext.tsx             # 全局状态 + 断连检测
│       └── pages/
│           ├── PageDevice.tsx             # 设备连接与管理
│           ├── PageListen.tsx             # 录音（含权限对话框）
│           ├── PageResults.tsx            # 会话历史 + 导出
│           ├── PageReport.tsx             # 性能报告（含图表）
│           └── PageSettings.tsx           # 设置与隐私控制
└── data/
    └── earbuds.db                         # SQLite 数据库（自动创建）
```
