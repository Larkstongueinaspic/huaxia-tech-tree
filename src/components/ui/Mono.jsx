// ============================================================
// Mono.jsx
// 等宽字体文本块组件
// ============================================================

export function Mono({ children, color = "#6b5d4d" }) {
  return (
    <div className="ui-mono" style={{ "--mono-color": color }}>
      {children}
    </div>
  );
}
