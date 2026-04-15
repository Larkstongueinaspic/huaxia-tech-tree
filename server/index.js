const express = require('express');
const cors = require('cors');
const path = require('path');

const nodesData = require('./data/nodes.json');
const categoriesData = require('./data/categories.json');
const timelineConfig = require('./data/timelineConfig.json');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// 构建邻接表（从节点的 outEdges 字段）
const ADJ = Object.fromEntries(nodesData.map(n => [n.id, n.outEdges || []]));
const RADJ_temp = Object.fromEntries(nodesData.map(n => [n.id, []]));

// 构建逆向邻接表
nodesData.forEach(n => {
  (n.outEdges || []).forEach(target => {
    if (RADJ_temp[target] !== undefined) {
      RADJ_temp[target].push(n.id);
    }
  });
});

const RADJ = RADJ_temp;

// 构建节点映射
const NMAP = Object.fromEntries(nodesData.map(n => [n.id, n]));

// 计算年份对应的加权位置
function yearToWeightedYear(year, config) {
  let cumulativeYears = 0;
  for (const { start, end, scale } of config) {
    if (year >= start && year < end) {
      return cumulativeYears + (year - start) * scale;
    }
    cumulativeYears += (end - start) * scale;
  }
  return cumulativeYears;
}

// 位置计算函数
function computePositions(nodes) {
  // 固定画布
  const svgWidth = 1200;
  const baseX = 60;
  const maxX = svgWidth - 60;
  const TIMELINE_SCALE = 10; // 时间轴延长倍数（与前端一致）

  // ========== 分类高度区间映射 ==========
  // 限制每个分类的 lane 范围，实现分类分区布局
  const CATEGORY_LANES = {
    craft:       { minLane: 0, maxLane: 2 },    // 工艺 - 上部
    textile:     { minLane: 0, maxLane: 2 },    // 纺织 - 上部
    metallurgy:  { minLane: 0, maxLane: 2 },    // 冶金 - 上部
    agriculture: { minLane: 0, maxLane: 1 },    // 农业 - 最上部
    
    culture:     { minLane: 2, maxLane: 4 },    // 文化 - 中部
    science:     { minLane: 2, maxLane: 4 },    // 科学 - 中部
    math:        { minLane: 2, maxLane: 4 },    // 数学 - 中部
    
    medicine:    { minLane: 4, maxLane: 5 },    // 医学 - 中下部
    navigation:  { minLane: 4, maxLane: 5 },    // 航海 - 中下部
    trade:       { minLane: 4, maxLane: 6 },    // 贸易 - 中下部
    
    engineering: { minLane: 5, maxLane: 7 },    // 工程 - 下部
    military:    { minLane: 5, maxLane: 7 },    // 军事 - 下部
  };

  // 计算总加权跨度
  let totalWeightedYears = 0;
  timelineConfig.forEach(({ start, end, scale }) => {
    totalWeightedYears += (end - start) * scale;
  });

  // 计算时间轴总宽度
  const timelineWidth = (maxX - baseX) * TIMELINE_SCALE;

  // 扩展 lanes（超过 5 行时自动增加）
  const laneHeight = 80;
  const startY = 90;
  const getLaneY = (lane) => startY + lane * laneHeight;
  const initialLanes = 8;  // 增加初始 lanes 数量以支持分类分区
  let laneLastX = new Array(initialLanes).fill(baseX);

  // 碰撞阈值（加权年份差距）
  const yearGapThreshold = 50;

  // 按年份排序节点
  const sortedNodes = [...nodes].sort((a, b) => a.year - b.year);

  // 计算每个节点的位置
  const positions = {};

  sortedNodes.forEach(n => {
    // X 坐标基于加权年份（与前端时间轴计算方式一致）
    const weightedYear = yearToWeightedYear(n.year, timelineConfig);
    const x = Math.round(baseX + (weightedYear / totalWeightedYears) * timelineWidth);

    // 确保 laneLastX 有足够长度
    const ensureLanes = (lanes) => {
      while (laneLastX.length < lanes) {
        laneLastX.push(baseX);
      }
    };

    // ========== 改进的 lane 分配逻辑 ==========
    // 1. 获取该分类的优先 lane 范围
    const catConfig = CATEGORY_LANES[n.cat] || { minLane: 0, maxLane: laneLastX.length - 1 };
    let assignedLane = -1;

    // 2. 优先在分类范围内寻找合适的 lane
    for (let lane = catConfig.minLane; lane <= catConfig.maxLane; lane++) {
      ensureLanes(lane + 1);
      if (x - laneLastX[lane] >= yearGapThreshold) {
        assignedLane = lane;
        break;
      }
    }

    // 3. 如果分类范围内没有可用的 lane，扩展到相邻 lane
    if (assignedLane === -1) {
      // 向下扩展一个 lane
      const expandedLane = catConfig.maxLane + 1;
      ensureLanes(expandedLane + 1);
      if (x - laneLastX[expandedLane] >= yearGapThreshold) {
        assignedLane = expandedLane;
      } else {
        // 创建新 lane
        assignedLane = laneLastX.length;
        ensureLanes(assignedLane + 1);
      }
    }

    const y = getLaneY(assignedLane);
    laneLastX[assignedLane] = x;

    positions[n.id] = { x, y, lane: assignedLane };
  });

  return { positions, eraRanges: timelineConfig };
}

// API Routes
app.get('/api/nodes', (req, res) => {
  res.json(nodesData);
});

app.get('/api/categories', (req, res) => {
  res.json(categoriesData);
});

app.get('/api/positions', (req, res) => {
  const result = computePositions(nodesData);
  res.json(result);
});

app.get('/api/timeline-config', (req, res) => {
  res.json(timelineConfig);
});

app.get('/api/adjacency', (req, res) => {
  res.json({ adj: ADJ, radj: RADJ, nmap: NMAP });
});

// 路径重建辅助函数
function reconstructPath(node, parent) {
  const path = [];
  let current = node;
  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = parent[current];
  }
  return path;
}

// BFS 算法
app.post('/api/algorithms/bfs', (req, res) => {
  const { start } = req.body;
  if (!start || !ADJ[start]) {
    return res.status(400).json({ error: 'Invalid start node' });
  }

  // 第一步：预先计算整个可达子树
  const discovered = new Set([start]);
  const discoverQueue = [start];
  while (discoverQueue.length) {
    const cur = discoverQueue.shift();
    (ADJ[cur] || []).forEach(n => {
      if (!discovered.has(n)) {
        discovered.add(n);
        discoverQueue.push(n);
      }
    });
  }

  // 第二步：正式遍历动画
  const steps = [];
  const visited = [];  // 仅包含已出队的节点
  const queue = [start];
  const parent = { [start]: null };

  while (queue.length) {
    const cur = queue.shift();
    visited.push(cur);

    const fresh = (ADJ[cur] || []).filter(n => !visited.includes(n) && !queue.includes(n));
    const isLeaf = fresh.length === 0;
    const leafPath = isLeaf ? reconstructPath(cur, parent) : null;

    fresh.forEach(n => {
      parent[n] = cur;
      queue.push(n);
    });

    steps.push({
      cur,
      queue: [...queue],
      visited: [...visited],
      discovered: [...discovered],
      fresh,
      ds: 'queue',
      isLeaf,
      leafPath
    });
  }
  res.json({ steps });
});

// DFS 算法
app.post('/api/algorithms/dfs', (req, res) => {
  const { start } = req.body;
  if (!start || !ADJ[start]) {
    return res.status(400).json({ error: 'Invalid start node' });
  }

  // 第一步：预先计算整个可达子树（用 DFS 遍历）
  const discovered = new Set();
  const discoverStack = [start];
  while (discoverStack.length) {
    const cur = discoverStack.pop();
    if (discovered.has(cur)) continue;
    discovered.add(cur);
    [...(ADJ[cur] || [])].reverse().forEach(n => {
      if (!discovered.has(n)) {
        discoverStack.push(n);
      }
    });
  }

  // 第二步：正式遍历动画
  const steps = [];
  const visited = [];  // 仅包含已弹出的节点
  const stack = [start];
  const parent = { [start]: null };

  while (stack.length) {
    const cur = stack.pop();
    if (visited.includes(cur)) continue;
    visited.push(cur);

    const fresh = [...(ADJ[cur] || [])].reverse().filter(n => !visited.includes(n) && !stack.includes(n));
    const isLeaf = fresh.length === 0;
    const leafPath = isLeaf ? reconstructPath(cur, parent) : null;

    fresh.forEach(n => {
      parent[n] = cur;
      stack.push(n);
    });

    steps.push({
      cur,
      stack: [...stack],
      visited: [...visited],
      discovered: [...discovered],
      fresh,
      ds: 'stack',
      isLeaf,
      leafPath
    });
  }
  res.json({ steps });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
