export default function StatusTag({ label, color }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 99,
        background: `${color}22`,
        color,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}
