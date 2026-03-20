// ============================================================
// Mono.jsx
// 等宽字体文本块组件
// ============================================================

export function Mono({ children, color = "#6b5d4d" }) {
  return (
    <div style={{ fontFamily: '"JetBrains Mono"', fontSize: 10, color, lineHeight: 2, whiteSpace: "pre" }}>
      {children}
    </div>
  );
}
