// ============================================================
// Sec.jsx
// 带标题的分组容器组件
// ============================================================

export function Sec({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid rgba(139,105,20,.12)", paddingTop: 9 }}>
      <div style={{ fontSize: 9.5, color: "#5a4a38", letterSpacing: 2, marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}
