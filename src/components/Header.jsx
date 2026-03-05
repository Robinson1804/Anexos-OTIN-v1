import { theme } from "../constants";
import ineiLogo from "../assets/INEI-LOG.png";

export default function Header({ session, onLogout, onHome, rightContent }) {
  return (
    <div style={{
      background: "#fff", borderBottom: `1px solid ${theme.border}`, padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={onHome}>
        <img src={ineiLogo} alt="INEI" style={{ height: 36 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: theme.text, lineHeight: 1.2 }}>SASI – INEI</div>
          <div style={{ fontSize: 10, color: theme.text2, letterSpacing: 0.5 }}>Sistema de Accesos y Servicios Informáticos</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {rightContent}
        <div style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{session.datos.nombres || session.datos.nombre}</div>
        <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, background: session.rol === "admin" ? "rgba(220,38,38,0.1)" : "rgba(26,86,219,0.1)", color: session.rol === "admin" ? theme.red : theme.accent, fontWeight: 700 }}>
          {session.rol === "admin" ? "ADMIN" : "USUARIO"}
        </span>
        <button onClick={onLogout} style={{ background: "none", border: `1px solid ${theme.border}`, padding: "6px 14px", borderRadius: 8, fontSize: 12, color: theme.text2, cursor: "pointer", fontWeight: 600 }}>Cerrar sesión</button>
      </div>
    </div>
  );
}
