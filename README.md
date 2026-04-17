# 华夏科技树

## 1. 项目概述

### 1.1 项目目标

华夏科技树（Huaxia Tech Tree）是一个交互式数据可视化项目，旨在展示中国从新石器时代到宋代（约公元前7000年至公元1232年）的重大技术发明与文明发展历程。该项目通过有向无环图（DAG）的形式，呈现约144项中国古代技术创新之间的技术传承与依赖关系，并提供BFS（广度优先搜索）和DFS（深度优先搜索）算法的可视化演示。

### 1.2 核心功能

1. **知识图谱可视化**：使用纯SVG渲染中国科技发展的DAG图
2. **算法可视化**：实时展示BFS/DFS遍历过程，包括队列/栈的状态变化
3. **邻接表视图**：以哈希表形式展示图的邻接关系
4. **节点详情面板**：展示每项发明的历史背景、发明者、历史意义
5. **时代分区**：按先秦以前、春秋汉代、两汉时期、隋唐时期、宋朝以降划分时间线

### 1.3 使用场景

- 教育领域：用于数据结构与算法教学（约144项中国古代发明作为案例）
- 历史科普：展示中国古代科技成就
- 技术演示：图论算法的交互式可视化

---

## 2. 项目整体架构

### 2.1 架构类型：前后端分离 + 客户端-服务器模式

该项目采用典型的**前后端分离架构**：
- **前端**：React 19 单页应用，负责UI渲染和用户交互
- **后端**：Express 5 REST API服务器，负责数据提供和算法计算
- **通信**：HTTP JSON API

### 2.2 模块职责划分

| 模块 | 技术栈 | 职责 |
|------|--------|------|
| 前端UI层 | React 19 | 图谱渲染、用户交互、状态管理 |
| API服务层 | Fetch API | 前后端通信封装 |
| 后端数据层 | Express 5 + JSON | 数据存储、图算法实现 |
| 数据文件 | JSON | 节点、类别信息 |

### 2.3 模块之间关系

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend (Port 3000)             │
├─────────────────────────────────────────────────────────────┤
│  App.js (入口) → HuaxiaTechTree.jsx (主组件)               │
│    ├── hooks/ (状态管理)                                    │
│    │     ├── useGraphData (数据获取)                        │
│    │     ├── usePanZoom (缩放平移)                          │
│    │     ├── useTraversal (遍历状态)                        │
│    │     └── useAutoPlay (自动播放)                         │
│    ├── components/ (UI组件)                                 │
│    └── services/api.js (API调用)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTP JSON API
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Express Server (Port 5000)             │
├─────────────────────────────────────────────────────────────┤
│  index.js                                                   │
│    ├── 数据加载 (nodes.json)                                │
│    ├── 邻接表构建 (ADJ/RADJ/NMAP)                           │
│    ├── 动态坐标计算 (POS)                                   │
│    └── 算法实现 (BFS/DFS)                                  │
└─────────────────────────────────────────────────────────────┘
```




---

## 3. 数据流与执行流程

### 3.1 应用启动流程

```
1. 用户运行: npm run dev
   ↓
2. 启动:
   ├── npm start (React → localhost:3000)
   └── node server/index.js (Express → localhost:5000)
   ↓
3. 浏览器访问 localhost:3000
   ↓
4. HuaxiaTechTree.jsx mount → useGraphData hook → fetchAllData()
   ↓
5. Promise.all 并行请求 4 个API:
   ├── /api/nodes
   ├── /api/categories
   ├── /api/positions
   └── /api/adjacency
   ↓
6. 数据加载完成，渲染SVG图谱
```

### 3.2 BFS/DFS执行流程

```
1. 用户选择模式 (BFS/DFS)
2. 用户点击图中的起始节点
3. onNode(id) 被调用
4. runBFS(id) 或 runDFS(id) 发送POST请求
5. 后端执行算法，返回 steps 数组
6. 前端设置 steps，si=0
7. 用户点击播放或手动步进
8. setInterval 每900ms自动推进步骤
9. nState() 和 eState() 计算节点/边样式
10. SVG 重绘，显示当前状态
```

### 3.3 关键数据流

```
后端数据 (JSON)
    ↓
Express 加载 (require)
    ↓
邻接表构建 (ADJ, RADJ, NMAP)
    ↓
REST API 响应
    ↓
前端 fetchAllData()
    ↓
状态存储 (useState)
    ↓
SVG 渲染 / 邻接表渲染
    ↓
用户交互 → API调用 → 状态更新 → 重渲染
```

---

## 4. 启动流程

### 4.1 环境要求

- Node.js >= 14
- npm >= 6
- 浏览器（Chrome/Firefox/Edge）

### 4.2 安装步骤

```bash
# 1. 克隆项目
cd huaxia-tech-tree

# 2. 安装前端依赖
npm install

# 3. 安装后端依赖
cd server
npm install
cd ..

# 或使用快捷命令
npm run install:all
```

### 4.3 运行项目

```bash
# 开发模式（同时启动前后端）
# huaxia-tech-tree/
npm run dev

# 或分别启动
# 终端1：启动后端
npm run server

# 终端2：启动前端
npm start
```

### 4.4 访问应用

- 前端：http://localhost:3000
- 后端API：http://localhost:5000


### 4.5 关键文件索引

| 功能 | 文件路径 |
|------|----------|
| 主组件 | src/HuaxiaTechTree.jsx |
| 入口文件 | src/App.js |
| API封装 | src/services/api.js |
| 数据获取hook | src/hooks/useGraphData.js |
| 后端服务器 | server/index.js |
| 节点数据 | server/data/nodes.json |
| 类别定义 | server/data/categories.json |

---
