import { SERVICES, theme } from "../constants";

function StepServicios({ form, setForm, perfilTi }) {
  const toggle = (id) => {
    setForm(f => ({ ...f, servicios: f.servicios.includes(id) ? f.servicios.filter(s => s !== id) : [...f.servicios, id] }));
  };

  const availableServices = SERVICES;

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Servicios Solicitados</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>
        Marca todos los servicios que necesitas. Puedes seleccionar varios.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {availableServices.map(svc => {
          const active = form.servicios.includes(svc.id);
          return (
            <div key={svc.id} onClick={() => toggle(svc.id)} style={{
              border: `2px solid ${active ? svc.color : theme.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer",
              background: active ? `${svc.color}0c` : "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${active ? svc.color : theme.border}`, background: active ? svc.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{active ? "✓" : ""}</div>
                <span style={{ fontSize: 20 }}>{svc.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? svc.color : theme.text }}>{svc.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      {form.servicios.length > 0 && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(108,138,255,0.06)", borderRadius: 8, fontSize: 13, color: theme.accent }}>
          ✓ {form.servicios.length} servicio(s) seleccionado(s).
        </div>
      )}
    </div>
  );
}

export default StepServicios;
