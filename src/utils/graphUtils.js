// ============================================================
// graphUtils.js
// 图相关工具函数
// ============================================================

import { NODE_RADIUS } from './constants';

/**
 * 判断节点遍历状态
 * @param {string} id - 节点ID
 * @param {object} step - 当前步骤快照
 * @param {string} mode - 当前模式 "explore" | "bfs" | "dfs"
 * @returns {"idle"|"current"|"visited"|"queued"|"stacked"}
 */
export function nState(id, step, mode) {
  if (!step) return "idle";
  if (step.cur === id) return "current";
  if (step.visited.includes(id)) return "visited";
  if (mode === "bfs" && step.queue?.includes(id)) return "queued";
  if (mode === "dfs" && step.stack?.includes(id)) return "stacked";
  return "idle";
}

/**
 * 判断边遍历状态
 * @param {string} f - 起始节点ID
 * @param {string} t - 目标节点ID
 * @param {object} step - 当前步骤快照
 * @returns {"idle"|"active"|"done"}
 */
export function eState(f, t, step) {
  if (!step) return "idle";
  if (step.cur === f && step.fresh?.includes(t)) return "active";
  if (step.visited.includes(f) && step.visited.includes(t)) return "done";
  return "idle";
}

/**
 * 生成贝塞尔曲线路径
 * @param {string} f - 起始节点ID
 * @param {string} t - 目标节点ID
 * @param {object} POS - 节点坐标映射
 * @param {number} R - 节点半径
 * @returns {string} SVG路径字符串
 */
export function edgePath(f, t, POS, R = NODE_RADIUS) {
  const a = POS[f], b = POS[t];
  if (!a || !b) return "";
  const midX = (a.x + b.x) / 2;
  return `M ${a.x + R + 1} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x - R - 1} ${b.y}`;
}

/**
 * 从邻接表推导所有边
 * @param {array} NODES - 节点列表
 * @param {object} ADJ - 邻接表
 * @returns {array} 边列表 [{ from, to }, ...]
 */
export function deriveEdges(NODES, ADJ) {
  return NODES.flatMap(n => (ADJ[n.id] || []).map(to => ({ from: n.id, to })));
}
