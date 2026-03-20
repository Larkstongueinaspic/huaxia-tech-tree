// ============================================================
// Btn.jsx
// 通用按钮组件
// ============================================================

export function Btn({ active, col, children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        fontSize: 11.5,
        cursor: "pointer",
        background: active ? `rgba(${col},.15)` : "rgba(139,105,20,.06)",
        color: active ? `rgb(${col})` : "#5a4a38",
        border: `1px solid rgba(${col},${active ? 0.5 : 0.2})`,
        borderRadius: 6,
        transition: "all .2s",
        fontFamily: "inherit",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
