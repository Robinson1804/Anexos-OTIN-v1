import { useState } from "react";
import { SERVICES, STATUS_MAP, theme } from "../constants";

function AdminCola({ solicitudes, onAction, onSelect, selectedSol }) {
  const [comentario, setComentario] = useState("");
  const [modalAction, setModalAction] = useState(null); // "observar" | "rechazar"
  const [modalSolId, setModalSolId] = useState(null);

  const openModal = (action, solId) => { setModalAction(action); setModalSolId(solId); setComentario(""); };
  const closeModal = () => { setModalAction(null); setModalSolId(null); setComentario(""); };

  const confirmAction = () => {
    if (!comentario.trim()) { alert("El comentario es obligatorio"); return; }
    const newStatus = modalAction === "observar" ? "observado" : "rechazado";
    onAction(modalSolId, newStatus, comentario);
    closeModal();
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, marginBottom: 16 }}>Cola de Aprobación</h2>
      {solicitudes.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, color: theme.text2 }}>No hay solicitudes pendientes de revisión</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {solicitudes.map(sol => (
            <div key={sol.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{sol.id}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: STATUS_MAP[sol.status]?.bg, color: STATUS_MAP[sol.status]?.color }}>{STATUS_MAP[sol.status]?.label}</span>
                  </div>
                  <div style={{ fontSize: 14, color: theme.text }}>{sol.nombres} — {sol.oficina}</div>
                  <div style={{ fontSize: 12, color: theme.text2, marginTop: 2 }}>{sol.fecha} | {sol.sede}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {(sol.servicios || []).map(sid => {
                      const svc = SERVICES.find(s => s.id === sid);
                      return svc ? <span key={sid} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: `${svc.color}18`, color: svc.color, fontWeight: 600 }}>{svc.icon} {svc.label}</span> : null;
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { onAction(sol.id, "atendido", null); }} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #059669, #34d399)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✓ Aprobar y Atender</button>
                <button onClick={() => openModal("observar", sol.id)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${theme.orange}`, background: "#fff", color: theme.orange, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Observar</button>
                <button onClick={() => openModal("rechazar", sol.id)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${theme.red}`, background: "#fff", color: theme.red, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "32px", width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: modalAction === "rechazar" ? theme.red : theme.orange, marginBottom: 16 }}>
              {modalAction === "rechazar" ? "Rechazar Solicitud" : "Observar Solicitud"}
            </h3>
            <p style={{ fontSize: 13, color: theme.text2, marginBottom: 12 }}>Ingrese un comentario obligatorio para el usuario:</p>
            <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={4} placeholder="Escriba el motivo..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text2, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={confirmAction} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: modalAction === "rechazar" ? theme.red : theme.orange, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {modalAction === "rechazar" ? "Rechazar" : "Observar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCola;
