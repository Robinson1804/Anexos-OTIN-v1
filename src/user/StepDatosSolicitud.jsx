import { useState } from "react";
import { api } from "../api";
import { FieldGroup, Input, Select } from "../components/FormControls";
import { VINCULOS, SEDES, theme } from "../constants";

function StepDatosSolicitud({ form, update, session }) {
  const [busquedaEstado, setBusquedaEstado] = useState(session ? "encontrado" : null);

  const buscarPorDni = async (dniVal) => {
    const dniLimpio = (dniVal || "").trim();
    if (dniLimpio.length !== 8) return;
    try {
      const emp = await api.get(`/api/empleados/${dniLimpio}`);
      update("dni", emp.dni); update("nombres", emp.nombres); update("cargo", emp.cargo);
      update("correo", emp.correo); update("telefono", emp.telefono); update("vinculo", emp.vinculo);
      update("ordenServicio", emp.ordenServicio); update("oficina", emp.oficina); update("sede", emp.sede);
      if (emp.fechaInicio) { update("fechaInicioContrato", emp.fechaInicio); update("periodoInicio", emp.fechaInicio); }
      if (emp.fechaFin) update("periodoFin", emp.fechaFin);
      // tipoAcceso is always "Temporal" — no override from employee data
      setBusquedaEstado("encontrado");
    } catch { setBusquedaEstado("no_encontrado"); }
  };

  const handleDniChange = (v) => {
    const soloNumeros = v.replace(/\D/g, "").slice(0, 8);
    update("dni", soloNumeros);
    if (busquedaEstado) setBusquedaEstado(null);
    if (soloNumeros.length === 8) buscarPorDni(soloNumeros);
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Datos de la Solicitud</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>Ingresa el DNI para auto-completar o llena manualmente. Completa la información general de la solicitud.</p>

      {/* DNI Search */}
      <div style={{ marginBottom: 16, padding: 16, background: "rgba(108,138,255,0.05)", border: "1px solid rgba(108,138,255,0.2)", borderRadius: 10 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.accent, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Buscar por DNI</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" value={form.dni || ""} onChange={e => handleDniChange(e.target.value)} placeholder="Ingrese los 8 dígitos del DNI" maxLength={8}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `2px solid ${busquedaEstado === "encontrado" ? theme.green : busquedaEstado === "no_encontrado" ? theme.orange : theme.accent}`, fontSize: 16, fontWeight: 600, color: theme.text, background: "#fff", outline: "none", letterSpacing: 2 }} />
          <button onClick={() => buscarPorDni(form.dni)} disabled={(form.dni || "").length !== 8}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: (form.dni || "").length === 8 ? theme.accent : "#ccc", color: "#fff", fontWeight: 700, fontSize: 13, cursor: (form.dni || "").length === 8 ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>Buscar</button>
        </div>
        {busquedaEstado === "encontrado" && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(5,150,105,0.08)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: theme.green, fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 13, color: theme.green, fontWeight: 600 }}>Datos cargados automáticamente.</span>
          </div>
        )}
        {busquedaEstado === "no_encontrado" && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(217,119,6,0.08)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: theme.orange, fontSize: 16 }}>!</span>
            <span style={{ fontSize: 13, color: theme.orange, fontWeight: 600 }}>DNI no encontrado. Ingrese los datos manualmente.</span>
          </div>
        )}
      </div>

      {/* Personal data */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="Nombres y Apellidos *"><Input value={form.nombres} onChange={v => update("nombres", v)} placeholder="Nombres completos" /></FieldGroup>
        <FieldGroup label="DNI *"><Input value={form.dni} onChange={v => handleDniChange(v)} placeholder="00000000" /></FieldGroup>
        <FieldGroup label="Tipo de Vínculo *"><Select value={form.vinculo} onChange={v => update("vinculo", v)} options={VINCULOS} /></FieldGroup>
        <FieldGroup label="Cargo / Función *"><Input value={form.cargo} onChange={v => update("cargo", v)} placeholder="Ej: Analista de Sistemas" /></FieldGroup>
        <FieldGroup label="Correo Electrónico"><Input value={form.correo} onChange={v => update("correo", v)} placeholder="usuario@inei.gob.pe" /></FieldGroup>
        <FieldGroup label="Teléfono / Anexo"><Input value={form.telefono} onChange={v => update("telefono", v)} placeholder="Anexo o teléfono" /></FieldGroup>
        <FieldGroup label="N° Orden de Servicio (si aplica)"><Input value={form.ordenServicio} onChange={v => update("ordenServicio", v)} placeholder="Solo para Locadores/O.S." /></FieldGroup>
      </div>

      {/* General data (from old StepGeneral) */}
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="N° Solicitud"><Input value={form.id} onChange={() => {}} disabled /></FieldGroup>
        <FieldGroup label="Fecha"><Input type="date" value={form.fecha} onChange={v => update("fecha", v)} /></FieldGroup>
        <FieldGroup label="Sede *"><Select value={form.sede} onChange={v => update("sede", v)} options={SEDES} placeholder="Seleccionar sede..." /></FieldGroup>
        <FieldGroup label="Oficina / Dirección *"><Input value={form.oficina} onChange={v => update("oficina", v)} placeholder="Ej: Oficina Técnica de Informática" /></FieldGroup>
      </div>

    </div>
  );
}

export default StepDatosSolicitud;
