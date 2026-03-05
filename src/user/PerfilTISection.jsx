import { SERVICES, theme } from "../constants";

function PerfilTISection({ perfilTi, onActualizar, onBaja }) {
  if (!perfilTi || perfilTi.length === 0) return (
    <div style={{ marginBottom: 28, padding: "20px 24px", background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}` }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Mi Perfil TI</h2>
      <p style={{ fontSize: 13, color: theme.text2 }}>No tienes servicios activos. Crea una solicitud para obtener accesos.</p>
    </div>
  );

  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Mi Perfil TI — Servicios Activos</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {perfilTi.map(item => {
          const svc = SERVICES.find(s => s.id === item.servicioId);
          if (!svc) return null;
          const isTemp = item.vigencia;
          return (
            <div key={item.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "16px 20px", borderLeft: `4px solid ${svc.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{svc.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{svc.label}</span>
              </div>
              <div style={{ fontSize: 12, color: theme.text2, marginBottom: 4 }}>Otorgado: {item.fechaOtorgado || "—"}</div>
              <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 12, fontWeight: 700, background: isTemp ? "rgba(217,119,6,0.1)" : "rgba(5,150,105,0.1)", color: isTemp ? theme.orange : theme.green }}>
                {isTemp ? `Vence: ${item.vigencia}` : "Permanente"}
              </span>
              {/* Config summary */}
              {item.config && Object.keys(item.config).length > 0 && (
                <div style={{ marginTop: 8, padding: 8, background: theme.surface2, borderRadius: 6, fontSize: 11, color: theme.text2 }}>
                  {Object.entries(item.config).slice(0, 3).map(([k, v]) => (
                    <div key={k}><strong>{k}:</strong> {typeof v === "object" ? JSON.stringify(v) : String(v)}</div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={() => onActualizar(item.servicioId)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${theme.accent}`, background: "#fff", color: theme.accent, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Actualizar</button>
                <button onClick={() => onBaja(item.servicioId)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${theme.red}`, background: "#fff", color: theme.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Dar de baja</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PerfilTISection;
