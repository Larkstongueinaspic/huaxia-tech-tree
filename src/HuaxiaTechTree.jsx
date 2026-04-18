// ============================================================
// HuaxiaTechTree.jsx
// 华夏文明科技树 —— 历史卷轴式沉浸体验入口
// ============================================================

import { useEffect, useMemo } from "react";

import { useGraphData } from "./hooks/useGraphData";
import { HuaxiaScrollExperience } from "./components/scroll/HuaxiaScrollExperience";
import { LoadingScreen, ErrorScreen } from "./components/StateScreen";

function buildFallbackMaps(nodes) {
  const adj = Object.fromEntries(nodes.map((node) => [node.id, node.outEdges || []]));
  const radj = Object.fromEntries(nodes.map((node) => [node.id, []]));
  const nmap = Object.fromEntries(nodes.map((node) => [node.id, node]));

  nodes.forEach((node) => {
    (node.outEdges || []).forEach((targetId) => {
      if (radj[targetId]) radj[targetId].push(node.id);
    });
  });

  return { adj, radj, nmap };
}

export default function HuaxiaTechTree() {
  const { NODES, CAT, ADJ, RADJ, NMAP, timelineConfig, loading, error } = useGraphData();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector("[data-scroll-search]")?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const graphMaps = useMemo(() => {
    if (Object.keys(NMAP || {}).length) {
      return { adj: ADJ, radj: RADJ, nmap: NMAP };
    }
    return buildFallbackMaps(NODES);
  }, [ADJ, RADJ, NMAP, NODES]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <HuaxiaScrollExperience
      NODES={NODES}
      CAT={CAT}
      ADJ={graphMaps.adj}
      RADJ={graphMaps.radj}
      NMAP={graphMaps.nmap}
      timelineConfig={timelineConfig}
    />
  );
}
