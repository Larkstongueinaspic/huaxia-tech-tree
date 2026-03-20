// ============================================================
// StateScreen.jsx
// 加载与错误状态屏幕
// ============================================================

export function LoadingScreen() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f5f0e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: '"ZCOOL XiaoWei",serif',
          fontSize: 24,
          color: "#8b6914",
          letterSpacing: 4,
        }}
      >
        华夏科技树
      </div>
      <div style={{ fontSize: 12, color: "rgba(139,105,20,.5)" }}>加载数据中...</div>
    </div>
  );
}

export function ErrorScreen({ error }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f5f0e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: '"ZCOOL XiaoWei",serif',
          fontSize: 24,
          color: "#c0392b",
          letterSpacing: 4,
        }}
      >
        加载失败
      </div>
      <div style={{ fontSize: 12, color: "rgba(44,36,22,.5)" }}>{error}</div>
      <div
        style={{
          fontSize: 11,
          color: "rgba(139,105,20,.6)",
          marginTop: 8,
        }}
      >
        请确保后端服务器已启动: cd server && node index.js
      </div>
    </div>
  );
}
