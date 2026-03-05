import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { SERVICES, STATUS_MAP, theme } from "../constants";

function DetailView({ sol, onBack, onDelete, session }) {
  const fileRef = useRef(null);
  const st = STATUS_MAP[sol.status] || { label: sol.status, color: "#999", bg: "#f5f5f5" };
  const activeServices = SERVICES.filter(s => (sol.servicios || []).includes(s.id));
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    api.get(`/api/historial/${sol.id}`).then(setHistorial).catch(() => {});
  }, [sol.id]);

  const generatePdfContent = () => {
    const d = (svcId) => sol.detalles[svcId] || {};
    let servicesHtml = activeServices.map(svc => {
      const det = d(svc.id);
      let detailRows = "";
      if (svc.id === "c1") {
        const parts = [];
        if (det.tipoOperacion) parts.push(`<b>Tipo operación:</b> ${det.tipoOperacion}`);
        if (det.cuentaRed) { let cta = `Cuenta de red: ${det.tipoCuenta || "Personal"}`; if (det.nombreGenerico) cta += ` (${det.nombreGenerico})`; parts.push(cta); }
        if (det.internet) { const perfLabel = { "1": "Perfil 1 - Avanzado", "2": "Perfil 2 - Intermedio", "3": "Perfil 3 - Básico" }; let inet = `Internet: ${perfLabel[det.perfilInternet] || "—"}`; if (det.perfilInternet === "1" && det.redesSociales) inet += ` (${det.redesSociales})`; parts.push(inet); }
        if (det.correoInst) { let corr = `Correo: ${det.tipoCorreo || "—"}`; if (det.capacidadBuzon) corr += ` — ${det.capacidadBuzon}`; parts.push(corr); }
        detailRows = parts.join("<br>");
      } else if (svc.id === "c4") {
        const parts = [];
        if (det.usuarioRed) parts.push(`Usuario red: ${det.usuarioRed}`);
        if (det.ip) parts.push(`IP: ${det.ip}`);
        if (det.hostName) parts.push(`Host: ${det.hostName}`);
        if (det.correoPersonal) parts.push(`Correo contacto: ${det.correoPersonal}`);
        if (det.telefonoContacto) parts.push(`Tel. contacto: ${det.telefonoContacto}`);
        parts.push(`Inicio: ${det.fechaInicio || "—"} | Término: ${det.fechaFin || "—"}`);
        if (det.justificacion) parts.push(`<i>Justificación:</i> ${det.justificacion}`);
        detailRows = parts.join("<br>");
      } else if (svc.id === "c5") {
        detailRows = `Inicio: ${det.fechaInicio || "—"} | Término: ${det.fechaFin || "—"}`;
        if (det.justificacion) detailRows += `<br><i>Justificación:</i> ${det.justificacion}`;
      } else if (svc.id === "c6") {
        if (det.subTipo === "generacion") detailRows = `<b>Generación FTP</b><br>Jefe: ${det.jefeArea || "—"}<br>Propósito: ${det.proposito || "—"}`;
        else if (det.subTipo === "acceso") detailRows = `<b>Acceso FTP</b><br>Servidor: ${det.servidor || "—"} | Carpeta: ${det.carpeta || "—"} | Permiso: ${det.permisos || "—"}`;
        else detailRows = "—";
      } else if (svc.id === "c7") {
        detailRows = `Tipo: ${det.tipoSolicitud || "—"} | Servidor: ${det.servidor || "—"} | Carpeta: ${det.carpeta || "—"} | Permiso: ${det.permisos || "—"}`;
      } else if (svc.id === "c8") {
        detailRows = `Servidor: ${det.servidor || "—"} | BD: ${det.baseDatos || "—"} | Ambiente: ${det.ambiente || "—"} | Acceso: ${det.tipoAcceso || "—"}`;
        if (det.permisos?.length) detailRows += `<br><b>Permisos:</b> ${det.permisos.join("; ")}`;
      } else if (svc.id === "c9") {
        detailRows = `<b>Sistema:</b> ${det.sistema || "—"}`;
        if (det.usuarios?.length) detailRows += ` (${det.usuarios.length} usuarios)`;
      }
      return `<tr><td style="padding:6px 10px;border:1px solid #ccc;font-weight:600;vertical-align:top;width:25%;">${svc.icon} ${svc.label}</td><td style="padding:6px 10px;border:1px solid #ccc;">${detailRows}</td></tr>`;
    }).join("");

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page{size:A4;margin:18mm 15mm;}body{font-family:Arial,sans-serif;font-size:11px;color:#1e2330;line-height:1.5;}
h1{font-size:14px;text-align:center;margin:0 0 2px;}h2{font-size:11px;background:#1a56db;color:#fff;padding:5px 10px;margin:14px 0 6px;border-radius:3px;}
.subtitle{text-align:center;font-size:10px;color:#666;margin-bottom:14px;}table{width:100%;border-collapse:collapse;margin-bottom:10px;}
td,th{padding:5px 8px;border:1px solid #ccc;font-size:10.5px;}th{background:#e8ecf4;font-weight:700;text-align:left;}
.sig-table td{border:1px solid #999;height:80px;vertical-align:top;padding:8px;width:50%;}
.sig-label{font-size:9px;color:#666;margin-bottom:4px;font-weight:700;text-transform:uppercase;}
.footer{text-align:center;font-size:8px;color:#999;margin-top:20px;border-top:1px solid #ddd;padding-top:6px;}
.id-box{text-align:center;font-size:12px;font-weight:700;color:#1a56db;margin:10px 0;padding:6px;border:2px solid #1a56db;border-radius:4px;}
.compromiso{font-size:9.5px;color:#444;background:#f7f7f7;padding:8px;border-radius:3px;margin:8px 0;}
</style></head><body>
<h1>SOLICITUD UNIFICADA DE ACCESOS Y SERVICIOS INFORMÁTICOS</h1>
<div class="subtitle">INSTITUTO NACIONAL DE ESTADÍSTICA E INFORMÁTICA — OTIN</div>
<div class="id-box">${sol.id} | Fecha: ${sol.fecha}</div>
<h2>A. DATOS GENERALES</h2><table><tr><th>Oficina</th><td>${sol.oficina}</td><th>Sede</th><td>${sol.sede}</td></tr>
<tr><th>Período</th><td>${sol.periodoInicio || "—"} al ${sol.periodoFin || "—"}</td><th>Tipo acceso</th><td>${sol.tipoAcceso}</td></tr></table>
<h2>B. DATOS DEL USUARIO</h2><table>
<tr><th>Nombres</th><td colspan="3">${sol.nombres}</td></tr>
<tr><th>DNI</th><td>${sol.dni}</td><th>Vínculo</th><td>${sol.vinculo}</td></tr>
<tr><th>Cargo</th><td>${sol.cargo}</td><th>Correo</th><td>${sol.correo || "—"}</td></tr>
<tr><th>Teléfono</th><td>${sol.telefono || "—"}</td><th>N° O.S.</th><td>${sol.ordenServicio || "—"}</td></tr></table>
<h2>C. SERVICIOS SOLICITADOS</h2><table><tr><th style="width:25%;">Servicio</th><th>Detalle</th></tr>${servicesHtml}</table>
<div class="compromiso"><strong>Compromiso del usuario:</strong> Reconozco que como usuario de los servicios y recursos informáticos del INEI, tendré acceso a datos e información privilegiada, los cuales debo proteger.</div>
<h2>D. FIRMAS Y APROBACIONES</h2>
<table class="sig-table"><tr>
<td><div class="sig-label">Usuario Beneficiario</div><br><br><br>________________________<br>${sol.nombres}<br>DNI: ${sol.dni}</td>
<td><div class="sig-label">Director / Jefe de Oficina</div><br><br><br>________________________<br>Nombres:<br>Cargo:</td>
</tr></table>
<table class="sig-table"><tr><td colspan="2"><div class="sig-label">USO INTERNO OTIN</div><br>Técnico:________________ Fecha atención:________________<br>Observaciones:____________________________________________</td></tr></table>
<div class="footer">SASI – INEI | ${sol.id} | ${new Date().toLocaleString("es-PE")}</div>
</body></html>`;
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=800,height=1000");
    w.document.write(generatePdfContent());
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const statusSteps = ["borrador", "enviado", "en_revision", "aprobado", "atendido"];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: theme.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0 }}>← Volver al panel</button>

      {/* Header card */}
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: 0 }}>{sol.id}</h2>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
            </div>
            <p style={{ fontSize: 14, color: theme.text, margin: "0 0 4px" }}>{sol.nombres} — {sol.oficina}</p>
            <p style={{ fontSize: 12, color: theme.text2 }}>{sol.fecha} | {sol.sede}</p>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
          {activeServices.map(svc => (
            <span key={svc.id} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: `${svc.color}12`, color: svc.color, border: `1px solid ${svc.color}25` }}>{svc.icon} {svc.label}</span>
          ))}
        </div>
      </div>

      {/* Status flow */}
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Estado de la Solicitud</div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {statusSteps.map((key, i) => {
            const val = STATUS_MAP[key];
            const currentIdx = statusSteps.indexOf(sol.status);
            const isActive = i <= currentIdx;
            const isCurrent = key === sol.status;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: isActive ? val.color : theme.surface2, color: isActive ? "#fff" : theme.text2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, border: isCurrent ? `3px solid ${val.color}` : "3px solid transparent", boxShadow: isCurrent ? `0 0 0 3px ${val.color}30` : "none" }}>{i + 1}</div>
                <div style={{ marginLeft: 6, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isActive ? val.color : theme.text2 }}>{val.label}</div>
                </div>
                {i < statusSteps.length - 1 && <div style={{ width: 20, height: 2, background: isActive && i < currentIdx ? val.color : theme.border, margin: "0 4px" }} />}
              </div>
            );
          })}
        </div>
        {(sol.status === "observado" || sol.status === "rechazado") && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: sol.status === "rechazado" ? "rgba(220,38,38,0.06)" : "rgba(217,119,6,0.06)", border: `1px solid ${sol.status === "rechazado" ? "rgba(220,38,38,0.15)" : "rgba(217,119,6,0.15)"}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: sol.status === "rechazado" ? theme.red : theme.orange, marginBottom: 4 }}>{sol.status === "rechazado" ? "Solicitud Rechazada" : "Solicitud Observada"}</div>
            {sol.adminComentario && <div style={{ fontSize: 13, color: theme.text }}>{sol.adminComentario}</div>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Acciones</div>

        {sol.status === "borrador" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onBack} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Editar</button>
            <button onClick={onDelete} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: theme.red, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Eliminar</button>
          </div>
        )}

        {sol.status === "observado" && (
          <div style={{ fontSize: 13, color: theme.text2 }}>
            <p>Tu solicitud fue observada. Puedes corregirla y re-enviarla desde la edición.</p>
          </div>
        )}

        {(sol.status === "enviado" || sol.status === "en_revision" || sol.status === "aprobado" || sol.status === "atendido") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={handlePrint} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: theme.accent, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", alignSelf: "flex-start" }}>🖨 Imprimir / Guardar PDF</button>
            {sol.status === "atendido" && (
              <div style={{ padding: 14, background: "rgba(5,150,105,0.06)", borderRadius: 8, border: "1px solid rgba(5,150,105,0.15)" }}>
                <p style={{ fontSize: 14, color: theme.green, fontWeight: 600 }}>✅ Solicitud completada y atendida</p>
              </div>
            )}
          </div>
        )}

        {sol.status === "rechazado" && (
          <div style={{ padding: 14, background: "rgba(220,38,38,0.06)", borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: theme.red, fontWeight: 600 }}>Esta solicitud fue rechazada. Puedes crear una nueva si lo necesitas.</p>
          </div>
        )}
      </div>

      {/* Historial */}
      {historial.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Historial de Estados</div>
          {historial.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, paddingBottom: 10, borderBottom: i < historial.length - 1 ? `1px solid ${theme.border}` : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.accent, marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
                  {STATUS_MAP[h.estado_anterior]?.label || h.estado_anterior} → {STATUS_MAP[h.estado_nuevo]?.label || h.estado_nuevo}
                </div>
                {h.comentario && <div style={{ fontSize: 12, color: theme.text2, marginTop: 2 }}>{h.comentario}</div>}
                <div style={{ fontSize: 11, color: theme.text2, marginTop: 2 }}>{new Date(h.created_at).toLocaleString("es-PE")} {h.admin_nombre && `— ${h.admin_nombre}`}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "20px 24px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Resumen</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: 13 }}>
          <div><span style={{ color: theme.text2 }}>DNI: </span><span style={{ fontWeight: 600 }}>{sol.dni}</span></div>
          <div><span style={{ color: theme.text2 }}>Vínculo: </span><span style={{ fontWeight: 600 }}>{sol.vinculo}</span></div>
          <div><span style={{ color: theme.text2 }}>Cargo: </span><span style={{ fontWeight: 600 }}>{sol.cargo}</span></div>
          <div><span style={{ color: theme.text2 }}>Correo: </span><span style={{ fontWeight: 600 }}>{sol.correo || "—"}</span></div>
          <div><span style={{ color: theme.text2 }}>Período: </span><span style={{ fontWeight: 600 }}>{sol.periodoInicio || "—"} al {sol.periodoFin || "—"}</span></div>
          <div><span style={{ color: theme.text2 }}>Tipo: </span><span style={{ fontWeight: 600 }}>{sol.tipoAcceso}</span></div>
        </div>
      </div>
    </div>
  );
}

export default DetailView;
