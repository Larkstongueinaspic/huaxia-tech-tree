// ============================================================
// timelineUtils.js
// 时间轴区间布局、背景配置合并与当前时代判定
// ============================================================

import {
  ERA_BACKGROUNDS_BY_NAME,
  ERA_BACKGROUND_SETTINGS,
} from "../config/eraBackgrounds";

export const TIMELINE_LAYOUT = {
  baseOffset: 60,
  rightEdge: 1140,
  widthMultiplier: 10,
};

export function computeEraTimelinePositions(timelineConfig, layout = TIMELINE_LAYOUT) {
  if (!Array.isArray(timelineConfig) || timelineConfig.length === 0) return [];

  let cumulativeYears = 0;
  const weightedRanges = timelineConfig.map(({ start, end, scale = 1 }) => {
    const weightedSpan = (end - start) * scale;
    const range = {
      startWeighted: cumulativeYears,
      endWeighted: cumulativeYears + weightedSpan,
    };
    cumulativeYears += weightedSpan;
    return range;
  });

  const totalWeightedYears = cumulativeYears || 1;
  const timelineWidth = (layout.rightEdge - layout.baseOffset) * layout.widthMultiplier;

  return timelineConfig.map((era, index) => {
    const range = weightedRanges[index];
    const x1 = Math.round(layout.baseOffset + (range.startWeighted / totalWeightedYears) * timelineWidth);
    const x2 = Math.round(layout.baseOffset + (range.endWeighted / totalWeightedYears) * timelineWidth);

    return {
      ...era,
      x1,
      x2,
      width: x2 - x1,
    };
  });
}

export function getActiveEraIndex(eraPositions, timelinePanX, scale, switchTriggerX) {
  if (!Array.isArray(eraPositions) || eraPositions.length === 0) return -1;

  const triggerX = Number.isFinite(switchTriggerX)
    ? switchTriggerX
    : ERA_BACKGROUND_SETTINGS.switchTriggerX;

  let activeIndex = 0;
  eraPositions.forEach((era, index) => {
    const eraLeftInView = era.x1 * scale + timelinePanX;
    if (eraLeftInView <= triggerX) {
      activeIndex = index;
    }
  });

  return activeIndex;
}

export function mergeEraBackgrounds(timelineConfig, backgroundMap = ERA_BACKGROUNDS_BY_NAME) {
  if (!Array.isArray(timelineConfig)) return [];

  return timelineConfig.map((era) => {
    const configured = backgroundMap[era.name] || {};
    const background = era.background || configured;

    return {
      ...era,
      background: {
        image: background.image || ERA_BACKGROUND_SETTINGS.fallbackImage,
        position: background.position || ERA_BACKGROUND_SETTINGS.fallbackPosition,
        opacity: background.opacity,
        credit: background.credit || era.name,
        source: background.source,
      },
    };
  });
}
