import { useState, useRef } from "react";
import { SERVICES, theme } from "../constants";
import { ReviewBlock } from "../components/FormControls";

function StepDocumento({ form, onSave, onGenerate }) {
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfHtml, setPdfHtml] = useState("");
  const [archivoFirmado, setArchivoFirmado] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef(null);

  const activeServices = SERVICES.filter(s => form.servicios.includes(s.id));

  const renderServiceDetail = (svc) => {
    const det = form.detalles[svc.id] || {};
    switch (svc.id) {
      case "c1": {
        const items = [];
        if (det.tipoOperacion) items.push(["Tipo operación", det.tipoOperacion]);
        if (det.cuentaRed) items.push(["Cuenta de red", `${det.tipoCuenta || "Personal"}${det.nombreGenerico ? ` (${det.nombreGenerico})` : ""}`]);
        if (det.internet) {
          const perfLabel = { "1": "Perfil 1 - Avanzado", "2": "Perfil 2 - Intermedio", "3": "Perfil 3 - Básico" };
          let inet = perfLabel[det.perfilInternet] || "—";
          if (det.perfilInternet === "1" && det.redesSociales) inet += ` (${det.redesSociales})`;
          items.push(["Internet", inet]);
        }
        if (det.correoInst) { let corr = det.tipoCorreo || "—"; if (det.capacidadBuzon) corr += ` — ${det.capacidadBuzon}`; items.push(["Correo", corr]); }
        return items;
      }
      case "c4": {
        const items = [];
        if (det.usuarioRed) items.push(["Usuario de red", det.usuarioRed]);
        if (det.ip) items.push(["IP", det.ip]);
        if (det.hostName) items.push(["Host/Equipo", det.hostName]);
        if (det.correoPersonal) items.push(["Correo contacto", det.correoPersonal]);
        if (det.telefonoContacto) items.push(["Teléfono contacto", det.telefonoContacto]);
        items.push(["Fecha inicio", det.fechaInicio || "—"], ["Fecha término", det.fechaFin || "—"]);
        if (det.justificacion) items.push(["Justificación", det.justificacion]);
        return items;
      }
      case "c5": return [["Fecha inicio", det.fechaInicio || "—"], ["Fecha término", det.fechaFin || "—"], ...(det.justificacion ? [["Justificación", det.justificacion]] : [])];
      case "c6": {
        const items = [["Sub-tipo", det.subTipo === "generacion" ? "Generación" : det.subTipo === "acceso" ? "Acceso FTP" : "—"]];
        if (det.subTipo === "generacion") { items.push(["Jefe", det.jefeArea || "—"]); if (det.usuarios?.length) items.push(["Usuarios", `${det.usuarios.length}`]); }
        if (det.subTipo === "acceso") { items.push(["Servidor", det.servidor || "—"], ["Carpeta", det.carpeta || "—"], ["Permiso", det.permisos || "—"]); }
        return items;
      }
      case "c7": return [["Tipo", det.tipoSolicitud || "—"], ["Servidor", det.servidor || "—"], ["Carpeta", det.carpeta || "—"], ["Permiso", det.permisos || "—"]];
      case "c8": {
        const items = [["Servidor", det.servidor || "—"], ["BD", det.baseDatos || "—"], ["Ambiente", det.ambiente || "—"], ["Acceso", det.tipoAcceso || "—"]];
        if (det.permisos?.length) items.push(["Permisos", det.permisos.join("; ")]);
        return items;
      }
      case "c9": { const items = [["Sistema", det.sistema || "—"]]; if (det.usuarios?.length) items.push(["Usuarios", `${det.usuarios.length}`]); return items; }
      default: return [];
    }
  };

  const generatePdfContent = () => {
    const d = (svcId) => form.detalles[svcId] || {};
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
<div class="id-box">${form.id} | Fecha: ${form.fecha}</div>
<h2>A. DATOS GENERALES</h2><table><tr><th>Oficina</th><td>${form.oficina}</td><th>Sede</th><td>${form.sede}</td></tr>
<tr><th>Período</th><td>${form.periodoInicio || "—"} al ${form.periodoFin || "—"}</td><th>Tipo acceso</th><td>${form.tipoAcceso}</td></tr></table>
<h2>B. DATOS DEL USUARIO</h2><table>
<tr><th>Nombres</th><td colspan="3">${form.nombres}</td></tr>
<tr><th>DNI</th><td>${form.dni}</td><th>Vínculo</th><td>${form.vinculo}</td></tr>
<tr><th>Cargo</th><td>${form.cargo}</td><th>Correo</th><td>${form.correo || "—"}</td></tr>
<tr><th>Teléfono</th><td>${form.telefono || "—"}</td><th>N° O.S.</th><td>${form.ordenServicio || "—"}</td></tr></table>
<h2>C. SERVICIOS SOLICITADOS</h2><table><tr><th style="width:25%;">Servicio</th><th>Detalle</th></tr>${servicesHtml}</table>
<div class="compromiso"><strong>Compromiso del usuario:</strong> Reconozco que como usuario de los servicios y recursos informáticos del INEI, tendré acceso a datos e información privilegiada, los cuales debo proteger.</div>
<h2>D. FIRMAS Y APROBACIONES</h2>
<table class="sig-table"><tr>
<td><div class="sig-label">Usuario Beneficiario</div><br><br><br>________________________<br>${form.nombres}<br>DNI: ${form.dni}</td>
<td><div class="sig-label">Director / Jefe de Oficina</div><br><br><br>________________________<br>Nombres:<br>Cargo:</td>
</tr></table>
<table class="sig-table"><tr><td colspan="2"><div class="sig-label">USO INTERNO OTIN</div><br>Técnico:________________ Fecha atención:________________<br>Observaciones:____________________________________________</td></tr></table>
<div class="footer">SASI – INEI | ${form.id} | ${new Date().toLocaleString("es-PE")}</div>
</body></html>`;
  };

  const handleGenerateDoc = async () => {
    const html = generatePdfContent();
    setPdfHtml(html);
    // Save as draft
    try { await onSave(form); } catch { /* ignore */ }
    setPdfGenerated(true);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=800,height=1000");
    w.document.write(pdfHtml);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setArchivoFirmado(file);
  };

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      await onGenerate({ ...form, archivoFirmadoNombre: archivoFirmado.name });
    } catch (e) { alert("Error al enviar: " + e.message); }
    setEnviando(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Documento de Solicitud</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>Genera el documento, imprímelo, fírmalo y súbelo escaneado para enviar.</p>

      {/* Step 1: Summary + Generate */}
      {!pdfGenerated && (
        <div>
          <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
            <ReviewBlock title="Datos de la Solicitud" items={[["N° Solicitud", form.id], ["Fecha", form.fecha], ["Oficina", form.oficina], ["Sede", form.sede], ["Período", `${form.periodoInicio || "—"} al ${form.periodoFin || "—"}`], ["Tipo acceso", form.tipoAcceso]]} />
            <ReviewBlock title="Datos del Usuario" items={[["Nombre", form.nombres], ["DNI", form.dni], ["Vínculo", form.vinculo], ["Cargo", form.cargo], ["Correo", form.correo || "—"], ["Teléfono", form.telefono || "—"]]} />
            {activeServices.map(svc => {
              const items = renderServiceDetail(svc);
              return items.length > 0 ? <ReviewBlock key={svc.id} title={`${svc.icon} ${svc.label}`} items={items} /> : null;
            })}
          </div>
          <button onClick={handleGenerateDoc} style={{
            padding: "12px 28px", borderRadius: 8, border: "none",
            background: theme.accent, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>📄 Generar Documento</button>
        </div>
      )}

      {/* Step 2: Preview + Print/Download */}
      {pdfGenerated && (
        <div>
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(5,150,105,0.06)", borderRadius: 8, border: "1px solid rgba(5,150,105,0.15)" }}>
            <span style={{ fontSize: 13, color: theme.green, fontWeight: 600 }}>✓ Documento generado correctamente</span>
          </div>

          {/* iframe preview */}
          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 16, height: 400 }}>
            <iframe srcDoc={pdfHtml} title="Vista previa" style={{ width: "100%", height: "100%", border: "none" }} />
          </div>

          <button onClick={handlePrint} style={{
            padding: "10px 24px", borderRadius: 8, border: "none",
            background: theme.accent, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 20,
          }}>🖨 Imprimir / Descargar PDF</button>

          {/* Step 3: Upload signed document */}
          <div style={{ padding: 20, background: theme.surface2, borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Subir documento firmado</div>
            <p style={{ fontSize: 12, color: theme.text2, marginBottom: 12 }}>Imprime el documento, fírmalo, escanéalo y sube el archivo (PDF o imagen).</p>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current?.click()} style={{
              padding: "8px 18px", borderRadius: 8, border: `1px dashed ${theme.border}`,
              background: "#fff", color: theme.accent, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>📎 Seleccionar archivo</button>
            {archivoFirmado && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>📄 {archivoFirmado.name}</span>
                <span style={{ fontSize: 11, color: theme.text2 }}>({(archivoFirmado.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Step 4: Send */}
          {archivoFirmado && (
            <button onClick={handleEnviar} disabled={enviando} style={{
              padding: "12px 32px", borderRadius: 8, border: "none",
              background: enviando ? "#ccc" : "linear-gradient(135deg, #059669, #34d399)", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: enviando ? "wait" : "pointer",
            }}>{enviando ? "Enviando..." : "📨 Enviar Solicitud"}</button>
          )}
        </div>
      )}
    </div>
  );
}

export default StepDocumento;
