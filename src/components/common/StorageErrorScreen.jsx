export default function StorageErrorScreen({ message, appStyle, cardStyle }) {
  return (
    <div
      style={{
        ...appStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
      }}
    >
      <div
        style={{
          ...cardStyle,
          width: "100%",
          textAlign: "right",
          border: "1.5px solid var(--red-border)",
          background: "var(--red-bg)",
          color: "var(--text-body)",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 800, color: "#D95555", marginBottom: 8 }}>
          خطأ في الاتصال بقاعدة البيانات
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>{message}</div>
      </div>
    </div>
  );
}
