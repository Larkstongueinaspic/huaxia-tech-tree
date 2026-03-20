// ============================================================
// constants.js
// 全局常量定义
// ============================================================

export const NODE_RADIUS = 28;

export const VIEW_BOX = "0 0 1200 640";

export const MIN_SCALE = 0.3;
export const MAX_SCALE = 4;

export const ZOOM_FACTOR = 1.1; // 滚轮缩放倍数
export const SCALE_BUTTON_FACTOR_IN = 1.2;
export const SCALE_BUTTON_FACTOR_OUT = 0.8;

export const AUTO_PLAY_INTERVAL = 900;

export const modeColor = (mode) =>
  mode === "bfs" ? "74,144,217" : mode === "dfs" ? "46,204,113" : "200,160,69";

export const timelineConfig = [
  { name: '先秦', start: -7000, end: -500,  color: '#8b6914', lightColor: '#f5e6c8' },
  { name: '春秋', start: -500,  end: -221,  color: '#a07820', lightColor: '#f8ecd4' },
  { name: '战国', start: -221,  end: -104,  color: '#b89030', lightColor: '#faf0dc' },
  { name: '秦汉', start: -104,  end: 220,   color: '#c8a045', lightColor: '#fdf6e8' },
  { name: '隋唐', start: 220,   end: 960,   color: '#d4b055', lightColor: '#fef8ec' },
  { name: '宋',   start: 960,   end: 1232,  color: '#b8860b', lightColor: '#fcf3dc' },
];

export const YEAR_RANGE = { min: -7000, max: 1232 };
