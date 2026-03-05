import { useState } from "react";
import { theme, SERVICES } from "../constants";
import { FieldGroup, Input, TextArea, Select, Checkbox, RadioGroup, SectionBox, InfoTooltip, InfoBox } from "../components/FormControls";

const tblInput = { width: "100%", padding: "4px 6px", borderRadius: 4, border: `1px solid ${theme.border}`, fontSize: 12, color: theme.text, background: "#fff", outline: "none", boxSizing: "border-box" };

function StepDetalle({ form, setForm, updateDetail }) {
  const activeServices = SERVICES.filter(s => form.servicios.includes(s.id));
  const [openTab, setOpenTab] = useState(activeServices[0]?.id || "");

  if (activeServices.length === 0) return <p style={{ color: theme.text2 }}>No has seleccionado servicios.</p>;

  const d = (svcId) => form.detalles[svcId] || {};
  const updateDetailObj = (svcId, obj) => {
    setForm(f => ({ ...f, detalles: { ...f.detalles, [svcId]: { ...(f.detalles[svcId] || {}), ...obj } } }));
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Detalle Técnico por Servicio</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 16 }}>Completa la información específica de cada servicio seleccionado</p>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {activeServices.map(svc => (
          <button key={svc.id} onClick={() => setOpenTab(svc.id)} style={{
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${openTab === svc.id ? svc.color : theme.border}`,
            background: openTab === svc.id ? `${svc.color}14` : "#fff", color: openTab === svc.id ? svc.color : theme.text2,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>{svc.icon} {svc.label}</button>
        ))}
      </div>

      {openTab === "c1" && <DetalleC1 data={d("c1")} updateDetail={updateDetail} updateDetailObj={updateDetailObj} />}
      {openTab === "c4" && <DetalleC4 data={d("c4")} updateDetail={updateDetail} form={form} />}
      {openTab === "c5" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="Fecha de Inicio"><Input type="date" value={d("c5").fechaInicio} onChange={v => updateDetail("c5", "fechaInicio", v)} /></FieldGroup>
            <FieldGroup label="Fecha de Término"><Input type="date" value={d("c5").fechaFin} onChange={v => updateDetail("c5", "fechaFin", v)} /></FieldGroup>
          </div>
          <FieldGroup label="Justificación del desbloqueo USB"><TextArea value={d("c5").justificacion} onChange={v => updateDetail("c5", "justificacion", v)} placeholder="Indique el motivo..." /></FieldGroup>
        </div>
      )}
      {openTab === "c6" && <DetalleC6 data={d("c6")} updateDetail={updateDetail} updateDetailObj={updateDetailObj} form={form} setForm={setForm} />}
      {openTab === "c7" && (
        <div>
          <FieldGroup label="Tipo de Solicitud"><Select value={d("c7").tipoSolicitud} onChange={v => updateDetail("c7", "tipoSolicitud", v)} options={["Acceso", "Modificación", "Quitar permisos"]} /></FieldGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="Servidor"><Input value={d("c7").servidor} onChange={v => updateDetail("c7", "servidor", v)} placeholder="Ej: \\SAN01" /></FieldGroup>
            <FieldGroup label="Carpeta Compartida"><Input value={d("c7").carpeta} onChange={v => updateDetail("c7", "carpeta", v)} placeholder="Ej: \\SAN01\\FICHAS" /></FieldGroup>
          </div>
          <FieldGroup label={<span>Nivel de Permiso <InfoTooltip text="Lectura: solo ver/copiar archivos. Escritura: ver, copiar, crear, editar archivos. Control Total: todos los permisos incluyendo eliminar y cambiar permisos de subcarpetas." /></span>}>
            <Select value={d("c7").permisos} onChange={v => updateDetail("c7", "permisos", v)} options={["Lectura", "Escritura", "Control Total"]} />
          </FieldGroup>
          {d("c7").permisos && (
            <div style={{ padding: "8px 14px", background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.15)", borderRadius: 8, marginBottom: 12, fontSize: 12, color: theme.text2, lineHeight: 1.5 }}>
              {d("c7").permisos === "Lectura" && <><strong style={{ color: theme.text }}>Lectura:</strong> Permite ver y copiar archivos de la carpeta compartida. No permite crear, modificar ni eliminar archivos.</>}
              {d("c7").permisos === "Escritura" && <><strong style={{ color: theme.text }}>Escritura:</strong> Permite ver, copiar, crear y editar archivos en la carpeta. No permite eliminar archivos ni modificar permisos.</>}
              {d("c7").permisos === "Control Total" && <><strong style={{ color: theme.text }}>Control Total:</strong> Todos los permisos: leer, crear, editar, eliminar archivos y gestionar permisos de subcarpetas. Úsese con precaución.</>}
            </div>
          )}
          <FieldGroup label="Justificación"><TextArea value={d("c7").justificacion} onChange={v => updateDetail("c7", "justificacion", v)} placeholder="Justifique..." /></FieldGroup>
        </div>
      )}
      {openTab === "c8" && <DetalleC8 data={d("c8")} updateDetail={updateDetail} />}
      {openTab === "c9" && <DetalleC9 data={d("c9")} updateDetail={updateDetail} updateDetailObj={updateDetailObj} form={form} setForm={setForm} />}
    </div>
  );
}

// ---- C1: Cuenta de Red + Internet + Correo ----
function DetalleC1({ data, updateDetail }) {
  const det = data || {};
  return (
    <div>
      <FieldGroup label="Tipo de operación para este servicio">
        <Select value={det.tipoOperacion} onChange={v => updateDetail("c1", "tipoOperacion", v)} options={["Creación", "Actualización", "Baja", "Desactivación"]} />
      </FieldGroup>
      <SectionBox title="🖧 Cuenta de usuario de red" color="#6c8aff">
        <Checkbox checked={det.cuentaRed} onChange={v => updateDetail("c1", "cuentaRed", v)} label="Solicitar cuenta de usuario de red" />
        {det.cuentaRed && (
          <div style={{ marginTop: 8 }}>
            <FieldGroup label="Tipo de cuenta"><Select value={det.tipoCuenta} onChange={v => updateDetail("c1", "tipoCuenta", v)} options={["Personal", "Genérica"]} /></FieldGroup>
            {det.tipoCuenta === "Genérica" && <FieldGroup label="Nombre de la cuenta genérica"><Input value={det.nombreGenerico} onChange={v => updateDetail("c1", "nombreGenerico", v)} placeholder="Ej: recepcion_otin" /></FieldGroup>}
          </div>
        )}
      </SectionBox>
      <SectionBox title="🌐 Internet" color="#34d399">
        <Checkbox checked={det.internet} onChange={v => updateDetail("c1", "internet", v)} label="Solicitar acceso a Internet" />
        {det.internet && (
          <div style={{ marginTop: 8 }}>
            <FieldGroup label={<span>Perfil de Internet <InfoTooltip text="Los perfiles determinan el nivel de acceso a Internet. Seleccione el perfil acorde a las necesidades de su función." /></span>}>
              <Select value={det.perfilInternet} onChange={v => updateDetail("c1", "perfilInternet", v)} options={[{ value: "1", label: "Perfil 1 - Avanzado" }, { value: "2", label: "Perfil 2 - Intermedio" }, { value: "3", label: "Perfil 3 - Básico" }]} />
            </FieldGroup>
            {det.perfilInternet && (
              <div style={{ padding: "10px 14px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 8, marginBottom: 12, fontSize: 12, color: theme.text2, lineHeight: 1.6 }}>
                {det.perfilInternet === "1" && <><strong style={{ color: theme.text }}>Perfil 1 — Avanzado:</strong> Incluye todo lo del Perfil Intermedio + acceso a redes sociales (Facebook, X, LinkedIn), plataformas de streaming y sitios multimedia.</>}
                {det.perfilInternet === "2" && <><strong style={{ color: theme.text }}>Perfil 2 — Intermedio:</strong> Incluye todo lo del Perfil Básico + correo web (Gmail, Outlook), navegación general en internet. No incluye streaming ni redes sociales.</>}
                {det.perfilInternet === "3" && <><strong style={{ color: theme.text }}>Perfil 3 — Básico:</strong> Acceso limitado a sitios institucionales (gobierno, educación), noticias y motores de búsqueda.</>}
              </div>
            )}
            {det.perfilInternet === "1" && <FieldGroup label="Redes Sociales"><RadioGroup value={det.redesSociales} onChange={v => updateDetail("c1", "redesSociales", v)} options={["Con redes sociales", "Sin redes sociales"]} name="redesSociales" /></FieldGroup>}
            <FieldGroup label="Justificación del acceso a Internet"><TextArea value={det.justificacionInternet} onChange={v => updateDetail("c1", "justificacionInternet", v)} placeholder="Describa por qué necesita acceso a Internet..." /></FieldGroup>
          </div>
        )}
      </SectionBox>
      <SectionBox title="✉ Correo Institucional" color="#a78bfa">
        <Checkbox checked={det.correoInst} onChange={v => updateDetail("c1", "correoInst", v)} label="Solicitar correo institucional" />
        {det.correoInst && (
          <div style={{ marginTop: 8 }}>
            <FieldGroup label="Tipo de solicitud de correo"><Select value={det.tipoCorreo} onChange={v => updateDetail("c1", "tipoCorreo", v)} options={["Creación de cuenta", "Aumento de capacidad de buzón"]} /></FieldGroup>
            {det.tipoCorreo === "Aumento de capacidad de buzón" && <FieldGroup label="Nueva capacidad solicitada"><Input value={det.capacidadBuzon} onChange={v => updateDetail("c1", "capacidadBuzon", v)} placeholder="Ej: 2 GB" /></FieldGroup>}
          </div>
        )}
      </SectionBox>
    </div>
  );
}

// ---- C4: Acceso Remoto (VPN) ----
function DetalleC4({ data, updateDetail, form }) {
  const det = data || {};
  return (
    <div>
      <SectionBox title="🔗 Datos para Acceso Remoto (VPN)" color="#fb923c">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <FieldGroup label="Usuario de Red INEI"><Input value={det.usuarioRed} onChange={v => updateDetail("c4", "usuarioRed", v)} placeholder="Ej: cmendoza" /></FieldGroup>
          <FieldGroup label={<span>Dirección IP <InfoTooltip text="Solo si requiere una IP específica. Déjelo vacío si no aplica." /></span>}><Input value={det.ip} onChange={v => updateDetail("c4", "ip", v)} placeholder="Opcional — Ej: 192.168.1.50" /></FieldGroup>
          <FieldGroup label="Correo Personal (contacto)"><Input value={det.correoPersonal || form.correo} onChange={v => updateDetail("c4", "correoPersonal", v)} placeholder="correo@gmail.com" /></FieldGroup>
          <FieldGroup label="Nombre de Host / Equipo"><Input value={det.hostName} onChange={v => updateDetail("c4", "hostName", v)} placeholder="Ej: LAPTOP-LPAREDES" /></FieldGroup>
          <FieldGroup label="Teléfono de Contacto"><Input value={det.telefonoContacto || form.telefono} onChange={v => updateDetail("c4", "telefonoContacto", v)} placeholder="Ej: 987654321" /></FieldGroup>
        </div>
      </SectionBox>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="Fecha de Inicio"><Input type="date" value={det.fechaInicio} onChange={v => updateDetail("c4", "fechaInicio", v)} /></FieldGroup>
        <FieldGroup label="Fecha de Término"><Input type="date" value={det.fechaFin} onChange={v => updateDetail("c4", "fechaFin", v)} /></FieldGroup>
      </div>
      <FieldGroup label="Justificación del acceso remoto"><TextArea value={det.justificacion} onChange={v => updateDetail("c4", "justificacion", v)} placeholder="Indique el motivo por el cual requiere acceso VPN..." /></FieldGroup>
    </div>
  );
}

// ---- C6: Carpeta FTP ----
function DetalleC6({ data, updateDetail, form }) {
  const det = data || {};
  const usuarios = det.usuarios || [];
  const addUsuario = () => updateDetail("c6", "usuarios", [...usuarios, { area: form.oficina || "", proyecto: "", dni: "", nombre: "", apellidos: "", lectura: false, escritura: false }]);
  const updateUsuario = (idx, key, val) => updateDetail("c6", "usuarios", usuarios.map((u, i) => i === idx ? { ...u, [key]: val } : u));
  const removeUsuario = (idx) => updateDetail("c6", "usuarios", usuarios.filter((_, i) => i !== idx));

  return (
    <div>
      <InfoBox type="warning">
        <strong>Responsabilidad del usuario:</strong> El usuario que solicita la carpeta FTP es responsable del contenido almacenado en la misma. La OTIN no se hace responsable por el uso indebido del espacio asignado. El contenido debe ser exclusivamente relacionado con las funciones institucionales.
      </InfoBox>
      <FieldGroup label="Tipo de solicitud FTP">
        <Select value={det.subTipo} onChange={v => updateDetail("c6", "subTipo", v)} options={[{ value: "generacion", label: "Generación de carpeta FTP" }, { value: "acceso", label: "Acceso FTP (a carpeta existente)" }]} />
      </FieldGroup>
      {det.subTipo === "generacion" && (
        <SectionBox title="Generación de carpeta FTP" color="#fbbf24">
          <FieldGroup label="Jefe de área"><Input value={det.jefeArea} onChange={v => updateDetail("c6", "jefeArea", v)} placeholder="Nombre del jefe de área" /></FieldGroup>
          <FieldGroup label="Propósito"><TextArea value={det.proposito} onChange={v => updateDetail("c6", "proposito", v)} placeholder="Describa el propósito..." /></FieldGroup>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, marginBottom: 8, textTransform: "uppercase" }}>Usuarios con acceso</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 8 }}>
              <thead><tr style={{ background: theme.surface2 }}>
                {["Área", "Proyecto", "DNI", "Nombre", "Apellidos", "Lec.", "Esc.", ""].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, color: theme.text2, borderBottom: `1px solid ${theme.border}` }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{usuarios.map((u, i) => (
                <tr key={i}>
                  <td style={{ padding: "4px 4px" }}><input style={tblInput} value={u.area} onChange={e => updateUsuario(i, "area", e.target.value)} /></td>
                  <td style={{ padding: "4px 4px" }}><input style={tblInput} value={u.proyecto} onChange={e => updateUsuario(i, "proyecto", e.target.value)} /></td>
                  <td style={{ padding: "4px 4px" }}><input style={{ ...tblInput, width: 80 }} value={u.dni} onChange={e => updateUsuario(i, "dni", e.target.value)} /></td>
                  <td style={{ padding: "4px 4px" }}><input style={tblInput} value={u.nombre} onChange={e => updateUsuario(i, "nombre", e.target.value)} /></td>
                  <td style={{ padding: "4px 4px" }}><input style={tblInput} value={u.apellidos} onChange={e => updateUsuario(i, "apellidos", e.target.value)} /></td>
                  <td style={{ padding: "4px 4px", textAlign: "center" }}><input type="checkbox" checked={u.lectura} onChange={e => updateUsuario(i, "lectura", e.target.checked)} /></td>
                  <td style={{ padding: "4px 4px", textAlign: "center" }}><input type="checkbox" checked={u.escritura} onChange={e => updateUsuario(i, "escritura", e.target.checked)} /></td>
                  <td style={{ padding: "4px 4px" }}><button onClick={() => removeUsuario(i)} style={{ background: "none", border: "none", color: theme.red, cursor: "pointer", fontSize: 14 }}>✕</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <button onClick={addUsuario} style={{ padding: "6px 14px", borderRadius: 6, border: `1px dashed ${theme.border}`, background: "#fff", color: theme.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar usuario</button>
        </SectionBox>
      )}
      {det.subTipo === "acceso" && (
        <SectionBox title="Acceso FTP a carpeta existente" color="#fbbf24">
          <FieldGroup label="Tipo"><Select value={det.tipoAccesoFtp} onChange={v => updateDetail("c6", "tipoAccesoFtp", v)} options={["Acceso", "Modificación", "Quitar permiso"]} /></FieldGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="Servidor"><Input value={det.servidor} onChange={v => updateDetail("c6", "servidor", v)} placeholder="Ej: ftp.inei.gob.pe" /></FieldGroup>
            <FieldGroup label="Carpeta compartida"><Input value={det.carpeta} onChange={v => updateDetail("c6", "carpeta", v)} placeholder="Ej: /proyectos/encuesta2024" /></FieldGroup>
          </div>
          <FieldGroup label="Permiso"><Select value={det.permisos} onChange={v => updateDetail("c6", "permisos", v)} options={["Lectura", "Escritura", "Control Total"]} /></FieldGroup>
          <FieldGroup label="Justificación"><TextArea value={det.justificacion} onChange={v => updateDetail("c6", "justificacion", v)} placeholder="Justifique..." /></FieldGroup>
        </SectionBox>
      )}
    </div>
  );
}

// ---- C8: Base de Datos ----
function DetalleC8({ data, updateDetail }) {
  const det = data || {};
  const permisos = det.permisos || [];
  const togglePerm = (p) => updateDetail("c8", "permisos", permisos.includes(p) ? permisos.filter(x => x !== p) : [...permisos, p]);

  return (
    <div>
      <FieldGroup label="Propósito de acceso / Justificación"><TextArea value={det.proposito} onChange={v => updateDetail("c8", "proposito", v)} placeholder="Describa el propósito..." /></FieldGroup>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="Nombre del Servidor"><Input value={det.servidor} onChange={v => updateDetail("c8", "servidor", v)} placeholder="Nombre del servidor" /></FieldGroup>
        <FieldGroup label="Nombre de la Base de Datos"><Input value={det.baseDatos} onChange={v => updateDetail("c8", "baseDatos", v)} placeholder="Nombre de la BD" /></FieldGroup>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="Tipo de Ambiente"><RadioGroup value={det.ambiente} onChange={v => updateDetail("c8", "ambiente", v)} options={["Desarrollo", "Producción"]} name="c8ambiente" /></FieldGroup>
        <FieldGroup label="Tipo de Acceso"><RadioGroup value={det.tipoAcceso} onChange={v => updateDetail("c8", "tipoAcceso", v)} options={["Permanente", "Temporal"]} name="c8tipoAcceso" /></FieldGroup>
      </div>
      {det.tipoAcceso === "Temporal" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <FieldGroup label="Fecha de Inicio"><Input type="date" value={det.fechaInicio} onChange={v => updateDetail("c8", "fechaInicio", v)} /></FieldGroup>
          <FieldGroup label="Fecha de Fin"><Input type="date" value={det.fechaFin} onChange={v => updateDetail("c8", "fechaFin", v)} /></FieldGroup>
        </div>
      )}
      <FieldGroup label={<span>Tipo de permiso solicitado <InfoTooltip text="Seleccione los permisos necesarios para su trabajo. Cada permiso tiene un alcance diferente sobre la base de datos." /></span>}>
        {[
          { id: "(i) Lectura de tablas y vistas", desc: "SELECT sobre tablas y vistas. Permite consultar datos sin modificarlos." },
          { id: "(ii) Escritura de información en tablas", desc: "INSERT, UPDATE, DELETE sobre tablas. Permite agregar, modificar y eliminar registros." },
          { id: "(iii) Ejecución de procedimientos y funciones", desc: "EXECUTE sobre stored procedures y funciones. Permite ejecutar lógica almacenada en la BD." },
          { id: "(iv) Permisos DDL", desc: "CREATE, ALTER, DROP. Permite crear/modificar/eliminar objetos (tablas, vistas, índices). Solo para desarrollo." },
        ].map(p => (
          <div key={p.id} style={{ marginBottom: 6 }}>
            <Checkbox checked={permisos.includes(p.id)} onChange={() => togglePerm(p.id)} label={<span>{p.id} <InfoTooltip text={p.desc} /></span>} />
          </div>
        ))}
      </FieldGroup>
      <FieldGroup label="Objetos específicos (opcional)"><Input value={det.objetos} onChange={v => updateDetail("c8", "objetos", v)} placeholder="Ej: tbl_encuesta, vw_resultados" /></FieldGroup>
    </div>
  );
}

// ---- C9: Sistemas / Aplicativos ----
function DetalleC9({ data, updateDetail, form }) {
  const det = data || {};
  const usuarios = det.usuarios || [];
  const addUsuario = () => updateDetail("c9", "usuarios", [...usuarios, { dni: "", nombres: "", rol: "", correo: form.correo || "", fechaAlta: "", fechaBaja: "", modulo: "", tipoAcceso: "", otroAcceso: "", sustento: "" }]);
  const updateUsuario = (idx, key, val) => updateDetail("c9", "usuarios", usuarios.map((u, i) => i === idx ? { ...u, [key]: val } : u));
  const removeUsuario = (idx) => updateDetail("c9", "usuarios", usuarios.filter((_, i) => i !== idx));

  return (
    <div>
      <InfoBox type="conditions">
        <strong>Condiciones de uso del acceso a Sistemas y Aplicativos:</strong>
        <ol style={{ margin: "8px 0 0 0", paddingLeft: 18, fontSize: 12, lineHeight: 1.7 }}>
          <li><strong>Contraseña:</strong> La contraseña es personal e intransferible. El usuario es responsable de toda actividad realizada con sus credenciales.</li>
          <li><strong>Cambio periódico:</strong> El usuario debe cambiar su contraseña periódicamente según las políticas de seguridad establecidas por la OTIN.</li>
          <li><strong>No compartir credenciales:</strong> Queda prohibido compartir credenciales de acceso con terceros, incluyendo compañeros de trabajo.</li>
          <li><strong>Uso exclusivo institucional:</strong> El acceso otorgado es exclusivamente para las funciones institucionales indicadas en el sustento.</li>
          <li><strong>Notificación de incidentes:</strong> Cualquier sospecha de acceso no autorizado debe ser reportada inmediatamente a la OTIN.</li>
          <li><strong>Vigencia:</strong> El acceso se otorga por el período indicado. Al finalizar, las credenciales serán desactivadas automáticamente.</li>
          <li><strong>Revocación:</strong> La OTIN se reserva el derecho de revocar el acceso en cualquier momento si se detecta uso indebido.</li>
        </ol>
      </InfoBox>
      <FieldGroup label="Nombre del Sistema / Proyecto"><Input value={det.sistema} onChange={v => updateDetail("c9", "sistema", v)} placeholder="Ej: SIGE, REDATAM" /></FieldGroup>
      <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, marginBottom: 8, marginTop: 8, textTransform: "uppercase" }}>Tabla de usuarios</div>
      {usuarios.map((u, i) => (
        <SectionBox key={i} title={`Usuario ${i + 1}`} color="#818cf8">
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8, marginBottom: 4 }}>
            <button onClick={() => removeUsuario(i)} style={{ background: "none", border: "none", color: theme.red, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕ Eliminar</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <FieldGroup label="DNI"><Input value={u.dni} onChange={v => updateUsuario(i, "dni", v)} placeholder="DNI" /></FieldGroup>
            <FieldGroup label="Apellidos y Nombres"><Input value={u.nombres} onChange={v => updateUsuario(i, "nombres", v)} placeholder="Apellidos y nombres" /></FieldGroup>
            <FieldGroup label="Rol / Cargo"><Input value={u.rol} onChange={v => updateUsuario(i, "rol", v)} placeholder="Rol o cargo" /></FieldGroup>
            <FieldGroup label="Correo institucional"><Input value={u.correo} onChange={v => updateUsuario(i, "correo", v)} placeholder="correo@inei.gob.pe" /></FieldGroup>
            <FieldGroup label="Fecha de alta"><Input type="date" value={u.fechaAlta} onChange={v => updateUsuario(i, "fechaAlta", v)} /></FieldGroup>
            <FieldGroup label="Fecha de baja"><Input type="date" value={u.fechaBaja} onChange={v => updateUsuario(i, "fechaBaja", v)} /></FieldGroup>
          </div>
          <FieldGroup label="Nombre del módulo"><Input value={u.modulo} onChange={v => updateUsuario(i, "modulo", v)} placeholder="Ej: Módulo de consultas" /></FieldGroup>
          <FieldGroup label="Tipo de acceso"><Select value={u.tipoAcceso} onChange={v => updateUsuario(i, "tipoAcceso", v)} options={["Creación", "Desactivación", "Actualización", "Consulta", "Otro"]} /></FieldGroup>
          {u.tipoAcceso === "Otro" && <FieldGroup label="Especificar"><Input value={u.otroAcceso} onChange={v => updateUsuario(i, "otroAcceso", v)} placeholder="Especifique..." /></FieldGroup>}
          <FieldGroup label="Sustento de uso"><TextArea value={u.sustento} onChange={v => updateUsuario(i, "sustento", v)} placeholder="Describa el sustento..." rows={2} /></FieldGroup>
        </SectionBox>
      ))}
      <button onClick={addUsuario} style={{ padding: "8px 16px", borderRadius: 6, border: `1px dashed ${theme.border}`, background: "#fff", color: theme.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar usuario</button>
    </div>
  );
}

export default StepDetalle;
