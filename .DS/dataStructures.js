/**
 * dataStructures.js
 *
 * 数据结构课程设计辅助实现。
 *
 * 注意：
 * - 本文件用于报告展示与算法说明，未直接接入当前应用入口。
 * - 注释中的“应用场景”指当前项目中的对应业务场景、同类实现或可替换接入点。
 */

// ============================================================
// 1. 线性表 LinearList
// ============================================================

/**
 * 应用场景：
 * - 当前项目中的 NODES 节点数组，本质上就是线性表。
 * - 搜索结果列表、分类统计列表、时间轴刻度列表也都按线性表方式遍历。
 */
export class LinearList {
  constructor(items = []) {
    this.items = [...items];
  }

  size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  get(index) {
    if (index < 0 || index >= this.items.length) return null;
    return this.items[index];
  }

  insert(index, value) {
    const safeIndex = Math.max(0, Math.min(index, this.items.length));
    this.items.splice(safeIndex, 0, value);
    return this.items.length;
  }

  remove(index) {
    if (index < 0 || index >= this.items.length) return null;
    return this.items.splice(index, 1)[0];
  }

  find(predicate) {
    return this.items.find(predicate) || null;
  }

  toArray() {
    return [...this.items];
  }
}

// ============================================================
// 2. 栈 Stack
// ============================================================

/**
 * 应用场景：
 * - DFS 深度优先遍历可使用栈保存待访问节点。
 * - 当前后端 DFS 逻辑使用数组的 push/pop，等价于这里的 Stack。
 */
export class Stack {
  constructor(items = []) {
    this.items = [...items];
  }

  push(value) {
    this.items.push(value);
  }

  pop() {
    return this.items.pop() ?? null;
  }

  peek() {
    return this.items.length ? this.items[this.items.length - 1] : null;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  toArray() {
    return [...this.items];
  }
}

// ============================================================
// 3. 队列 Queue
// ============================================================

/**
 * 应用场景：
 * - BFS 广度优先遍历使用队列保存下一层节点。
 * - 当前后端 BFS 逻辑使用数组的 push/shift，等价于这里的 Queue。
 */
export class Queue {
  constructor(items = []) {
    this.items = [...items];
    this.head = 0;
  }

  enqueue(value) {
    this.items.push(value);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const value = this.items[this.head];
    this.head += 1;

    if (this.head > 32 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }

    return value;
  }

  front() {
    return this.isEmpty() ? null : this.items[this.head];
  }

  isEmpty() {
    return this.head >= this.items.length;
  }

  toArray() {
    return this.items.slice(this.head);
  }
}

// ============================================================
// 4. 串 String / KMP 匹配
// ============================================================

/**
 * 应用场景：
 * - 当前搜索面板使用 includes 做多字段匹配。
 * - 若要支持更高效的节点名称、简介、发明者检索，可替换为 KMP 子串匹配。
 */
export class KMPMatcher {
  static buildNext(pattern) {
    const next = new Array(pattern.length).fill(0);
    let j = 0;

    for (let i = 1; i < pattern.length; i += 1) {
      while (j > 0 && pattern[i] !== pattern[j]) {
        j = next[j - 1];
      }
      if (pattern[i] === pattern[j]) j += 1;
      next[i] = j;
    }

    return next;
  }

  static indexOf(text, pattern) {
    if (!pattern) return 0;
    const next = KMPMatcher.buildNext(pattern);
    let j = 0;

    for (let i = 0; i < text.length; i += 1) {
      while (j > 0 && text[i] !== pattern[j]) {
        j = next[j - 1];
      }
      if (text[i] === pattern[j]) j += 1;
      if (j === pattern.length) return i - pattern.length + 1;
    }

    return -1;
  }

  static contains(text, pattern) {
    return KMPMatcher.indexOf(text.toLowerCase(), pattern.toLowerCase()) !== -1;
  }
}

// ============================================================
// 5. 数组与广义表 GeneralizedList
// ============================================================

/**
 * 应用场景：
 * - 项目数据中节点数组嵌套 outEdges 数组。
 * - 详情标签常用二维数组描述 [文本, 背景色, 边框色, 文字色]。
 * - 广义表可描述“时代 -> 分类 -> 节点”的嵌套结构。
 */
export class GeneralizedList {
  constructor(value = []) {
    this.value = value;
  }

  flatten() {
    const result = [];

    const walk = (item) => {
      if (Array.isArray(item)) {
        item.forEach(walk);
        return;
      }
      result.push(item);
    };

    walk(this.value);
    return result;
  }

  depth() {
    const getDepth = (item) => {
      if (!Array.isArray(item)) return 0;
      if (item.length === 0) return 1;
      return 1 + Math.max(...item.map(getDepth));
    };

    return getDepth(this.value);
  }
}

// ============================================================
// 6. 树和二叉树 BinaryTree
// ============================================================

export class BinaryTreeNode {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

/**
 * 应用场景：
 * - 当前项目没有严格二叉树主结构。
 * - 但 BFS/DFS 的 parent 关系可形成遍历生成树。
 * - 时间区间、分类层级、页面 DOM 解析也可以用树结构描述。
 */
export class BinaryTree {
  constructor(root = null) {
    this.root = root;
  }

  preorder(node = this.root, result = []) {
    if (!node) return result;
    result.push(node.value);
    this.preorder(node.left, result);
    this.preorder(node.right, result);
    return result;
  }

  inorder(node = this.root, result = []) {
    if (!node) return result;
    this.inorder(node.left, result);
    result.push(node.value);
    this.inorder(node.right, result);
    return result;
  }

  postorder(node = this.root, result = []) {
    if (!node) return result;
    this.postorder(node.left, result);
    this.postorder(node.right, result);
    result.push(node.value);
    return result;
  }
}

// ============================================================
// 7. 图 TechGraph
// ============================================================

/**
 * 应用场景：
 * - 华夏科技树以发明为顶点，以技术传承/依赖为有向边。
 * - ADJ 保存后继节点，RADJ 保存前驱节点，NMAP 保存节点详情。
 */
export class TechGraph {
  constructor(nodes = []) {
    this.nodes = nodes;
    this.adj = Object.fromEntries(nodes.map((node) => [node.id, node.outEdges || []]));
    this.radj = Object.fromEntries(nodes.map((node) => [node.id, []]));
    this.nmap = Object.fromEntries(nodes.map((node) => [node.id, node]));

    nodes.forEach((node) => {
      (node.outEdges || []).forEach((targetId) => {
        if (this.radj[targetId]) this.radj[targetId].push(node.id);
      });
    });
  }

  getNode(id) {
    return this.nmap[id] || null;
  }

  getSuccessors(id) {
    return this.adj[id] || [];
  }

  getPredecessors(id) {
    return this.radj[id] || [];
  }

  bfs(startId) {
    const visited = new Set();
    const queue = new Queue([startId]);
    const order = [];

    while (!queue.isEmpty()) {
      const current = queue.dequeue();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      order.push(current);

      this.getSuccessors(current).forEach((next) => {
        if (!visited.has(next)) queue.enqueue(next);
      });
    }

    return order;
  }

  dfs(startId) {
    const visited = new Set();
    const stack = new Stack([startId]);
    const order = [];

    while (!stack.isEmpty()) {
      const current = stack.pop();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      order.push(current);

      [...this.getSuccessors(current)].reverse().forEach((next) => {
        if (!visited.has(next)) stack.push(next);
      });
    }

    return order;
  }
}

// ============================================================
// 8. 查找 HashSearchTable
// ============================================================

/**
 * 应用场景：
 * - 当前项目中的 NMAP 是 id -> node 的哈希查找表。
 * - 图片资源查找也使用 Map 保存文件名映射。
 */
export class HashSearchTable {
  constructor(items = [], keySelector = (item) => item.id) {
    this.table = new Map();
    items.forEach((item) => {
      this.table.set(keySelector(item), item);
    });
  }

  insert(key, value) {
    this.table.set(key, value);
  }

  search(key) {
    return this.table.get(key) || null;
  }

  contains(key) {
    return this.table.has(key);
  }

  remove(key) {
    return this.table.delete(key);
  }
}

// ============================================================
// 9. 排序 Sorters
// ============================================================

/**
 * 应用场景：
 * - 节点布局前按 year 排序。
 * - 搜索结果可按匹配分数排序。
 * - 分类统计可按节点数量排序。
 */
export const Sorters = {
  quickSort(items, compare = (a, b) => a - b) {
    if (items.length <= 1) return [...items];

    const [pivot, ...rest] = items;
    const left = rest.filter((item) => compare(item, pivot) <= 0);
    const right = rest.filter((item) => compare(item, pivot) > 0);

    return [
      ...Sorters.quickSort(left, compare),
      pivot,
      ...Sorters.quickSort(right, compare),
    ];
  },

  byYear(nodes) {
    return Sorters.quickSort(nodes, (a, b) => a.year - b.year);
  },

  byScoreDesc(results) {
    return Sorters.quickSort(results, (a, b) => b.score - a.score);
  },
};

