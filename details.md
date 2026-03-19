# 华夏科技树

## 1. 项目概述

### 1.1 项目目标

华夏科技树（Huaxia Tech Tree）是一个交互式数据可视化项目，旨在展示中国从新石器时代到宋代（约公元前7000年至公元1232年）的重大技术发明与文明发展历程。该项目通过有向无环图（DAG）的形式，呈现20项中国古代发明之间的技术传承与依赖关系，并提供BFS（广度优先搜索）和DFS（深度优先搜索）算法的可视化演示。

### 1.2 核心功能

1. **知识图谱可视化**：使用纯SVG渲染中国科技发展的DAG图
2. **算法可视化**：实时展示BFS/DFS遍历过程，包括队列/栈的状态变化
3. **邻接表视图**：以哈希表形式展示图的邻接关系
4. **节点详情面板**：展示每项发明的历史背景、发明者、历史意义
5. **时代分区**：按先秦以前、春秋汉代、两汉时期、隋唐时期、宋朝以降划分时间线

### 1.3 使用场景

- 教育领域：用于数据结构与算法教学（中国20项发明作为案例）
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
| 数据文件 | JSON | 节点、边、类别、位置信息 |

### 2.3 模块之间关系

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend (Port 3000)             │
├─────────────────────────────────────────────────────────────┤
│  App.js (主组件)                                           │
│    ├── 状态管理 (useState)                                  │
│    ├── SVG图渲染                                            │
│    ├── 用户交互处理                                         │
│    └── API调用 (services/api.js)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTP JSON API
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Express Server (Port 5000)             │
├─────────────────────────────────────────────────────────────┤
│  index.js                                                   │
│    ├── 数据加载 (./data/*.json)                             │
│    ├── 邻接表构建                                           │
│    └── 算法实现 (BFS/DFS)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构解析

### 3.1 项目根目录

```
huaxia-tech-tree/
├── package.json              # 主项目配置（React）
├── package-lock.json         # 依赖锁定
├── README.md                 # 项目说明
├── CLAUDE.md                 # Claude Code指南
├── ADD_NODE_GUIDE.md         # 添加节点指南
```

### 3.2 前端源码目录 (src/)

| 文件 | 行数 | 作用 |
|------|------|------|
| **index.js** | ~18 | React应用入口，render到DOM |
| **App.js** | ~480 | 核心组件，包含所有UI逻辑、SVG渲染、状态管理 |
| **App.css** | - | 样式文件（基本未使用，内联样式为主） |
| **App.test.js** | - | 测试文件 |
| **index.css** | - | 全局样式 |
| **reportWebVitals.js** | - | 性能监控 |
| **setupTests.js** | - | 测试配置 |
| **logo.svg** | - | Logo图标 |
| **services/api.js** | ~58 | API调用封装层 |

### 3.3 后端目录 (server/)

| 文件/目录 | 作用 |
|----------|------|
| **package.json** | 服务器依赖配置 |
| **index.js** | Express服务器入口，包含所有API和算法实现 |
| **data/** | JSON数据文件目录 |
| **routes/** | 路由目录（空，计划用于路由分离） |

### 3.4 数据文件目录 (server/data/)

| 文件 | 内容 |
|------|------|
| **nodes.json** | 20个技术节点，包含id、name、era、year、layer、cat、inv、desc、sig |
| **edges.json** | 19条有向边，from→to格式 |
| **categories.json** | 11个类别定义（craft、textile、metallurgy等） |
| **positions.json** | 每个节点在SVG中的(x, y)坐标 |

---

## 4. 核心模块详解

### 4.1 前端主组件 (App.js)

#### 4.1.1 作用

App.js是整个应用的核心组件，负责：
- 状态管理（选中节点、模式、步骤、视图）
- SVG图谱渲染
- 用户交互处理
- 算法可视化播放控制

#### 4.1.2 状态变量

```javascript
// 核心状态
const [sel, setSel] = useState(null)        // 当前选中节点
const [mode, setMode] = useState("explore") // 模式：explore/bfs/dfs
const [steps, setSteps] = useState([])       // 算法步骤数组
const [si, setSi] = useState(0)              // 当前步骤索引
const [playing, setPlaying] = useState(false) // 自动播放状态
const [tab, setTab] = useState("graph")       // 视图：graph/adjlist
const [loading, setLoading] = useState(true)  // 加载状态
const [error, setError] = useState(null)      // 错误状态

// 数据状态
const [NODES, setNODES] = useState([])       // 节点数据
const [EDGES, setEDGES] = useState([])       // 边数据
const [POS, setPOS] = useState({})           // 位置坐标
const [CAT, setCAT] = useState({})           // 类别定义
const [ADJ, setADJ] = useState({})           // 邻接表
const [RADJ, setRADJ] = useState({})         // 逆邻接表
const [NMAP, setNMAP] = useState({})         // 节点映射
```

#### 4.1.3 节点状态函数 (nState)

```javascript
const nState = (id) => {
  if(!step) return "idle"
  if(step.cur===id)                           return "current"  // 当前访问
  if(step.visited.has(id))                    return "visited"  // 已访问
  if(mode==="bfs" && step.queue?.includes(id)) return "queued"   // BFS队列中
  if(mode==="dfs" && step.stack?.includes(id)) return "stacked" // DFS栈中
  return "idle"
}
```

#### 4.1.4 边状态函数 (eState)

```javascript
const eState = (f,t) => {
  if(!step) return "idle"
  if(step.cur===f && step.fresh?.includes(t)) return "active"   // 正在探索
  if(step.visited.has(f)&&step.visited.has(t)) return "done"    // 已完成
  return "idle"
}
```

#### 4.1.5 关键函数说明

| 函数名 | 作用 | 输入 | 输出 |
|--------|------|------|------|
| onNode | 节点点击处理 | node.id | 设置选中节点，触发BFS/DFS |
| edgePath | 生成贝塞尔曲线路径 | from, to | SVG path字符串 |
| Btn | 按钮组件 | active, col, onClick | JSX按钮 |
| Sec | 侧边栏区块组件 | title, children | JSX区块 |
| Mono | 等宽字体组件 | children | JSX div |

### 4.2 API服务层 (services/api.js)

#### 4.2.1 作用

封装所有对后端的HTTP请求，提供清晰的接口给App.js使用。

#### 4.2.2 函数列表

```javascript
// 数据获取
fetchNodes()        // GET /api/nodes
fetchEdges()        // GET /api/edges
fetchCategories()  // GET /api/categories
fetchPositions()    // GET /api/positions
fetchAdjacency()    // GET /api/adjacency

// 算法执行
runBFS(start)       // POST /api/algorithms/bfs
runDFS(start)       // POST /api/algorithms/dfs

// 聚合操作
fetchAllData()      // Promise.all 并行获取所有数据
```

#### 4.2.3 API_BASE配置

```javascript
const API_BASE = 'http://localhost:5000/api';
```

### 4.3 后端服务器 (server/index.js)

#### 4.3.1 作用

Express服务器，负责：
- 加载和提供JSON数据
- 构建图的邻接表结构
- 实现BFS/DFS算法并返回步骤

#### 4.3.2 API端点

| 端点 | 方法 | 功能 |
|------|------|------|
| /api/nodes | GET | 返回所有节点 |
| /api/edges | GET | 返回所有边 |
| /api/categories | GET | 返回类别定义 |
| /api/positions | GET | 返回位置坐标 |
| /api/adjacency | GET | 返回邻接表、逆邻接表、节点映射 |
| /api/algorithms/bfs | POST | 执行BFS，返回步骤数组 |
| /api/algorithms/dfs | POST | 执行DFS，返回步骤数组 |

#### 4.3.3 邻接表构建逻辑

```javascript
// 构建邻接表
const ADJ = Object.fromEntries(nodesData.map(n => [n.id, []]));
const RADJ_temp = Object.fromEntries(nodesData.map(n => [n.id, []]));

edgesData.forEach(e => {
  if (ADJ[e.from]) {
    ADJ[e.from].push(e.to);    // 正向邻接
  }
  if (RADJ_temp[e.to]) {
    RADJ_temp[e.to].push(e.from); // 逆向邻接
  }
});
```

#### 4.3.4 BFS算法实现

```javascript
app.post('/api/algorithms/bfs', (req, res) => {
  const { start } = req.body;
  const steps = [];
  const vis = new Set([start]);
  const q = [start];

  while (q.length) {
    const cur = q.shift();
    const snap = new Set(vis);
    const fresh = (ADJ[cur] || []).filter(n => !vis.has(n));
    fresh.forEach(n => {
      vis.add(n);
      q.push(n);
    });
    steps.push({ cur, queue: [...q], visited: snap, fresh, ds: 'queue' });
  }
  res.json({ steps });
});
```

**BFS算法分析**：
- 时间复杂度：O(V + E)
- 使用队列（FIFO）实现
- 每步返回：当前节点、队列快照、已访问集合、新发现节点

#### 4.3.5 DFS算法实现

```javascript
app.post('/api/algorithms/dfs', (req, res) => {
  const { start } = req.body;
  const steps = [];
  const vis = new Set();
  const stk = [start];

  while (stk.length) {
    const cur = stk.pop();
    if (vis.has(cur)) continue;  // 跳过已访问
    vis.add(cur);
    const snap = new Set(vis);
    const fresh = [...(ADJ[cur] || [])].reverse().filter(n => !vis.has(n));
    fresh.forEach(n => stk.push(n));
    steps.push({ cur, stack: [...stk], visited: snap, fresh, ds: 'stack' });
  }
  res.json({ steps });
});
```

**DFS算法分析**：
- 时间复杂度：O(V + E)
- 使用栈（LIFO）实现
- 关键优化：`if (vis.has(cur)) continue` 在入栈时去重，而非出栈时
- 逆序入栈 neighbors 保持稳定遍历顺序

---

## 5. 数据流与执行流程

### 5.1 应用启动流程

```
1. 用户运行: npm run dev
   ↓
2. concurrently 启动:
   ├── npm start (React → localhost:3000)
   └── node server/index.js (Express → localhost:5000)
   ↓
3. 浏览器访问 localhost:3000
   ↓
4. App.js mount → useEffect → fetchAllData()
   ↓
5. Promise.all 并行请求 5 个API:
   ├── /api/nodes
   ├── /api/edges
   ├── /api/categories
   ├── /api/positions
   └── /api/adjacency
   ↓
6. 数据加载完成，渲染SVG图谱
```

### 5.2 BFS/DFS执行流程

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

### 5.3 关键数据流

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

## 6. 关键技术与设计思想

### 6.1 图数据结构的隐含设计

**邻接表表示**：
- 使用HashMap<String, Array<String>>存储图
- O(V+E) 空间复杂度，适合稀疏图
- 相比邻接矩阵，节省内存

**DAG特性**：
- 数据结构允许有向边，无环
- 拓扑顺序隐含在边的定义中（从早期技术指向晚期技术）

### 6.2 可视化设计模式

**状态驱动渲染**：
- 单一状态源（steps数组）
- 派生状态函数（nState, eState）计算样式
- 这种模式类似Redux的selector概念

**双视图切换**：
- graph视图：SVG图形化
- adjlist视图：文本哈希表形式
- 同一数据源的两种表示

### 6.3 组件设计模式

**函数式组件 + Hooks**：
- 使用useState管理本地状态
- useEffect处理副作用（数据获取、定时器）
- useCallback缓存事件处理函数

**内联样式**：
- 全部使用内联style而非CSS类
- 优点：无样式隔离问题，动态样式容易
- 缺点：可维护性差，样式难以复用

### 6.4 算法可视化模式

**步骤快照**：
- 算法不一次性返回结果
- 每一步返回一个快照（cur, queue/stack, visited, fresh）
- 前端可以逐帧展示

**时间控制**：
- setInterval 900ms固定间隔
- 暂停/播放/步进控制

---

## 7. 问题与改进建议

### 7.1 架构问题

#### 问题1：数据存储位置不一致

**现象**：数据文件位于 `server/data/` 目录，但CLAUDE.md描述说在 `src/data/`

**影响**：文档与实际不符，可能导致维护困惑

**建议**：统一数据目录，清理文档

#### 问题2：server/routes/ 目录空置

**现象**：存在 `server/routes/` 空目录

**影响**：目录结构不完整，预留给路由分离但未实现

**建议**：删除空目录，或实现路由分离

### 7.2 可维护性问题

#### 问题3：App.js 体积过大

**现象**：单一文件约480行，包含所有UI逻辑

**影响**：
- 难以阅读和维护
- 违反单一职责原则
- 内联样式占大量篇幅

**建议**：
```javascript
// 拆分建议
src/
├── components/
│   ├── GraphView.jsx      // SVG渲染
│   ├── AdjListView.jsx    // 邻接表渲染
│   ├── Sidebar.jsx        // 侧边栏
│   ├── DetailPanel.jsx    // 详情面板
│   ├── ControlPanel.jsx   // 播放控制
│   └── Header.jsx         // 顶部导航
├── hooks/
│   ├── useGraphData.js    // 数据获取
│   ├── useAlgorithm.js    // 算法执行
│   └── useTimer.js        // 定时器逻辑
└── styles/
    └── theme.js           // 样式常量
```

#### 问题4：内联样式过度使用

**现象**：App.js几乎全部使用内联style对象

**影响**：
- 无法使用CSS伪类
- 样式无法缓存
- JS和CSS耦合

**建议**：使用CSS Modules或styled-components

#### 问题5：magic numbers 和字符串硬编码

**现象**：
```javascript
const R = 28;  // 节点半径
viewBox="0 0 920 580"  // SVG视口
setInterval(..., 900)  // 定时器间隔
```

**影响**：可读性差，修改需搜索全部代码

**建议**：提取为常量文件
```javascript
// src/constants.js
export const NODE_RADIUS = 28;
export const SVG_WIDTH = 920;
export const SVG_HEIGHT = 580;
export const ANIMATION_INTERVAL = 900;
```

### 7.3 性能问题

#### 问题6：API请求未做缓存

**现象**：每次页面刷新都重新请求所有数据

**影响**：重复请求浪费带宽

**建议**：
- 使用React Query或SWR做请求缓存
- 或实现简单的内存缓存

#### 问题7：SVG渲染未使用虚拟化

**现象**：20个节点+19条边全部实时渲染

**影响**：节点数增加时性能下降

**建议**：
- 节点数超过100考虑使用虚拟化
- 当前规模无需优化

### 7.4 可扩展性问题

#### 问题8：API_BASE 硬编码

**现象**：
```javascript
const API_BASE = 'http://localhost:5000/api';
```

**影响**：不同环境（开发/生产）需要不同配置

**建议**：
```javascript
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';
```

#### 问题9：添加节点需要修改多处

**现象**：nodes.json、edges.json、positions.json需要同时手动更新

**影响**：容易出错，不够直观

**建议**：实现配置验证脚本，或使用单一数据源

#### 问题10：算法端点未做参数验证

**现象**：BFS/DFS端点仅检查节点是否存在

**影响**：
- 无效输入可能返回错误结果
- 缺少输入字段会崩溃

**建议**：
```javascript
app.post('/api/algorithms/bfs', (req, res) => {
  const { start } = req.body;
  if (!start) {
    return res.status(400).json({ error: 'Missing start parameter' });
  }
  if (!ADJ[start]) {
    return res.status(404).json({ error: 'Node not found' });
  }
  // ...
});
```

### 7.5 潜在Bug

#### 问题11：DFS算法中 fresh 的顺序

**代码**：
```javascript
const fresh = [...(ADJ[cur] || [])].reverse().filter(n => !vis.has(n));
fresh.forEach(n => stk.push(n));
```

**分析**：
- 先反转neighbors再入栈
- 这意味着遍历顺序与邻接表定义相反
- 可能导致非直觉的遍历路径

**建议**：确认是否有意为之，否则简化：
```javascript
const fresh = (ADJ[cur] || []).filter(n => !vis.has(n));
fresh.forEach(n => stk.push(n)); // 保持原顺序
```

#### 问题12：定时器内存泄漏风险

**代码**：
```javascript
useEffect(()=>{
  if(playing){
    timerRef.current=setInterval(...)
  } else clearInterval(timerRef.current)
  return ()=>clearInterval(timerRef.current)
},[playing,steps.length])
```

**分析**：代码本身正确，但依赖数组包含steps.length可能导致意外行为

**建议**：使用更稳定的依赖或useRef

### 7.6 命名规范问题

#### 问题13：变量命名不一致

| 位置 | 命名 | 说明 |
|------|------|------|
| 前端 | NODES, EDGES, POS, CAT | 大写常量风格 |
| 前端 | sel, mode, si, playing | 简写风格 |
| 后端 | ADJ, RADJ, NMAP | 全大写+驼峰混用 |
| API | adj, radj, nmap | 小写 |

**建议**：统一命名风格

### 7.7 AI生成代码常见问题

#### 问题14：重复逻辑 - Sec/Mono组件

**现象**：定义了两个简单的微组件，但几乎没复用

**建议**：直接内联或使用React.Fragment

#### 问题15：伪抽象 - fetchNodes/fetchEdges

**现象**：
```javascript
export async function fetchNodes() {
  const res = await fetch(`${API_BASE}/nodes`);
  return res.json();
}
```

**分析**：这层封装价值有限，只是添加了await

**建议**：直接使用fetch或使用axios等更高级的库

---

## 8. 快速上手指南

### 8.1 环境要求

- Node.js >= 14
- npm >= 6
- 浏览器（Chrome/Firefox/Edge）

### 8.2 安装步骤

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

### 8.3 运行项目

```bash
# 开发模式（同时启动前后端）
npm run dev

# 或分别启动
# 终端1：启动后端
npm run server

# 终端2：启动前端
npm start
```

### 8.4 访问应用

- 前端：http://localhost:3000
- 后端API：http://localhost:5000

### 8.5 最小运行路径

```
用户操作流程：
1. 访问 localhost:3000
2. 页面自动加载数据（fetchAllData）
3. 点击顶部按钮切换模式（探索/BFS/DFS）
4. 点击任意节点开始算法可视化
5. 使用播放控制按钮逐步查看
```

### 8.6 关键文件索引

| 功能 | 文件路径 |
|------|----------|
| 主组件 | src/App.js |
| API封装 | src/services/api.js |
| 后端服务器 | server/index.js |
| 节点数据 | server/data/nodes.json |
| 边数据 | server/data/edges.json |
| 位置数据 | server/data/positions.json |
| 类别定义 | server/data/categories.json |

---

## 附录：数据模型

### 节点结构 (nodes.json)

```json
{
  "id": "pottery",        // 唯一标识符
  "name": "陶器",          // 中文名
  "en": "Pottery",        // 英文名
  "era": "新石器",         // 时代
  "year": -7000,          // 年份（负数表示公元前）
  "layer": 0,             // 层级（用于布局）
  "cat": "craft",         // 类别ID
  "inv": "先民",          // 发明者
  "desc": "描述文字",      // 简介
  "sig": "历史意义"        // 意义
}
```

### 边结构 (edges.json)

```json
{
  "from": "pottery",      // 起始节点ID
  "to": "porcelain"      // 目标节点ID
}
```

### 步骤结构 (算法返回)

```javascript
{
  cur: "pottery",              // 当前访问节点
  queue: ["silk", "bronze"],   // BFS队列快照
  stack: ["silk", "bronze"],  // DFS栈快照
  visited: Set("pottery"),     // 已访问节点集合
  fresh: ["silk"],             // 新发现的节点
  ds: "queue" | "stack"        // 数据结构类型
}
```
