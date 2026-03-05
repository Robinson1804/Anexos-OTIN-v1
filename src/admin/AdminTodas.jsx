import { useState } from "react";
import { STATUS_MAP, SERVICES, theme } from "../constants";

function AdminTodas({ solicitudes, onSelect, selectedSol, onAction }) {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [sortBy, setSortBy] = useState("fecha");

  let filtered = solicitudes;
  if (filterStatus !== "todos") filtered = filtered.filter(s => s.status === filterStatus);
  if (searchText) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter(s => s.id.toLowerCase().includes(q) || (s.nombres || "").toLowerCase().includes(q) || (s.dni || "").includes(q) || (s.oficina || "").toLowerCase().includes(q));
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "fecha") return (b.createdAt || 0) - (a.createdAt || 0);
    if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
    if (sortBy === "dni") return (a.dni || "").localeCompare(b.dni || "");
    return 0;
  });

  const exportCSV = () => {
    const headers = ["ID", "DNI", "Nombres", "Oficina", "Sede", "Status", "Fecha"];
    const rows = filtered.map(s => [s.id, s.dni, s.nombres, s.oficina, s.sede, s.status, s.fecha]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "solicitudes.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>Todas las Solicitudes</h2>
        <button onClick={exportCSV} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text2, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>📥 Exportar CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Buscar por ID, DNI, nombre, oficina..."
          style={{ flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.surface2 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.surface2 }}>
          <option value="todos">Todos los estados</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.surface2 }}>
          <option value="fecha">Ordenar por fecha</option>
          <option value="status">Ordenar por estado</option>
          <option value="dni">Ordenar por DNI</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: theme.surface2 }}>
                {["ID", "DNI", "Nombres", "Oficina", "Estado", "Fecha"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: theme.text2, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(sol => {
                const st = STATUS_MAP[sol.status] || { label: sol.status, color: "#999", bg: "#f5f5f5" };
                return (
                  <tr key={sol.id} onClick={() => onSelect(selectedSol?.id === sol.id ? null : sol)} style={{ cursor: "pointer", borderBottom: `1px solid ${theme.border}`, background: selectedSol?.id === sol.id ? "rgba(26,86,219,0.04)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(26,86,219,0.03)"} onMouseLeave={e => e.currentTarget.style.background = selectedSol?.id === sol.id ? "rgba(26,86,219,0.04)" : "transparent"}>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{sol.id}</td>
                    <td style={{ padding: "10px 14px" }}>{sol.dni}</td>
                    <td style={{ padding: "10px 14px" }}>{sol.nombres}</td>
                    <td style={{ padding: "10px 14px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sol.oficina}</td>
                    <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span></td>
                    <td style={{ padding: "10px 14px", color: theme.text2 }}>{sol.fecha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 30, color: theme.text2 }}>No se encontraron solicitudes</div>}
      </div>

      {/* Detail panel */}
      {selectedSol && (
        <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "24px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Detalle: {selectedSol.id}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: 13, marginBottom: 16 }}>
            <div><span style={{ color: theme.text2 }}>DNI:</span> <strong>{selectedSol.dni}</strong></div>
            <div><span style={{ color: theme.text2 }}>Nombres:</span> <strong>{selectedSol.nombres}</strong></div>
            <div><span style={{ color: theme.text2 }}>Oficina:</span> <strong>{selectedSol.oficina}</strong></div>
            <div><span style={{ color: theme.text2 }}>Sede:</span> <strong>{selectedSol.sede}</strong></div>
            <div><span style={{ color: theme.text2 }}>Vínculo:</span> <strong>{selectedSol.vinculo}</strong></div>
            <div><span style={{ color: theme.text2 }}>Período:</span> <strong>{selectedSol.periodoInicio || "—"} al {selectedSol.periodoFin || "—"}</strong></div>
            <div><span style={{ color: theme.text2 }}>Tipo acceso:</span> <strong>{selectedSol.tipoAcceso}</strong></div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {(selectedSol.servicios || []).map(sid => {
              const svc = SERVICES.find(s => s.id === sid);
              return svc ? <span key={sid} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: `${svc.color}18`, color: svc.color, fontWeight: 600 }}>{svc.icon} {svc.label}</span> : null;
            })}
          </div>
          {selectedSol.adminComentario && <div style={{ marginBottom: 12, padding: 10, background: "rgba(217,119,6,0.06)", borderRadius: 6, fontSize: 12, color: theme.orange }}><strong>Último comentario admin:</strong> {selectedSol.adminComentario}</div>}
        </div>
      )}
    </div>
  );
}

export default AdminTodas;
