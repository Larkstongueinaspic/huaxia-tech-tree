import React from "react";

// ============================================================
// BottomBar.jsx
// 底部 BFS/DFS 数据结构可视化栏
// ============================================================

export const BottomBar = React.memo(function BottomBar({ step, mode, NMAP }) {
  if (!step || mode === "explore") return null;

  const items = mode === "bfs" ? step.queue : [...(step.stack ?? [])].reverse();
  const col = mode === "bfs" ? "#4a90d9" : "#2ecc71";

  return (
    <div className="bottom-bar" style={{ "--bottom-accent": col }}>
      <div className="bottom-bar__label">
        {mode === "bfs" ? (
          <>
            <strong>Queue</strong>
            <br />
            <span style={{ fontSize: 9 }}>FIFO 队列</span>
          </>
        ) : (
          <>
            <strong>Stack</strong>
            <br />
            <span style={{ fontSize: 9 }}>LIFO 栈</span>
          </>
        )}
      </div>

      <div className="bottom-bar__items">
        {!items || !items.length ? (
          <span className="bottom-bar__empty">[ empty ]</span>
        ) : (
          items.map((id, i) => (
            <div
              key={`${id}-${i}`}
              className="bottom-bar__item"
              style={{ "--bottom-item-border": i === 0 ? "50%" : "15%" }}
            >
              <span className="bottom-bar__item-name">{NMAP[id]?.name}</span>
              {i === 0 && (
                <span className="bottom-bar__item-meta">{mode === "bfs" ? "front" : "top"}</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="bottom-bar__current">
        <div className="bottom-bar__current-label">正在访问</div>
        <div className="bottom-bar__current-name">{NMAP[step.cur]?.name}</div>
        <div className="bottom-bar__current-era">{NMAP[step.cur]?.era}</div>
      </div>

      <div className="bottom-bar__stats">
        <div className="bottom-bar__stats-value">{step.visited.size}</div>
        <div className="bottom-bar__stats-label">已访问</div>
      </div>
    </div>
  );
});
