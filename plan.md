# 华夏科技树 - 项目分析报告与未来开发计划

> 生成日期：2026-03-26
> 分析级别：详细架构分析与功能规划

---

## 一、项目现状分析

### 1.1 技术栈概览

| 层级 | 技术选型 | 评价 |
|------|----------|------|
| 前端框架 | React 19 (Create React App) | 现代化选型，React 19 新特性未充分利用 |
| 状态管理 | 本地 useState + 自定义 Hooks | 轻量，但缺乏全局状态管理能力 |
| 图渲染 | 纯 SVG（无外部图库） | 定制性强，但实现复杂 |
| 后端框架 | Express 5 | 轻量 REST API |
| 数据存储 | JSON 文件 | 适合小规模数据，缺少版本控制 |
| 样式方案 | CSS-in-JS（内联 style 对象） | 缺少样式复用和维护性 |
| 构建工具 | react-scripts 5 | 即将过时（CRA 已停止维护） |

### 1.2 前端架构详情

```
HuaxiaTechTree (根组件)
├── Header.jsx           # 导航栏 + 模式切换
├── Sidebar.jsx          # 分类筛选 + BFS/DFS 控制
├── GraphView.jsx        # SVG 主图谱渲染（核心）
│   ├── 时间轴渲染（独立 pan/zoom）
│   ├── 节点渲染（圆形 + 文字）
│   └── 边渲染（贝塞尔曲线）
├── AdjListView.jsx      # 邻接表视图
├── DetailPanel.jsx      # 右侧详情面板
└── BottomBar.jsx        # 底部状态栏
```

**关键 Hooks：**
- `useGraphData`：数据获取与状态管理
- `usePanZoom`：画布平移/缩放（含边界限制）
- `useTraversal`：节点选择、模式切换、算法步骤
- `useAutoPlay`：自动播放定时器

### 1.3 后端架构详情

```
server/
├── index.js              # Express 主入口（185 行）
│   ├── /api/nodes        # 获取所有节点
│   ├── /api/categories   # 获取分类定义
│   ├── /api/positions    # 计算节点位置（服务端计算）
│   ├── /api/timeline-config
│   ├── /api/adjacency    # 邻接表
│   ├── /api/algorithms/bfs  # BFS 算法
│   └── /api/algorithms/dfs  # DFS 算法
└── data/
    ├── nodes.json        # 100+ 节点数据
    ├── categories.json   # 12 个分类
    └── timelineConfig.json # 22 个时代配置
```

### 1.4 数据结构

**节点数据（nodes.json）：**
```json
{
  "id": "pottery",
  "name": "陶器",
  "en": "Pottery",
  "era": "新石器",
  "year": -7000,
  "cat": "craft",
  "inv": "先民",
  "desc": "中国陶器制作...",
  "sig": "工艺文明之源...",
  "outEdges": ["porcelain", "earthenware", "lacquerware"]
}
```

**分类数据（12 类）：** craft, metallurgy, culture, science, medicine, engineering, military, navigation, textile, trade, agriculture, math

---

## 二、优点与不足

### 2.1 优点

| 维度 | 优点描述 |
|------|----------|
| **架构清晰** | 组件职责分明，Hooks 封装合理，代码可读性强 |
| **前后端分离** | REST API 设计规范，前后端独立可扩展 |
| **图算法可视化** | BFS/DFS 步骤动画清晰，有教学价值 |
| **时间线设计** | 带 scale 的时间轴，尊重历史时代长度差异 |
| **位置计算算法** | Lane 分配 + 碰撞检测，布局合理 |
| **无外部依赖** | 纯 SVG 实现，控制力强 |
| **响应式平移缩放** | 以锚点为中心的缩放，交互自然 |

### 2.2 不足与问题

| 类别 | 问题 | 严重程度 |
|------|------|----------|
| **UI/UX** | 界面呈现数据结构展示风格，缺乏教育网站的美感 | 高 |
| **UI/UX** | 节点选择时无聚焦效果，无法快速识别关联关系 | 高 |
| **UI/UX** | 缺少新用户引导（Onboarding） | 高 |
| **UI/UX** | 无搜索功能，无法快速定位节点 | 中 |
| **UI/UX** | 动画效果单一，只有 fadeIn 和节点脉冲 | 中 |
| **UI/UX** | 移动端/响应式布局未适配 | 中 |
| **技术** | CSS-in-JS 内联样式，维护性差 | 中 |
| **技术** | 无状态管理库（如 Redux），状态逻辑分散 | 中 |
| **技术** | CRA 已停止维护，构建工具需迁移 | 低 |
| **技术** | 缺少单元测试 | 低 |
| **数据** | 节点数量有限（100+），覆盖不全面 | 高 |
| **数据** | 数据来源不明确，学术严谨性存疑 | 高 |
| **数据** | JSON 文件无版本控制，无数据校验 | 中 |
| **性能** | SVG 节点/边数量多时可能卡顿 | 中 |

---

## 三、未来需求技术方案

### 3.1 功能一：节点聚焦效果（不相关节点半透明）

**需求描述：** 选中节点时，使其处于同一树/路径上的节点高亮，其他节点半透明。

**技术方案：**

```
前端实现（GraphView.jsx 修改）

1. 新增状态：
   - focusMode: boolean
   - relatedNodes: Set<string>  // 与选中节点同属一个连通分量/路径的节点

2. 计算关联节点（DFS/BFS 向上下游扩散）：
   - 输入：选中节点 ID
   - 向上遍历：RADJ（逆向邻接表）直到根节点
   - 向下遍历：ADJ（邻接表）直到叶子节点
   - 时间复杂度：O(V+E)

3. 渲染逻辑修改：
   - 边：相关边高亮，不相关边 opacity: 0.1
   - 节点：
     - 相关节点：正常显示
     - 不相关节点：opacity: 0.2, 缩小至 0.8 倍
   - 使用 CSS transition 实现平滑过渡

4. 新增聚焦模式切换按钮（Header 或 GraphView 角落）

实现示例：
   const getRelatedNodes = (nodeId) => {
     const related = new Set([nodeId]);
     const dfs = (id, adj) => {
       (adj[id] || []).forEach(next => {
         if (!related.has(next)) {
           related.add(next);
           dfs(next, adj);
         }
       });
     };
     dfs(nodeId, ADJ);  // 向下
     dfs(nodeId, RADJ); // 向上
     return related;
   };
```

**实现步骤：**
1. 在 `useTraversal` 或新建 `useFocusMode` Hook 中实现 `getRelatedNodes` 函数
2. 新增 `focusMode` 状态，切换按钮
3. 修改 GraphView 渲染逻辑，根据 `focusMode` 和 `relatedNodes` 调整 opacity/transform
4. 添加 CSS transition 动画（0.3s ~ 0.5s）

**可行性：** ✅ 高（纯前端改动，无后端依赖）

---

### 3.2 功能二：搜索功能

**需求描述：** 支持搜索节点名称，搜索结果点击后进入关系图模式。

**技术方案：**

```
前端实现（新增 SearchModal 组件）

1. 搜索触发：
   - Header 添加搜索图标按钮
   - 快捷键：Cmd/Ctrl + K 打开搜索
   - 点击搜索图标打开全屏/居中搜索模态框

2. 搜索模态框设计：
   - 输入框：居中，大字体，底部有分类筛选标签
   - 搜索结果：列表形式，显示节点名、分类、朝代、年份
   - 支持键盘上下导航和 Enter 选中
   - 搜索算法：模糊匹配（fuzzy search），推荐使用 Fuse.js

3. 选中后行为：
   - 关闭搜索模态框
   - 自动聚焦到该节点（执行 focusMode 高亮）
   - 自动滚动/平移到该节点位置（使用 usePanZoom 的 panTo 功能）
   - 右侧 DetailPanel 显示该节点详情

4. 依赖库：
   - Fuse.js（模糊搜索，轻量无依赖）

实现示例：
   const fuse = new Fuse(NODES, {
     keys: ['name', 'en', 'desc'],
     threshold: 0.3,
     includeScore: true
   });
   const results = fuse.search(query);
```

**后端扩展（如需）：**
- 若节点数据量增大（1000+），可考虑后端搜索 API
- 使用数据库全文索引（如 SQLite FTS5）

**实现步骤：**
1. 安装 Fuse.js：`npm install fuse.js`
2. 新建 `SearchModal.jsx` 组件
3. 在 `HuaxiaTechTree.jsx` 中集成搜索状态
4. 实现键盘快捷键监听
5. 实现选中后的节点聚焦和平移动画
6. 添加搜索框样式动画

**可行性：** ✅ 高（Fuse.js 成熟稳定）

---

### 3.3 功能三：按分类限制高度范围

**需求描述：** 不同分类的节点限制在不同的高度区间，避免混杂。

**技术方案：**

```
后端修改（server/index.js computePositions 函数）

1. 方案 A：固定高度区间（简单）
   - craft, textile, metallurgy → 上部（y: 90-200）
   - culture, science, math     → 中部（y: 200-350）
   - medicine, navigation      → 中下部（y: 350-450）
   - engineering, military     → 下部（y: 450-560）

2. 方案 B：动态分配（灵活，推荐）
   - 记录每个分类当前占用的最低 y 值
   - 放置节点时，优先尝试其分类的"偏好高度区间"
   - 若碰撞，扩展到相邻区间

3. 实现代码：
   const CATEGORY_LANES = {
     craft:      { minLane: 0, maxLane: 2 },
     textile:    { minLane: 0, maxLane: 2 },
     metallurgy: { minLane: 0, maxLane: 2 },
     culture:    { minLane: 2, maxLane: 4 },
     science:    { minLane: 2, maxLane: 4 },
     math:       { minLane: 2, maxLane: 4 },
     medicine:   { minLane: 4, maxLane: 5 },
     navigation: { minLane: 4, maxLane: 5 },
     engineering: { minLane: 5, maxLane: 7 },
     military:   { minLane: 5, maxLane: 7 },
     trade:      { minLane: 6, maxLane: 7 },
     agriculture:{ minLane: 0, maxLane: 1 },
   };

   // 修改 computePositions 中 lane 分配逻辑
   const catConfig = CATEGORY_LANES[n.cat] || { minLane: 0, maxLane: 10 };

   // 碰撞时优先在同一分类的 lane 范围内调整
```

4. 前端适配：
   - GraphView 中 y 坐标计算保持不变（已有 POS 数据）
   - 可选：添加分类区间可视化背景带

**实现步骤：**
1. 修改 `server/index.js` 中的 `computePositions` 函数
2. 定义 `CATEGORY_LANES` 配置
3. 重启后端服务，重新计算位置
4. 可选：前端添加分类区间背景渲染

**可行性：** ✅ 高（后端算法修改，无前端依赖）

---

### 3.4 功能四：UI 界面优化（教育科普风格）

**需求描述：** 使界面从"数据结构展示网站"转变为"精美科普教育网站"。

**详细方案见第五节 UI/UX 建议。**

**此处为实现重点,要求背景图可以随着拖动而发生改变(按时间顺序),比如古代时期的背景图就是古时代的壁画,现代的到火箭区间就是火箭等等,要有北京素材的多样性**

---

### 3.5 功能五：新手引导（Onboarding）

**需求描述：** 用户首次进入网站时，展示引导教程。

**技术方案：**

```
前端实现（新增 WelcomeGuide 组件 + 状态管理）

1. 引导流程设计（4 步）：
   Step 1: "欢迎来到华夏科技树" — 介绍整体功能
   Step 2: "点击节点，查看详情" — 演示节点点击
   Step 3: "探索科技传承关系" — 演示聚焦模式
   Step 4: "开始探索" — 关闭引导

2. 引导覆盖层实现：
   - 全屏半透明遮罩（rgba(0,0,0,0.6)）
   - 透明区域（hole）突出引导位置
   - 使用 SVG mask 或 CSS clip-path 实现

3. 引导状态管理：
   - localStorage 存储 hasSeenGuide 标志
   - 首次访问显示引导，非首次访问跳过

4. 引导组件结构：
   <WelcomeGuide>
     <Step step={1} target="#graph-area" />
     <Step step={2} target="#node-xxx" />
     <Step step={3} target="#focus-mode-btn" />
     <Step step={4} />
   </WelcomeGuide>

5. 动画效果：
   - 引导卡片 fadeIn + scale（从 0.95 到 1）
   - 指示箭头弹跳动画
   - 透明区域边缘发光效果

6. 跳过/关闭：
   - 右上角关闭按钮
   - 点击遮罩关闭
   - ESC 键关闭
```

**实现步骤：**
1. 新建 `WelcomeGuide.jsx` 组件
2. 使用 `useState` 管理引导步骤
3. 实现 SVG mask 遮罩效果
4. 添加动画 CSS
5. 集成到 `HuaxiaTechTree.jsx`
6. 添加 localStorage 判断逻辑

**可行性：** ✅ 高（纯前端组件）

---

### 3.6 功能六：其他建议功能

#### 6.1 节点详情页（Deep Link）
- 为每个节点生成独立 URL（如 `/node/pottery`）
- 支持分享节点链接
- 使用 React Router（需引入）

#### 6.2 时间线「回到过去」模式
- 滑块控制"当前年份"
- 只显示该年份之前的发明
- 模拟历史探索体验

#### 6.3 节点收藏/笔记
- localStorage 存储用户收藏的节点
- 可添加个人笔记
- 侧边栏展示收藏列表

#### 6.4 导出功能
- 导出当前视图为 PNG/SVG
- 导出选中路径为 PDF
- 使用 html2canvas + jsPDF


---

## 四、数据策略建议

### 4.1 数据补充方案

| 阶段 | 策略 | 来源 | 工作量 |
|------|------|------|--------|
| 短期 | 人工整理现有数据，查漏补缺 | 维基百科、中国通史等 | 中 |
| 中期 | 志愿者/社区贡献（协作编辑） | GitHub PR 流程 | 高 |
| 长期 | 学术合作引入权威资料 | 高校历史/科技史研究 | 高 |

### 4.2 数据爬取方案

**推荐爬取来源：**
1. **维基百科中文**：`https://zh.wikipedia.org/wiki/中国科技史`
2. **中国知网**：论文数据（需 API 权限）
3. **中国国家图书馆**：书目数据
4. **地方志**：特定朝代/地区技术

**爬取技术栈：**
- Python（requests + BeautifulSoup）
-Scrapy（大规模爬取）
- 必应学术 API（学术数据）

**注意事项：**
- 尊重版权，注明来源
- 数据需人工审核，不可直接用于生产
- 避免高频请求，遵守 robots.txt

### 4.3 数据格式扩展

```json
{
  "id": "pottery",
  "name": "陶器",
  "en": "Pottery",
  "era": "新石器",
  "year": -7000,
  "cat": "craft",
  "inv": "先民",
  "desc": "中国陶器制作...",
  "sig": "工艺文明之源...",
  "outEdges": ["porcelain", "earthenware", "lacquerware"],
  "sources": [
    { "title": "中国陶瓷史", "author": "xxx", "year": 1998, "url": "..." }
  ],
  "tags": ["饮食", "日常", "新石器"],
  "confidence": 0.9,
  "lastUpdated": "2026-03-26"
}
```

**新增字段说明：**
- `sources`：数据来源引用（提高可信度）
- `tags`：自由标签（方便搜索和筛选）
- `confidence`：数据可信度（0-1）
- `lastUpdated`：最后更新时间

### 4.4 数据存储结构建议

```
data/
├── nodes/
│   ├── _meta.json          # 数据版本、元信息
│   ├── ancient.json        # 新石器~商周
│   ├── han.json            # 秦汉
│   ├── tang.json           # 隋唐
│   ├── song.json           # 宋元
│   └── ming.json           # 明朝~
├── categories.json
├── timelineConfig.json
└── mappings/
    └── era-category.json   # 时代-分类映射配置
```

**优势：**
- 分文件存储，便于多人协作
- 避免单文件冲突
- 可按时代独立更新

### 4.5 数据维护建议

1. **版本控制**：JSON 文件纳入 Git 版本控制
2. **CI 验证**：提交时自动运行数据校验脚本
   - 检测循环引用
   - 检测孤立节点
   - 检测必填字段缺失
3. **CHANGELOG**：记录每次数据更新的内容

---

## 五、UI/UX 详细建议

### 5.1 整体视觉风格

**目标风格：** 古今交融 — 历史厚重感 + 现代简洁感

| 元素 | 当前 | 建议 | 参考 |
|------|------|------|------|
| 背景 | 米色纯色 #f5f0e8 | 宣纸/绢本质感 + 淡墨纹理 | 中国美术学院网站 |
| 主色调 | 金色 #c8a045 | 更沉稳的赭石/檀色，如 #8b6914 → #6b4423 | 故宫博物院色系 |
| 强调色 | 红色（当前节点） | 朱砂红 #c74b4b | 中国传统色 |
| 文字 | 深棕 #2c2416 | 墨黑 #1a1a1a，更清晰 | — |
| 空白 | 紧凑 | 增加留白，呼吸感 | Apple 中国 |

**CSS 变量定义：**
```css
:root {
  --color-bg: #f7f3ed;
  --color-bg-paper: #faf8f4;
  --color-primary: #8b5a2b;      /* 檀色 */
  --color-accent: #c74b4b;       /* 朱砂 */
  --color-gold: #c8a045;         /* 金色 */
  --color-text: #1a1a1a;
  --color-text-muted: #6b5d4d;
  --color-border: rgba(139,90,43,.15);
  --shadow-card: 0 4px 20px rgba(0,0,0,.06);
  --shadow-elevated: 0 8px 32px rgba(0,0,0,.1);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --font-title: 'ZCOOL XiaoWei', serif;
  --font-body: 'Noto Serif SC', serif;
  --font-ui: 'Noto Sans SC', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 5.2 动画规范

| 动画类型 | 当前 | 建议 | 时长 |
|----------|------|------|------|
| 节点脉冲 | SVG animate 脉冲 | 保持，可优化为 CSS animation | 0.9s |
| 节点 hover | 无 | scale(1.08) + 阴影增强 | 0.2s |
| 节点选中 | 直接切换 | scale(1.15) + 弹跳效果 | 0.3s cubic-bezier |
| 边高亮 | CSS transition | 流光效果（沿路径的动画） | 0.4s |
| 面板展开 | fadeIn | slideIn + fadeIn | 0.35s |
| 引导卡片 | 无 | scale(0.95→1) + fadeIn | 0.4s |
| 页面加载 | 简单 loading | 墨水扩散效果 | — |

**CSS 动画示例：**
```css
@keyframes nodePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(199, 75, 75, 0.15); }
  50% { box-shadow: 0 0 0 12px rgba(199, 75, 75, 0); }
}

@keyframes flowEdge {
  from { stroke-dashoffset: 20; }
  to { stroke-dashoffset: 0; }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes inkSpread {
  0% { transform: scale(0); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}
```

### 5.3 布局优化

**当前布局：**
```
┌─────────────────────────────────────────────────────┐
│  Header (固定高度 48px)                               │
├──────────┬───────────────────────────────┬────────────┤
│ Sidebar  │                               │ Detail     │
│ 172px    │      GraphView (flex: 1)       │ Panel      │
│          │                               │ 228px      │
│          │                               │            │
├──────────┴───────────────────────────────┴────────────┤
│  BottomBar (BFS/DFS 时显示)                            │
└─────────────────────────────────────────────────────┘
```

**建议布局改进：**

1. **Header 增强**
   - 左侧：Logo + 项目名称（可添加古代纹样装饰）
   - 中间：模式切换按钮（BFS/DFS/探索）改为更优雅的 segmented control
   - 右侧：搜索按钮 + 设置按钮 + 语言切换

2. **Sidebar 精简**
   - 分类筛选改为可折叠面板
   - 添加"朝代筛选"多选
   - 底部署名/关于链接

3. **主画布增强**
   - 网格背景可添加淡墨山水纹理
   - 节点悬停时显示简要 tooltip
   - 时间轴与画布同步滚动

4. **DetailPanel 优化**
   - 改为可拖拽调整宽度
   - 添加"相关故事" tab（如有）
   - 添加"相关图片"区域（预留）

5. **响应式断点**
   - Desktop: > 1200px（三栏）
   - Tablet: 768-1200px（两栏，Detail Panel 折叠）
   - Mobile: < 768px（单栏，底部抽屉）

### 5.4 交互细节

| 交互 | 当前行为 | 建议改进 |
|------|----------|----------|
| 节点悬停 | 无 | 显示 tooltip（名称 + 年份 + 分类）|
| 节点点击 | 直接选中 | 添加涟漪效果 + 轻微缩放 |
| 边悬停 | 无 | 高亮该路径，淡化其他 |
| 双击节点 | 无 | 进入该节点的聚焦模式 |
| 拖拽空白 | 平移画布 | 保持，添加轻微惯性 |
| 滚轮缩放 | 以鼠标为中心 | 保持 |
| 长按节点 | 无 | 显示快捷菜单（收藏/分享/查看路径）|

**Tooltip 设计：**
```jsx
<div className="node-tooltip">
  <div className="tooltip-name">{node.name}</div>
  <div className="tooltip-year">{formatYear(node.year)}</div>
  <div className="tooltip-cat">{CAT[node.cat].label}</div>
</div>
```

### 5.5 字体使用建议

| 用途 | 当前字体 | 建议 |
|------|----------|------|
| 标题/Logo | ZCOOL XiaoWei | 保持，可考虑增加楷书/隶书变体 |
| 正文 | Noto Serif SC | 保持 |
| UI 标签 | Noto Sans SC | 保持 |
| 年份/代码 | JetBrains Mono | 保持 |
| 节点名（SVG）| Noto Serif SC | 可考虑方正古隶简体（商业授权） |

### 5.6 图标风格建议

- 使用线性图标（stroke-based），而非填充图标
- 线条粗细：1.5px - 2px
- 图标风格参考：Feather Icons / Lucide
- 重要操作图标可使用中国传统纹样简化版（如回纹、云纹边框）

### 5.7 加载状态设计

**当前：** 简单 LoadingScreen

**建议：**
1. **初始加载**：水墨扩散动画（中心墨点逐渐扩散消失）
2. **数据加载中**：顶部进度条（朱砂色）
3. **算法执行中**：节点依次点亮的动画（如星空点亮）
4. **错误状态**：优雅的"墨迹"错误提示 + 重试按钮

---

## 六、未来开发计划总表

### 阶段一：体验优化（1-2 周）

**目标：** 快速提升视觉和交互体验

| 任务 | 负责 | 依赖 | 产出 |
|------|------|------|------|
| 1.1 设计系统建立（CSS 变量） | 前端 | 无 | css-variables.css |
| 1.2 全局字体、颜色、阴影统一 | 前端 | 1.1 | 更新后的组件 |
| 1.3 节点 hover/选中动画 | 前端 | 1.1 | GraphView 更新 |
| 1.4 边流光动画 | 前端 | 无 | GraphView 更新 |
| 1.5 Tooltip 实现 | 前端 | 无 | NodeTooltip 组件 |
| 1.6 新手引导组件 | 前端 | 无 | WelcomeGuide 组件 |
| 1.7 加载状态优化 | 前端 | 无 | LoadingScreen 更新 |

### 阶段二：核心功能（2-4 周）

**目标：** 实现用户提出的核心需求

| 任务 | 负责 | 依赖 | 产出 |
|------|------|------|------|
| 2.1 搜索功能 | 前端 | 无 | SearchModal 组件 |
| 2.2 节点聚焦效果 | 前端 | 无 | useFocusMode hook |
| 2.3 分类高度分区 | 后端 | 无 | server/index.js 更新 |
| 2.4 Figma 设计稿（可选） | 设计 | 无 | .figma 文件 |

### 阶段三：数据建设（持续）

**目标：** 扩充数据量和可信度

| 任务 | 负责 | 依赖 | 产出 |
|------|------|------|------|
| 3.1 现有数据审查整理 | 数据 | 无 | 更新的 nodes.json |
| 3.2 新节点搜集 | 数据 | 无 | 新增节点数据 |
| 3.3 数据来源标注 | 数据 | 3.1 | sources 字段 |
| 3.4 数据校验 CI | DevOps | 无 | 校验脚本 |

### 阶段四：高级功能（4-8 周）

**目标：** 提升教育价值

| 任务 | 负责 | 依赖 | 产出 |
|------|------|------|------|
| 4.1 Deep Link | 前端 | React Router | 路由配置 |
| 4.4 时间线探索 | 前端 | 无 | TimelineSlider 组件 |

---

## 七、风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| UI 改版后用户不适应 | 低 | 中 | 保持核心交互一致，引导教程 |
| 搜索性能问题 | 中 | 中 | 限制结果数量，使用 Fuse.js |
| 数据扩充后位置计算冲突 | 低 | 高 | 测试验证，算法优化 |


---

## 八、技术债务清理建议

| 债务 | 清理方案 | 优先级 |
|------|----------|--------|
| CRA 迁移 | 迁移至 Vite | 中 |
| CSS-in-JS 整理 | 迁移至 CSS Modules 或 Tailwind | 高 |
| 状态管理增强 | 引入 Zustand 或继续用 Context | 低 |
| 单元测试 | 添加 Vitest + Testing Library | 中 |
| ESLint/Prettier | 统一代码规范 | 低 |

---

## 九、总结

华夏科技树是一个具有教育价值的原创项目，当前架构清晰、实现合理。未来的核心发展方向应该是：

1. **视觉升级**：从"技术展示"到"文化体验"的转变
2. **功能完善**：搜索、引导、聚焦等交互补全
3. **数据建设**：扩充数据量，标注来源，提升可信度
4. **技术打磨**：架构优化，测试完善，性能提升

建议按照阶段一（体验优化）→ 阶段二（核心功能）→ 阶段三（数据建设）→ 阶段四（高级功能）的顺序推进，每个阶段结束后进行用户反馈收集，及时调整方向。

---

*报告完毕。如需某个模块的详细技术方案，请告知。*
