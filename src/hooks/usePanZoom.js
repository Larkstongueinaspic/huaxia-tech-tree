// ============================================================
// usePanZoom.js
// 画布平移与缩放逻辑
// ============================================================

import { useState, useCallback, useRef } from "react";
import { MIN_SCALE, MAX_SCALE, ZOOM_FACTOR, SCALE_BUTTON_FACTOR_IN, SCALE_BUTTON_FACTOR_OUT } from "../utils/constants";

export function usePanZoom() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [timelinePanX, setTimelinePanX] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const panRef = useRef({ x: 0, y: 0, dragging: false, startX: 0, startY: 0 });
  const scaleRef = useRef(1);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleRef.current * delta));

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleDiff = newScale - scaleRef.current;

    const svgEl = e.currentTarget;
    const vb = svgEl.viewBox.baseVal;
    const vbMouseX = (mouseX / rect.width) * vb.width + panRef.current.x;
    const vbMouseY = (mouseY / rect.height) * vb.height + panRef.current.y;

    const newPanX = panRef.current.x - scaleDiff * vbMouseX / newScale;
    const newPanY = panRef.current.y - scaleDiff * vbMouseY / newScale;

    scaleRef.current = newScale;
    panRef.current = { ...panRef.current, x: newPanX, y: newPanY };
    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
    setTimelinePanX(newPanX);
  }, []);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    panRef.current = { ...panRef.current, dragging: true, startX: e.clientX, startY: e.clientY };
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!panRef.current.dragging) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    panRef.current.startX = e.clientX;
    panRef.current.startY = e.clientY;
    const newPan = { x: panRef.current.x + dx, y: panRef.current.y + dy };
    panRef.current = { ...panRef.current, ...newPan };
    setPan(newPan);
    setTimelinePanX(newPan.x);
  }, []);

  const onMouseUp = useCallback(() => {
    panRef.current = { ...panRef.current, dragging: false };
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => {
    const ns = Math.min(MAX_SCALE, scaleRef.current * SCALE_BUTTON_FACTOR_IN);
    scaleRef.current = ns;
    setScale(ns);
    setTimelinePanX(pan.x);
  }, [pan.x]);

  const zoomOut = useCallback(() => {
    const ns = Math.max(MIN_SCALE, scaleRef.current * SCALE_BUTTON_FACTOR_OUT);
    scaleRef.current = ns;
    setScale(ns);
    setTimelinePanX(pan.x);
  }, [pan.x]);

  const resetView = useCallback(() => {
    panRef.current = { x: 0, y: 0, dragging: false, startX: 0, startY: 0 };
    scaleRef.current = 1;
    setPan({ x: 0, y: 0 });
    setScale(1);
    setTimelinePanX(0);
  }, []);

  return {
    pan,
    timelinePanX,
    scale,
    isDragging,
    panRef,
    scaleRef,
    handlers: { onWheel, onMouseDown, onMouseMove, onMouseUp },
    actions: { zoomIn, zoomOut, resetView },
  };
}
