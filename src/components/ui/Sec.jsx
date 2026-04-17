// ============================================================
// Sec.jsx
// 带标题的分组容器组件
// ============================================================

export function Sec({ title, children }) {
  return (
    <div className="ui-sec">
      <div className="ui-sec__title">{title}</div>
      {children}
    </div>
  );
}
