export default function AuthScreen({
  email,
  password,
  mode,
  loading,
  error,
  notice,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  onPasswordReset,
  appStyle,
  cardStyle,
  inputStyle,
  submitStyle,
}) {
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
      <form onSubmit={onSubmit} style={{ ...cardStyle, width: "100%", textAlign: "right" }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "var(--text-heading)",
            marginBottom: 12,
          }}
        >
          تسجيل الدخول
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginBottom: 12,
            lineHeight: 1.7,
          }}
        >
          يرجى تسجيل الدخول أو إنشاء حساب للبدء
        </div>

        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="البريد الإلكتروني"
          required
          style={{ ...inputStyle, marginBottom: 10 }}
        />
        <input
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="كلمة المرور"
          required
          minLength={6}
          style={{ ...inputStyle, marginBottom: 12 }}
        />

        {error && <div style={{ color: "#D95555", fontSize: 12, marginBottom: 10 }}>{error}</div>}
        {notice && <div style={{ color: "#2A9E60", fontSize: 12, marginBottom: 10 }}>{notice}</div>}

        <button type="submit" disabled={loading} style={submitStyle}>
          {loading ? "جاري الدخول" : mode === "signup" ? "إنشاء حساب" : "دخول"}
        </button>
        <button
          type="button"
          onClick={onToggleMode}
          style={{
            marginTop: 10,
            width: "100%",
            border: "none",
            background: "transparent",
            color: "var(--gold-dark)",
            fontFamily: "inherit",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {mode === "signup" ? "لدي حساب" : "إنشاء حساب جديد"}
        </button>
        <button
          type="button"
          onClick={onPasswordReset}
          disabled={loading}
          style={{
            marginTop: 8,
            width: "100%",
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            fontFamily: "inherit",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          استعادة كلمة المرور
        </button>
      </form>
    </div>
  );
}
