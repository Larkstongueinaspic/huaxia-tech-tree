// ============================================================
// Header.jsx
// 顶部导航栏组件
// ============================================================

import React from "react";
import { Btn } from "./ui/Btn";

export const Header = React.memo(function Header({ mode, setMode, tab, setTab, setSteps, setSi, setPlaying, onSearchClick, onGuideClick }) {
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSteps([]);
    setSi(0);
    setPlaying(false);
  };

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <h1 className="app-header__title">华夏科技树</h1>
        <span className="app-header__subtitle">CHINA TECHNOLOGY DAG</span>
      </div>

      <div className="app-header__group">
        <Btn
          active={mode === "explore"}
          col="200,160,69"
          onClick={() => handleModeChange("explore")}
        >
          🗺 探索
        </Btn>
        <Btn
          active={mode === "bfs"}
          col="74,144,217"
          onClick={() => handleModeChange("bfs")}
        >
          ⬛ BFS 广度优先
        </Btn>
        <Btn
          active={mode === "dfs"}
          col="46,204,113"
          onClick={() => handleModeChange("dfs")}
        >
          🔺 DFS 深度优先
        </Btn>
      </div>

      <div className="app-header__group">
        <Btn
          active={false}
          col="200,160,69"
          onClick={onSearchClick}
          title="按 Cmd+K 或 Ctrl+K 快速搜索"
        >
          🔍 搜索
        </Btn>
        <Btn
          active={tab === "graph"}
          col="200,160,69"
          onClick={() => setTab("graph")}
        >
          知识图谱
        </Btn>
        <Btn
          active={tab === "adjlist"}
          col="74,144,217"
          onClick={() => setTab("adjlist")}
        >
          邻接表
        </Btn>
        <Btn
          active={false}
          col="139,105,20"
          onClick={onGuideClick}
        >
          📖 新手引导
        </Btn>
      </div>
    </header>
  );
});
