import React from "react";

// ============================================================
// AdjListView.jsx
// 邻接表代码风格视图
// ============================================================

export const AdjListView = React.memo(function AdjListView({ NODES, ADJ, CAT, step, onNode }) {
  return (
    <div className="adjlist-view">
      <div className="adjlist-view__header">
        邻接表 · HashMap&lt;String, List&lt;String&gt;&gt; — 空间复杂度 O(V+E)
      </div>

      {NODES.map(node => {
        const nbrs = ADJ[node.id];
        const isCur = step?.cur === node.id;
        const isVis = step?.visited?.has(node.id);

        return (
          <div
            key={node.id}
            onClick={() => onNode(node.id)}
            className="adjlist-view__row"
            style={{
              "--row-bg": isCur
                ? "rgba(231,76,60,.08)"
                : isVis
                ? "rgba(200,160,69,.06)"
                : "transparent",
              "--row-border": isCur ? "#e74c3c" : isVis ? "rgba(139,105,20,.45)" : "transparent",
              "--row-accent": CAT[node.cat]?.color,
            }}
          >
            <span className="adjlist-view__id">{node.id}</span>
            <span className="adjlist-view__arrow">→</span>
            <span className="adjlist-view__neighbors">
              <span className="adjlist-view__bracket">[</span>
              {nbrs.length === 0 ? (
                <span className="adjlist-view__empty"> ∅ </span>
              ) : (
                nbrs.map((n, i) => (
                  <span key={n}>
                    <span
                      className="adjlist-view__neighbor"
                      style={{
                        "--neighbor-color": step?.fresh?.includes(n)
                          ? "#e74c3c"
                          : step?.visited?.has(n)
                          ? "#c8a045"
                          : "#4a90d9",
                      }}
                    >
                      {n}
                    </span>
                    {i < nbrs.length - 1 && (
                      <span className="adjlist-view__comma">, </span>
                    )}
                  </span>
                ))
              )}
              <span className="adjlist-view__bracket"> ]</span>
            </span>
            <span className="adjlist-view__name">{node.name}</span>
          </div>
        );
      })}
    </div>
  );
});
