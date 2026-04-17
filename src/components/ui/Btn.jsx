// ============================================================
// Btn.jsx
// 通用按钮组件
// ============================================================

export function Btn({ active, col, children, onClick, style = {} }) {
  return (
    <button
      className={`ui-btn${active ? " ui-btn--active" : ""}`}
      onClick={onClick}
      style={{
        "--btn-col": col,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
