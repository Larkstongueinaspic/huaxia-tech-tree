export const DEFAULT_UI_RADII = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
  button: "8px",
  control: "8px",
  panel: "14px",
  sidebar: "14px",
  panelToggle: "8px",
  modal: "14px",
  sheet: "14px",
  tooltip: "8px",
  tag: "6px",
  pill: "6px",
  input: "8px",
  scrollThumb: "6px",
  graphViewport: "14px",
  nodeCard: "10px",
};

export const DEFAULT_UI_CONFIG = {
  radii: DEFAULT_UI_RADII,
};

const RADIUS_VAR_NAMES = {
  sm: "--radius-sm",
  md: "--radius-md",
  lg: "--radius-lg",
  xl: "--radius-xl",
  full: "--radius-full",
  button: "--component-radius-button",
  control: "--component-radius-control",
  panel: "--component-radius-panel",
  sidebar: "--component-radius-sidebar",
  panelToggle: "--component-radius-panel-toggle",
  modal: "--component-radius-modal",
  sheet: "--component-radius-sheet",
  tooltip: "--component-radius-tooltip",
  tag: "--component-radius-tag",
  pill: "--component-radius-pill",
  input: "--component-radius-input",
  scrollThumb: "--component-radius-scroll-thumb",
  graphViewport: "--component-radius-graph-viewport",
  nodeCard: "--component-radius-node-card",
};

function normalizeRadiusValue(value, fallback) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${Math.max(0, value)}px`;
  }

  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(trimmed)) return trimmed;
  if (trimmed === "0") return "0px";

  return fallback;
}

export function normalizeUiConfig(config = {}) {
  const sourceRadii = config?.radii || {};
  const radii = Object.fromEntries(
    Object.entries(DEFAULT_UI_RADII).map(([key, fallback]) => [
      key,
      normalizeRadiusValue(sourceRadii[key], fallback),
    ])
  );

  return {
    ...DEFAULT_UI_CONFIG,
    ...config,
    radii,
  };
}

export function buildRadiusCssVars(config = DEFAULT_UI_CONFIG) {
  const { radii } = normalizeUiConfig(config);

  return Object.fromEntries(
    Object.entries(RADIUS_VAR_NAMES).map(([key, varName]) => [varName, radii[key]])
  );
}
