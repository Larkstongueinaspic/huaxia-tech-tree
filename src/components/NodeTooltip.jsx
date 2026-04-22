/* ============================================================
 * NodeTooltip.jsx
 * 节点悬停提示组件
 * 
 * 显示节点的基本信息：名称、分类、年份、描述摘要
 * ============================================================ */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './NodeTooltip.css';

export function NodeTooltip({ node, CAT, position, isVisible }) {
  const tooltipRef = useRef(null);
  const [renderedNode, setRenderedNode] = useState(node);
  const [renderedPosition, setRenderedPosition] = useState(position);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [displayState, setDisplayState] = useState(
    isVisible && node ? 'visible' : 'hidden'
  );

  useEffect(() => {
    if (isVisible && node) {
      setRenderedNode(node);
      setRenderedPosition(position);
      setAdjustedPosition(position);
      setDisplayState('visible');
      return;
    }

    if (renderedNode) {
      setDisplayState('leaving');
    }
  }, [isVisible, node, position, renderedNode]);

  // 根据视口边界调整 Tooltip 位置
  useEffect(() => {
    if (displayState !== 'visible' || !renderedNode || !tooltipRef.current) return;

    const rect = tooltipRef.current.getBoundingClientRect();
    const tooltipWidth = rect.width || 280;
    const newPos = { ...renderedPosition };

    newPos.x = Math.min(
      Math.max(renderedPosition.x + 12, 8),
      window.innerWidth - tooltipWidth - 8
    );

    // 检查上边界
    if (rect.top < 0) {
      newPos.y += Math.abs(rect.top) + 8;
    }

    // 检查下边界
    if (rect.bottom > window.innerHeight) {
      newPos.y -= (rect.bottom - window.innerHeight) + 16;
    }

    // 检查左边界
    setAdjustedPosition(newPos);
  }, [displayState, renderedNode, renderedPosition]);

  if (!renderedNode) return null;

  const catInfo = CAT[renderedNode.cat];
  const catColor = catInfo?.color || '#c8a045';
  const catLabel = catInfo?.label || renderedNode.cat;

  // 格式化年份
  const yearStr = !renderedNode.year
    ? ''
    : renderedNode.year < 0
      ? `${Math.abs(renderedNode.year)} BC`
      : `${renderedNode.year} AD`;

  return createPortal(
    <div
      ref={tooltipRef}
      className={`node-tooltip node-tooltip--${displayState}`}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
      onAnimationEnd={() => {
        if (displayState === 'leaving') {
          setRenderedNode(null);
          setDisplayState('hidden');
        }
      }}
    >
      <div className="node-tooltip-content">
        <div className="node-tooltip-header">
          <div className="node-tooltip-name">{renderedNode.name}</div>
          {renderedNode.en && <div className="node-tooltip-en">{renderedNode.en}</div>}
        </div>

        <div className="node-tooltip-meta">
          <span 
            className="node-tooltip-category"
            style={{ borderColor: catColor, color: catColor }}
          >
            {catLabel}
          </span>
          {yearStr && <span className="node-tooltip-year">{yearStr}</span>}
        </div>

        {renderedNode.desc && (
          <div className="node-tooltip-desc">
            {renderedNode.desc.slice(0, 80)}
            {renderedNode.desc.length > 80 ? '...' : ''}
          </div>
        )}

        {renderedNode.inv && (
          <div className="node-tooltip-inv">
            <strong>发明者：</strong>{renderedNode.inv}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
