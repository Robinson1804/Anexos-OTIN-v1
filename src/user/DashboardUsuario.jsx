import { useState } from "react";
import { STATUS_MAP, SERVICES, theme } from "../constants";

function DashboardUsuario({ solicitudes, loading, onNew, onEdit, onView }) {
  const [filter, setFilter] = useState("todos");
  const filtered = filter === "todos" ? solicitudes : solicitudes.filter(s => s.status === filter);
  const counts = { todos: solicitudes.length };
  Object.keys(STATUS_MAP).forEach(k => { counts[k] = solicitudes.filter(s => s.status === k).length; });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Mis Solicitudes</h1>
        <p style={{ color: theme.text2, fontSize: 14 }}>Gestiona tus solicitudes de accesos y servicios informáticos</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[{ key: "todos", label: "Todos" }, ...Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "6px 16px", borderRadius: 20, border: `1px solid ${filter === f.key ? theme.accent : theme.border}`,
            background: filter === f.key ? theme.accent : "#fff", color: filter === f.key ? "#fff" : theme.text2,
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>{f.label} <span style={{ opacity: 0.7 }}>({counts[f.key] || 0})</span></button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: theme.text2 }}>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ color: theme.text, marginBottom: 8 }}>No hay solicitudes</h3>
          <p style={{ color: theme.text2, fontSize: 14, marginBottom: 20 }}>Crea tu primera solicitud unificada de accesos</p>
          <button onClick={onNew} style={{ background: theme.accent, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>+ Nueva Solicitud</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map(sol => (
            <SolicitudCard key={sol.id} sol={sol} onEdit={onEdit} onView={onView} />
          ))}
        </div>
      )}
    </div>
  );
}

function SolicitudCard({ sol, onEdit, onView }) {
  const st = STATUS_MAP[sol.status] || { label: sol.status, color: "#999", bg: "#f5f5f5" };
  return (
    <div onClick={() => onView(sol)} style={{
      background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 10,
      padding: "16px 20px", cursor: "pointer", transition: "box-shadow 0.15s",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{sol.id}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
        </div>
        <div style={{ fontSize: 13, color: theme.text, marginBottom: 4 }}>
          {sol.nombres || "Sin nombre"} — {sol.oficina || "Sin oficina"}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(sol.servicios || []).map(sid => {
            const svc = SERVICES.find(s => s.id === sid);
            return svc ? (
              <span key={sid} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: `${svc.color}18`, color: svc.color, fontWeight: 600 }}>{svc.icon} {svc.label}</span>
            ) : null;
          })}
        </div>
        {sol.adminComentario && (
          <div style={{ marginTop: 6, fontSize: 12, color: theme.orange, fontStyle: "italic" }}>Observación: {sol.adminComentario}</div>
        )}
      </div>
      <div style={{ textAlign: "right", fontSize: 12, color: theme.text2, whiteSpace: "nowrap" }}>{sol.fecha}</div>
    </div>
  );
}

export default DashboardUsuario;
