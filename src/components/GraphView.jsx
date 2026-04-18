// ============================================================
// GraphView.jsx
// SVG 知识图谱渲染组件
// ============================================================

import React from "react";
import { NODE_RADIUS, VIEW_BOX } from "../utils/constants";
import { nState, eState, edgePath } from "../utils/graphUtils";
import {
  computeEraTimelinePositions,
  getActiveEraIndex,
  mergeEraBackgrounds,
  TIMELINE_LAYOUT,
} from "../utils/timelineUtils";
import { ERA_BACKGROUND_SETTINGS } from "../config/eraBackgrounds";
import { EraBackgroundLayer } from "./EraBackgroundLayer";
import { NodeTooltip } from "./NodeTooltip";
import "../styles/GraphView.css";

export const GraphView = React.memo(function GraphView({
  NODES,
  POS,
  CAT,
  ADJ,
  EDGES,
  pan,
  scale,
  timelinePanX,
  sel,
  step,
  mode,
  onNode,
  handlers,
  actions,
  viewportRef,
  isDragging,
  timelineConfig,
}) {
  const [hoveredNode, setHoveredNode] = React.useState(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const eraPositions = React.useMemo(
    () => computeEraTimelinePositions(timelineConfig),
    [timelineConfig]
  );
  const eraBackgrounds = React.useMemo(
    () => mergeEraBackgrounds(timelineConfig),
    [timelineConfig]
  );
  const activeEraIndex = React.useMemo(
    () => getActiveEraIndex(
      eraPositions,
      timelinePanX,
      scale,
      ERA_BACKGROUND_SETTINGS.switchTriggerX
    ),
    [eraPositions, timelinePanX, scale]
  );
  const activeEra = eraBackgrounds[activeEraIndex] || eraBackgrounds[0] || null;
  const preloadEras = React.useMemo(
    () => [
      eraBackgrounds[activeEraIndex - 1],
      eraBackgrounds[activeEraIndex],
      eraBackgrounds[activeEraIndex + 1],
    ].filter(Boolean),
    [eraBackgrounds, activeEraIndex]
  );

  return (
    <>
      <EraBackgroundLayer
        era={activeEra}
        settings={ERA_BACKGROUND_SETTINGS}
        preloadEras={preloadEras}
      />

      <svg
        ref={viewportRef}
        className="graph-view-svg"
        viewBox={VIEW_BOX}
        preserveAspectRatio="xMidYMin meet"
        style={{
          width: "100%",
          height: "100%",
          cursor: isDragging ? "grabbing" : "grab", // 改这里
        }}
        xmlns="http://www.w3.org/2000/svg"
        onWheel={handlers.onWheel}
        onMouseDown={handlers.onMouseDown}
        onMouseMove={handlers.onMouseMove}
        onMouseUp={handlers.onMouseUp}
        onMouseLeave={handlers.onMouseLeave} // 改这里
      >
        <defs>
          <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(139,105,20,.06)" strokeWidth=".6" />
          </pattern>

          {[
            ["a0", "rgba(139,105,20,.35)"],
            ["aD", "rgba(139,105,20,.7)"],
            ["aA", "#e74c3c"],
            ["aP", "#e74c3c"],
            ["aO", "#e67e22"],
          ].map(([id, fill]) => (
            <marker key={id} id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3z" fill={fill} />
            </marker>
          ))}

          <linearGradient id="timelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b6914" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#c8a045" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#b8860b" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <rect width="1200" height="640" fill="url(#grid)" />

        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
          {EDGES.map((e, i) => {
            const st = eState(e.from, e.to, step, mode);
            const [clr, sw, mk, opacity, isActive] =
              st === "active"
                ? ["#e74c3c", 2.5, "aA", 1, true]
              : st === "path"
                ? ["#e74c3c", 3.5, "aP", 1, false]
              : st === "done"
                ? ["#e67e22", 2.0, "aO", 1, false]
              : st === "idle"
                ? ["rgba(139,105,20,.35)", 1.5, "a0", 1, false]
              : st === "faded"
                ? ["rgba(139,105,20,.18)", 1.0, "a0", 0.25, false]
              : ["rgba(139,105,20,.35)", 1.5, "a0", 1, false];

            return (
              <path
                key={i}
                d={edgePath(e.from, e.to, POS, NODE_RADIUS)}
                fill="none"
                stroke={clr}
                strokeWidth={sw}
                markerEnd={`url(#${mk})`}
                opacity={opacity}
                className={`graph-edge ${isActive ? 'active' : ''}`}
                style={{ 
                  transition: "stroke .35s,stroke-width .35s,opacity .35s"
                }}
              />
            );
          })}

          {NODES.map((node) => {
            const p = POS[node.id];
            const st = nState(node.id, step, mode);
            const cc = CAT[node.cat]?.color ?? "#c8a045";
            const isSel = sel === node.id;
            const rc =
              st === "current"
                ? "#e74c3c"
              : st === "visited"
                ? "#e67e22"
              : st === "queued"
                ? "#4a90d9"
              : st === "stacked"
                ? "#2ecc71"
              : st === "faded"
                ? "rgba(139,105,20,.5)"
              : isSel && mode === "explore"
                ? "#e74c3c"
              : cc;
            const rw = st !== "idle" && st !== "faded" ? 2.5 : 1.8;
            const nm = node.name;
            const nl = nm.length;

            return (
              <g
                key={node.id}
                className={`graph-node ${isSel ? 'selected' : ''}`}
                transform={`translate(${p.x},${p.y})`}
                onClick={() => onNode(node.id)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredNode(node);
                  setTooltipPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 8,
                  });
                }}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer" }}
              >
                {st === "current" && (
                  <circle r={NODE_RADIUS + 14} fill="#e74c3c" opacity=".08" className="node-pulse-ring">
                    <animate
                      attributeName="r"
                      values={`${NODE_RADIUS + 10};${NODE_RADIUS + 20};${NODE_RADIUS + 10}`}
                      dur=".9s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.08;0.03;0.08"
                      dur=".9s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {(st !== "idle" || isSel) && (
                  <circle
                    r={NODE_RADIUS + 7}
                    fill={isSel && st === "idle" ? "#c8a045" : rc}
                    opacity={st === "faded" ? ".05" : ".1"}
                    className="node-ring"
                  />
                )}

                <circle r={NODE_RADIUS} fill="#fffef8" opacity={st === "faded" ? 0.4 : 1} />
                <circle
                  r={NODE_RADIUS}
                  fill="none"
                  stroke={rc}
                  strokeWidth={rw}
                  opacity={st === "faded" ? 0.4 : 1}
                  className="node-circle-primary"
                  style={{ transition: "stroke .3s,opacity .3s,r .3s" }}
                />

                {nl <= 3 && (
                  <text y="3" textAnchor="middle" fontSize="11" fill="#2c2416" fontFamily='"Noto Serif SC"' fontWeight="700" opacity={st === "faded" ? 0.4 : 1} className="node-text">
                    {nm}
                  </text>
                )}
                {nl === 4 && (
                  <text y="3" textAnchor="middle" fontSize="9.5" fill="#2c2416" fontFamily='"Noto Serif SC"' fontWeight="700" opacity={st === "faded" ? 0.4 : 1} className="node-text">
                    {nm}
                  </text>
                )}
                {nl > 4 && (
                  <>
                    <text y="-6" textAnchor="middle" fontSize="9" fill="#2c2416" fontFamily='"Noto Serif SC"' fontWeight="700" opacity={st === "faded" ? 0.4 : 1} className="node-text">
                      {nm.slice(0, 4)}
                    </text>
                    <text y="5" textAnchor="middle" fontSize="9" fill="#2c2416" fontFamily='"Noto Serif SC"' fontWeight="700" opacity={st === "faded" ? 0.4 : 1} className="node-text">
                      {nm.slice(4)}
                    </text>
                  </>
                )}

                <text
                  y={NODE_RADIUS + 13}
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(90,74,56,.5)"
                  fontFamily='"JetBrains Mono"'
                  opacity={st === "faded" ? 0.4 : 1}
                  className="node-text"
                >
                  {node.year < 0 ? `${Math.abs(node.year)}BC` : `${node.year}AD`}
                </text>
              </g>
            );
          })}
        </g>

        {/* 时间轴位置常量：统一控制高低 */}
        {(() => {
          const TL_base = 12;
          const TL_Y = TL_base + 24;           // 主轴纵坐标（原来 44）
          const TL_BAR_Y = TL_base + 16;       // 朝代色块纵坐标（原来 36）
          const TL_NAME_Y = TL_base + 8;      // 朝代名称文字（原来 28）
          const TL_YEAR_Y = TL_base + 40;      // 起始年份文字（原来 60）

          
          return (
            <g transform={`translate(${timelinePanX},0)`}>
              {/* 1) 只缩放”图形”，不缩放文字 */}
              <g transform={`scale(${scale},1)`}>
                <line
                  x1={TIMELINE_LAYOUT.baseOffset}
                  y1={TL_Y}
                  x2={TIMELINE_LAYOUT.rightEdge * TIMELINE_LAYOUT.widthMultiplier}
                  y2={TL_Y}
                  stroke={'rgba(139,105,20,.1)'}
                  strokeWidth={14}
                  strokeLinecap={'round'}
                />

                {eraPositions.map(({ name, color, lightColor, x1, x2, width }) => {
                  return (
                    <g key={`shape-${name}`}>
                      <rect
                        x={x1}
                        y={TL_BAR_Y}
                        width={width}
                        height="16"
                        rx="4"
                        fill={lightColor}
                        opacity="0.7"
                      />
                      <line
                        x1={x1}
                        y1={TL_Y}
                        x2={x2}
                        y2={TL_Y}
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                    </g>
                  );
                })}
              </g>

              {/* 2) 单独渲染文字：位置跟着 scale 变化，但文字本身不被拉伸 */}
              {eraPositions.map(({ name, start, color, x1 }) => {
                const scaledX1 = x1 * scale;

                return (
                  <g key={`label-${name}`}>
                    <text
                      x={scaledX1 + 4}
                      y={TL_NAME_Y}
                      textAnchor="start"
                      fontSize="11"
                      fill={color}
                      fontFamily='"Noto Serif SC"'
                      fontWeight="600"
                      letterSpacing="1"
                    >
                      {name}
                    </text>

                    <text
                      x={scaledX1 + 4}
                      y={TL_YEAR_Y}
                      textAnchor="start"
                      fontSize="8"
                      fill="rgba(90,74,56,.55)"
                      fontFamily='"JetBrains Mono"'
                    >
                      {start < 0 ? `${Math.abs(start)}BC` : `${start}AD`}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}
      </svg>

      <div className="graph-view__controls">
        <button
          onClick={actions.zoomIn}
          className="graph-view__control-button"
        >
          +
        </button>

        <button
          onClick={actions.zoomOut}
          className="graph-view__control-button"
        >
          −
        </button>

        <button
          onClick={() => sel && actions.panToNode(sel, POS)}
          title="回到当前节点"
          className="graph-view__control-button graph-view__control-button--small"
        >
          ◎
        </button>

        <button
          onClick={actions.resetView}
          className="graph-view__control-button graph-view__control-button--small"
        >
          ⌂
        </button>
      </div>

      {/* Tooltip 显示 */}
      <NodeTooltip
        node={hoveredNode}
        CAT={CAT}
        position={tooltipPos}
        isVisible={hoveredNode !== null && !isDragging}
      />
    </>
  );
});
