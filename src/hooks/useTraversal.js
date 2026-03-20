// ============================================================
// useTraversal.js
// 节点选择与遍历算法执行
// ============================================================

import { useState, useCallback } from "react";
import { runBFS, runDFS } from "../services/api";

export function useTraversal() {
  const [sel, setSel] = useState(null);
  const [mode, setMode] = useState("explore");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [playing, setPlaying] = useState(false);

  const onNode = useCallback((id) => {
    setSel(id);
    if (mode !== "explore") {
      const algo = mode === "bfs" ? runBFS : runDFS;
      algo(id).then(s => {
        setSteps(s);
        setSi(0);
        setPlaying(false);
      });
    }
  }, [mode]);

  return {
    sel,
    mode,
    setMode,
    steps,
    setSteps,
    si,
    setSi,
    playing,
    setPlaying,
    onNode,
  };
}
