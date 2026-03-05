import { useState } from "react";
import { api } from "../api";
import { VINCULOS, SEDES, theme, SERVICES } from "../constants";
import { FieldGroup, Input, Select } from "../components/FormControls";

function AdminEmpleados({ empleados, onReload }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({});
  const [perfilTi, setPerfilTi] = useState(null);
  const [viewingDni, setViewingDni] = useState(null);

  const filtered = search
    ? empleados.filter(e => e.nombres.toLowerCase().includes(search.toLowerCase()) || e.dni.includes(search) || (e.oficina || "").toLowerCase().includes(search.toLowerCase()))
    : empleados;

  const handleSave = async () => {
    try {
      if (adding) {
        await api.post("/api/empleados", form);
      } else {
        await api.put(`/api/empleados/${editing}`, form);
      }
      setEditing(null); setAdding(false); setForm({});
      onReload();
    } catch (e) { alert("Error: " + e.message); }
  };

  const viewPerfil = async (dni) => {
    try {
      const p = await api.get(`/api/perfil-ti/${dni}`);
      setPerfilTi(p);
      setViewingDni(dni);
    } catch { setPerfilTi([]); setViewingDni(dni); }
  };

  const startEdit = (emp) => {
    setEditing(emp.dni);
    setAdding(false);
    setForm({ ...emp });
  };

  const startAdd = () => {
    setAdding(true); setEditing(null);
    setForm({ dni: "", nombres: "", cargo: "", correo: "", telefono: "", vinculo: "", oficina: "", sede: "", ordenServicio: "", fechaInicio: "", fechaFin: "", tipoAcceso: "temporal", activo: true });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>Gestión de Empleados</h2>
        <button onClick={startAdd} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: theme.accent, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>+ Agregar Empleado</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, DNI u oficina..."
        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.surface2, marginBottom: 16, boxSizing: "border-box" }} />

      {/* Employee Form */}
      {(editing || adding) && (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.accent}40`, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.accent, marginBottom: 16 }}>{adding ? "Nuevo Empleado" : "Editar Empleado"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="DNI"><Input value={form.dni} onChange={v => setForm(f => ({ ...f, dni: v }))} disabled={!!editing} /></FieldGroup>
            <FieldGroup label="Nombres"><Input value={form.nombres} onChange={v => setForm(f => ({ ...f, nombres: v }))} /></FieldGroup>
            <FieldGroup label="Cargo"><Input value={form.cargo} onChange={v => setForm(f => ({ ...f, cargo: v }))} /></FieldGroup>
            <FieldGroup label="Correo"><Input value={form.correo} onChange={v => setForm(f => ({ ...f, correo: v }))} /></FieldGroup>
            <FieldGroup label="Teléfono"><Input value={form.telefono} onChange={v => setForm(f => ({ ...f, telefono: v }))} /></FieldGroup>
            <FieldGroup label="Vínculo"><Select value={form.vinculo} onChange={v => setForm(f => ({ ...f, vinculo: v }))} options={VINCULOS} /></FieldGroup>
            <FieldGroup label="Oficina"><Input value={form.oficina} onChange={v => setForm(f => ({ ...f, oficina: v }))} /></FieldGroup>
            <FieldGroup label="Sede"><Select value={form.sede} onChange={v => setForm(f => ({ ...f, sede: v }))} options={SEDES} /></FieldGroup>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleSave} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: theme.accent, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Guardar</button>
            <button onClick={() => { setEditing(null); setAdding(false); }} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text2, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Employees table */}
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: theme.surface2 }}>
                {["DNI", "Nombres", "Cargo", "Oficina", "Vínculo", "Activo", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: theme.text2, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.dni} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{emp.dni}</td>
                  <td style={{ padding: "10px 14px" }}>{emp.nombres}</td>
                  <td style={{ padding: "10px 14px" }}>{emp.cargo}</td>
                  <td style={{ padding: "10px 14px", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.oficina}</td>
                  <td style={{ padding: "10px 14px" }}>{emp.vinculo}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: emp.activo !== false ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)", color: emp.activo !== false ? theme.green : theme.red }}>
                      {emp.activo !== false ? "Sí" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => startEdit(emp)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${theme.accent}`, background: "#fff", color: theme.accent, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Editar</button>
                      <button onClick={() => viewPerfil(emp.dni)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${theme.green}`, background: "#fff", color: theme.green, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Perfil TI</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Perfil TI Modal */}
      {viewingDni && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 540, maxHeight: "80vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>Perfil TI — {viewingDni}</h3>
              <button onClick={() => { setViewingDni(null); setPerfilTi(null); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: theme.text2 }}>✕</button>
            </div>
            {perfilTi?.length === 0 ? (
              <p style={{ color: theme.text2, fontSize: 13 }}>Sin servicios activos</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(perfilTi || []).map(item => {
                  const svc = SERVICES.find(s => s.id === item.servicioId);
                  return (
                    <div key={item.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${theme.border}`, borderLeft: `4px solid ${svc?.color || "#999"}` }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{svc?.icon} {svc?.label || item.servicioId}</div>
                      <div style={{ fontSize: 12, color: theme.text2, marginTop: 4 }}>Otorgado: {item.fechaOtorgado || "—"}</div>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600, background: item.vigencia ? "rgba(217,119,6,0.1)" : "rgba(5,150,105,0.1)", color: item.vigencia ? theme.orange : theme.green }}>
                        {item.vigencia ? `Vence: ${item.vigencia}` : "Permanente"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEmpleados;
