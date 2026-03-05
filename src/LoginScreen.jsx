import { useState } from "react";
import { api } from "./api";
import { theme } from "./constants";
import ineiLogo from "./assets/INEI-LOG.png";

function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState("usuario");
  const [dni, setDni] = useState("");
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsuarioLogin = async () => {
    if (dni.length !== 8) { setError("El DNI debe tener 8 dígitos"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/login/usuario", { dni });
      onLogin(res);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    if (!usuario || !clave) { setError("Complete ambos campos"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/login/admin", { usuario, clave });
      onLogin(res);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={ineiLogo} alt="INEI" style={{ height: 64, marginBottom: 12 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.text, marginBottom: 4 }}>SASI – INEI</h1>
          <p style={{ fontSize: 12, color: theme.text2 }}>Sistema de Accesos y Servicios Informáticos</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: theme.surface2, borderRadius: 10, padding: 4 }}>
          {[{ key: "usuario", label: "Soy Usuario" }, { key: "admin", label: "Soy Administrador" }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(""); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
              background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? theme.accent : theme.text2,
              boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {tab === "usuario" ? (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.text2, marginBottom: 6, textTransform: "uppercase" }}>DNI</label>
            <input value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Ingrese su DNI (8 dígitos)"
              onKeyDown={e => e.key === "Enter" && handleUsuarioLogin()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 16, letterSpacing: 2, fontWeight: 600, outline: "none", background: theme.surface2, boxSizing: "border-box" }} />
            <button onClick={handleUsuarioLogin} disabled={loading} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none", background: theme.accent, color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer", marginTop: 16, opacity: loading ? 0.7 : 1,
            }}>{loading ? "Verificando..." : "Ingresar"}</button>
          </div>
        ) : (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.text2, marginBottom: 6, textTransform: "uppercase" }}>Usuario</label>
            <input value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Usuario administrador"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 14, outline: "none", background: theme.surface2, marginBottom: 12, boxSizing: "border-box" }} />
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.text2, marginBottom: 6, textTransform: "uppercase" }}>Contraseña</label>
            <input type="password" value={clave} onChange={e => setClave(e.target.value)} placeholder="Contraseña"
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 14, outline: "none", background: theme.surface2, boxSizing: "border-box" }} />
            <button onClick={handleAdminLogin} disabled={loading} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none", background: theme.accent, color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer", marginTop: 16, opacity: loading ? 0.7 : 1,
            }}>{loading ? "Verificando..." : "Ingresar"}</button>
          </div>
        )}

        {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(220,38,38,0.08)", borderRadius: 8, fontSize: 13, color: theme.red, fontWeight: 600 }}>{error}</div>}
      </div>
    </div>
  );
}

export default LoginScreen;
