// ============================================================
// Header.jsx
// 顶部导航栏组件
// ============================================================

import { Btn } from "./ui/Btn";

export function Header({ mode, setMode, tab, setTab, setSteps, setSi, setPlaying }) {
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSteps([]);
    setSi(0);
    setPlaying(false);
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "rgba(255,252,245,.98)",
        borderBottom: "2px solid rgba(200,160,69,.25)",
        flexShrink: 0,
        gap: 10,
        boxShadow: "0 2px 12px rgba(139,105,20,.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1
          style={{
            fontFamily: '"ZCOOL XiaoWei",serif',
            fontSize: 26,
            letterSpacing: 5,
            background: "linear-gradient(135deg,#8b6914,#c8a045,#b8860b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          华夏科技树
        </h1>
        <span style={{ fontSize: 10, color: "#8b7355", letterSpacing: 3 }}>
          CHINA TECHNOLOGY DAG
        </span>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
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

      <div style={{ display: "flex", gap: 6 }}>
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
      </div>
    </header>
  );
}
