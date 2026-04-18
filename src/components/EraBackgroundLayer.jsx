// ============================================================
// EraBackgroundLayer.jsx
// 年代背景图展示层：位于 SVG 节点/边下方，不参与交互
// ============================================================

import React from "react";
import "../styles/EraBackgroundLayer.css";

export const EraBackgroundLayer = React.memo(function EraBackgroundLayer({
  era,
  settings,
  preloadEras = [],
}) {
  const transition = settings.transition || {};
  const durationMs = transition.durationMs ?? 760;
  const [currentEra, setCurrentEra] = React.useState(era);
  const [previousEra, setPreviousEra] = React.useState(null);

  React.useEffect(() => {
    if (!era) return;
    if (currentEra?.name === era.name && currentEra?.background?.image === era.background?.image) {
      return;
    }

    setPreviousEra(currentEra || null);
    setCurrentEra(era);
  }, [era, currentEra]);

  React.useEffect(() => {
    if (!previousEra) return undefined;

    const timeoutId = window.setTimeout(() => {
      setPreviousEra(null);
    }, durationMs + 80);

    return () => window.clearTimeout(timeoutId);
  }, [previousEra, durationMs]);

  React.useEffect(() => {
    preloadEras.forEach((item) => {
      const image = item?.background?.image;
      if (!image || preloadedImages.has(image)) return;

      preloadedImages.add(image);
      const preload = new Image();
      preload.decoding = "async";
      preload.src = image;
    });
  }, [preloadEras]);

  if (!currentEra) return null;

  const rootStyle = {
    "--era-bg-opacity": currentEra.background.opacity ?? settings.opacity,
    "--era-bg-duration": `${durationMs}ms`,
    "--era-bg-easing": transition.easing || "cubic-bezier(0.22, 1, 0.36, 1)",
    "--era-bg-overlay": settings.overlay,
  };

  return (
    <div
      className="era-background-layer"
      data-transition={transition.effect}
      style={rootStyle}
      aria-hidden="true"
    >
      {previousEra && (
        <BackgroundPane
          key={`previous-${getEraBackgroundKey(previousEra)}`}
          era={previousEra}
          phase="previous"
        />
      )}
      <BackgroundPane
        key={`current-${getEraBackgroundKey(currentEra)}`}
        era={currentEra}
        phase="current"
      />
    </div>
  );
});

function BackgroundPane({ era, phase }) {
  const background = era.background || {};

  return (
    <div
      className={`era-background-layer__pane era-background-layer__pane--${phase}`}
      style={{
        backgroundImage: `url("${background.image}")`,
        backgroundPosition: background.position,
      }}
    />
  );
}

function getEraBackgroundKey(era) {
  return `${era?.name || "unknown"}-${era?.background?.image || "fallback"}`;
}

const preloadedImages = new Set();
