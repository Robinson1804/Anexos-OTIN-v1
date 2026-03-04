import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// DATA & CONSTANTS
// ============================================================
const SERVICES = [
  { id: "c1", label: "Cuenta de Red / Internet / Correo", icon: "🖧", color: "#6c8aff" },
  { id: "c4", label: "Acceso Remoto (VPN)", icon: "🔗", color: "#fb923c" },
  { id: "c5", label: "Desbloqueo USB", icon: "🔌", color: "#f87171" },
  { id: "c6", label: "Carpeta FTP", icon: "📂", color: "#fbbf24" },
  { id: "c7", label: "Recursos Compartidos", icon: "📁", color: "#2dd4bf" },
  { id: "c8", label: "Base de Datos", icon: "🗄", color: "#f472b6" },
  { id: "c9", label: "Sistemas / Aplicativos", icon: "⚙", color: "#818cf8" },
];

const STATUS_MAP = {
  borrador: { label: "Borrador", color: "#8b90a5", bg: "rgba(139,144,165,0.12)" },
  generado: { label: "Generado", color: "#6c8aff", bg: "rgba(108,138,255,0.12)" },
  firmado: { label: "Firmado", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  atendido: { label: "Atendido", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
};

const VINCULOS = ["Nombrado", "CAS", "Locador / O.S.", "Otros"];
const OPERACIONES = ["Creación", "Actualización", "Baja", "Desactivación"];
const SEDES = ["Sede Central", "Sede Arenales", "Sede Salas", "Sede Regional", "Otra"];

const EMPLEADOS_MOCK = [
  { dni: "45678901", nombres: "Carlos Alberto Mendoza Ríos", cargo: "Analista de Sistemas", correo: "cmendoza@inei.gob.pe", telefono: "2017", vinculo: "Nombrado", oficina: "Oficina Técnica de Informática", sede: "Sede Central", ordenServicio: "", fechaInicio: "2020-03-01", fechaFin: "", tipoAcceso: "Permanente" },
  { dni: "32165498", nombres: "María Elena Torres Gutiérrez", cargo: "Especialista en Estadística", correo: "mtorres@inei.gob.pe", telefono: "2045", vinculo: "Nombrado", oficina: "Dirección Nacional de Censos y Encuestas", sede: "Sede Central", ordenServicio: "", fechaInicio: "2018-06-15", fechaFin: "", tipoAcceso: "Permanente" },
  { dni: "78945612", nombres: "Juan Pedro García López", cargo: "Coordinador de Proyectos", correo: "jgarcia@inei.gob.pe", telefono: "3012", vinculo: "CAS", oficina: "Dirección Técnica de Demografía e Indicadores Sociales", sede: "Sede Arenales", ordenServicio: "", fechaInicio: "2026-01-02", fechaFin: "2026-12-31", tipoAcceso: "temporal" },
  { dni: "15935745", nombres: "Rosa Angélica Huamán Chávez", cargo: "Asistente Administrativo", correo: "rhuaman@inei.gob.pe", telefono: "1089", vinculo: "CAS", oficina: "Oficina Técnica de Administración", sede: "Sede Central", ordenServicio: "", fechaInicio: "2026-01-02", fechaFin: "2026-12-31", tipoAcceso: "temporal" },
  { dni: "95175346", nombres: "Luis Fernando Paredes Soto", cargo: "Consultor en Base de Datos", correo: "lparedes@inei.gob.pe", telefono: "2078", vinculo: "Locador / O.S.", oficina: "Oficina Técnica de Informática", sede: "Sede Central", ordenServicio: "OS-2026-0045", fechaInicio: "2026-02-01", fechaFin: "2026-07-31", tipoAcceso: "temporal" },
  { dni: "36925814", nombres: "Ana Sofía Vargas Medina", cargo: "Analista Programador", correo: "avargas@inei.gob.pe", telefono: "2034", vinculo: "CAS", oficina: "Oficina Técnica de Informática", sede: "Sede Salas", ordenServicio: "", fechaInicio: "2026-01-02", fechaFin: "2026-12-31", tipoAcceso: "temporal" },
  { dni: "74185296", nombres: "Roberto Enrique Díaz Flores", cargo: "Jefe de Unidad de Redes", correo: "rdiaz@inei.gob.pe", telefono: "2001", vinculo: "Nombrado", oficina: "Oficina Técnica de Informática", sede: "Sede Central", ordenServicio: "", fechaInicio: "2015-08-10", fechaFin: "", tipoAcceso: "Permanente" },
  { dni: "85274196", nombres: "Patricia Carmen Rojas Villanueva", cargo: "Especialista en Cartografía", correo: "projas@inei.gob.pe", telefono: "4015", vinculo: "Nombrado", oficina: "Dirección Nacional de Censos y Encuestas", sede: "Sede Arenales", ordenServicio: "", fechaInicio: "2019-04-01", fechaFin: "", tipoAcceso: "Permanente" },
  { dni: "65432198", nombres: "Diego Armando Salazar Peña", cargo: "Técnico en Soporte", correo: "dsalazar@inei.gob.pe", telefono: "2056", vinculo: "CAS", oficina: "Oficina Técnica de Informática", sede: "Sede Central", ordenServicio: "", fechaInicio: "2026-01-02", fechaFin: "2026-12-31", tipoAcceso: "temporal" },
  { dni: "12348765", nombres: "Claudia Isabel Fernández Quispe", cargo: "Consultora de Sistemas", correo: "cfernandez@inei.gob.pe", telefono: "2090", vinculo: "Locador / O.S.", oficina: "Dirección Técnica de Indicadores Económicos", sede: "Sede Central", ordenServicio: "OS-2026-0112", fechaInicio: "2026-03-01", fechaFin: "2026-08-31", tipoAcceso: "temporal" },
];

const emptyForm = () => ({
  id: "SOL-" + String(Date.now()).slice(-6),
  fecha: new Date().toISOString().split("T")[0],
  operacion: "",
  oficina: "",
  sede: "",
  nombres: "",
  dni: "",
  vinculo: "",
  ordenServicio: "",
  cargo: "",
  correo: "",
  telefono: "",
  servicios: [],
  detalles: {},
  justificacion: "",
  periodoInicio: "",
  periodoFin: "",
  fechaInicioContrato: "",
  tipoAcceso: "temporal",
  status: "borrador",
  createdAt: Date.now(),
  archivoFirmado: null,
});

// ============================================================
// STYLES
// ============================================================
const theme = {
  bg: "#f6f7fb",
  surface: "#ffffff",
  surface2: "#f0f1f6",
  accent: "#1a56db",
  accent2: "#6c8aff",
  green: "#059669",
  orange: "#d97706",
  red: "#dc2626",
  text: "#1e2330",
  text2: "#5f6577",
  border: "#e2e5ef",
  radius: "10px",
};

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [view, setView] = useState("dashboard");
  const [solicitudes, setSolicitudes] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [step, setStep] = useState(0);
  const [pdfBlob, setPdfBlob] = useState(null);

  const handleNew = () => {
    setCurrentForm(emptyForm());
    setStep(0);
    setView("form");
  };

  const handleEdit = (sol) => {
    setCurrentForm({ ...sol });
    setStep(0);
    setView("form");
  };

  const handleSave = (form) => {
    setSolicitudes((prev) => {
      const idx = prev.findIndex((s) => s.id === form.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = form;
        return copy;
      }
      return [...prev, form];
    });
  };

  const handleDelete = (id) => {
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    setView("dashboard");
  };

  const handleStatusChange = (id, newStatus) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Segoe UI', 'SF Pro Display', system-ui, sans-serif" }}>
      <Header onHome={() => setView("dashboard")} onNew={handleNew} />
      {view === "dashboard" && (
        <Dashboard
          solicitudes={solicitudes}
          onNew={handleNew}
          onEdit={handleEdit}
          onView={(sol) => { setCurrentForm(sol); setView("detail"); }}
        />
      )}
      {view === "form" && currentForm && (
        <FormWizard
          form={currentForm}
          setForm={setCurrentForm}
          step={step}
          setStep={setStep}
          onSave={handleSave}
          onCancel={() => setView("dashboard")}
          onGenerate={(form) => {
            handleSave({ ...form, status: "generado" });
            setCurrentForm({ ...form, status: "generado" });
            setView("detail");
          }}
        />
      )}
      {view === "detail" && currentForm && (
        <DetailView
          sol={currentForm}
          onBack={() => setView("dashboard")}
          onStatusChange={(status) => {
            handleStatusChange(currentForm.id, status);
            setCurrentForm({ ...currentForm, status });
          }}
          onUploadFirmado={(file) => {
            const updated = { ...currentForm, archivoFirmado: file, status: "firmado" };
            setCurrentForm(updated);
            handleSave(updated);
          }}
          onDelete={() => handleDelete(currentForm.id)}
        />
      )}
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================
function Header({ onHome, onNew }) {
  return (
    <div style={{
      background: "#fff",
      borderBottom: `1px solid ${theme.border}`,
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 60,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={onHome}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "linear-gradient(135deg, #1a56db, #6c8aff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 16,
        }}>SI</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: theme.text, lineHeight: 1.2 }}>SASI – INEI</div>
          <div style={{ fontSize: 10, color: theme.text2, letterSpacing: 0.5 }}>Sistema de Accesos y Servicios Informáticos</div>
        </div>
      </div>
      <button onClick={onNew} style={{
        background: theme.accent, color: "#fff", border: "none",
        padding: "8px 18px", borderRadius: 8, fontWeight: 600,
        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nueva Solicitud
      </button>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ solicitudes, onNew, onEdit, onView }) {
  const [filter, setFilter] = useState("todos");

  const filtered = filter === "todos"
    ? solicitudes
    : solicitudes.filter((s) => s.status === filter);

  const counts = {
    todos: solicitudes.length,
    borrador: solicitudes.filter((s) => s.status === "borrador").length,
    generado: solicitudes.filter((s) => s.status === "generado").length,
    firmado: solicitudes.filter((s) => s.status === "firmado").length,
    atendido: solicitudes.filter((s) => s.status === "atendido").length,
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Mis Solicitudes</h1>
        <p style={{ color: theme.text2, fontSize: 14 }}>Gestiona tus solicitudes de accesos y servicios informáticos</p>
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[{ key: "todos", label: "Todos" }, ...Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label }))].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "6px 16px", borderRadius: 20, border: `1px solid ${filter === f.key ? theme.accent : theme.border}`,
            background: filter === f.key ? theme.accent : "#fff",
            color: filter === f.key ? "#fff" : theme.text2,
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>
            {f.label} <span style={{ opacity: 0.7 }}>({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px", background: "#fff",
          borderRadius: 12, border: `1px solid ${theme.border}`,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ color: theme.text, marginBottom: 8 }}>No hay solicitudes</h3>
          <p style={{ color: theme.text2, fontSize: 14, marginBottom: 20 }}>Crea tu primera solicitud unificada de accesos</p>
          <button onClick={onNew} style={{
            background: theme.accent, color: "#fff", border: "none",
            padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>+ Nueva Solicitud</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.sort((a, b) => b.createdAt - a.createdAt).map((sol) => (
            <SolicitudCard key={sol.id} sol={sol} onEdit={onEdit} onView={onView} />
          ))}
        </div>
      )}
    </div>
  );
}

function SolicitudCard({ sol, onEdit, onView }) {
  const st = STATUS_MAP[sol.status];
  return (
    <div onClick={() => onView(sol)} style={{
      background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 10,
      padding: "16px 20px", cursor: "pointer", transition: "box-shadow 0.15s",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{sol.id}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
            background: st.bg, color: st.color,
          }}>{st.label}</span>
        </div>
        <div style={{ fontSize: 13, color: theme.text, marginBottom: 4 }}>
          {sol.nombres || "Sin nombre"} — {sol.oficina || "Sin oficina"}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sol.servicios.map((sid) => {
            const svc = SERVICES.find((s) => s.id === sid);
            return svc ? (
              <span key={sid} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 10,
                background: `${svc.color}18`, color: svc.color, fontWeight: 600,
              }}>{svc.icon} {svc.label}</span>
            ) : null;
          })}
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 12, color: theme.text2, whiteSpace: "nowrap" }}>
        {sol.fecha}
      </div>
    </div>
  );
}

// ============================================================
// FORM WIZARD
// ============================================================
const STEPS = [
  { label: "Datos del Usuario", icon: "👤" },
  { label: "Datos Generales", icon: "📋" },
  { label: "Servicios", icon: "🔧" },
  { label: "Detalle Técnico", icon: "⚙" },
  { label: "Justificación", icon: "📝" },
  { label: "Revisión", icon: "✅" },
];

function FormWizard({ form, setForm, step, setStep, onSave, onCancel, onGenerate }) {
  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateDetail = (svcId, key, val) =>
    setForm((f) => ({
      ...f,
      detalles: { ...f.detalles, [svcId]: { ...(f.detalles[svcId] || {}), [key]: val } },
    }));

  const canNext = () => {
    if (step === 0) return form.nombres && form.dni && form.vinculo && form.cargo;
    if (step === 1) return form.operacion && form.oficina && form.sede;
    if (step === 2) return form.servicios.length > 0;
    return true;
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
      {/* Stepper */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, overflowX: "auto" }}>
        {STEPS.map((s, i) => (
          <div key={i} onClick={() => i <= step && setStep(i)} style={{
            flex: 1, minWidth: 80, textAlign: "center", padding: "10px 4px",
            borderBottom: `3px solid ${i === step ? theme.accent : i < step ? theme.green : theme.border}`,
            cursor: i <= step ? "pointer" : "default", transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 16 }}>{s.icon}</div>
            <div style={{
              fontSize: 11, fontWeight: i === step ? 700 : 500,
              color: i === step ? theme.accent : i < step ? theme.green : theme.text2,
              marginTop: 2,
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form content */}
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "28px 24px", marginBottom: 20 }}>
        {step === 0 && <StepUsuario form={form} update={update} />}
        {step === 1 && <StepGeneral form={form} update={update} />}
        {step === 2 && <StepServicios form={form} setForm={setForm} />}
        {step === 3 && <StepDetalle form={form} setForm={setForm} updateDetail={updateDetail} />}
        {step === 4 && <StepJustificacion form={form} update={update} />}
        {step === 5 && <StepRevision form={form} />}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <button onClick={step === 0 ? onCancel : () => setStep(step - 1)} style={{
          padding: "10px 20px", borderRadius: 8, border: `1px solid ${theme.border}`,
          background: "#fff", color: theme.text2, fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>
          {step === 0 ? "Cancelar" : "← Anterior"}
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {step < 5 && (
            <button onClick={() => { onSave(form); }} style={{
              padding: "10px 16px", borderRadius: 8, border: `1px solid ${theme.border}`,
              background: "#fff", color: theme.text2, fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}>Guardar borrador</button>
          )}
          {step < 5 ? (
            <button disabled={!canNext()} onClick={() => setStep(step + 1)} style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: canNext() ? theme.accent : "#ccc", color: "#fff",
              fontWeight: 600, fontSize: 13, cursor: canNext() ? "pointer" : "not-allowed",
            }}>Siguiente →</button>
          ) : (
            <button onClick={() => onGenerate(form)} style={{
              padding: "10px 28px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #059669, #34d399)", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>📄 Generar PDF para Firmas</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- FORM STEPS ----

function FieldGroup({ label, children, style: extraStyle }) {
  return (
    <div style={{ marginBottom: 16, ...extraStyle }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.text2, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", style: extraStyle, disabled }) {
  return (
    <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${theme.border}`,
        fontSize: 14, color: theme.text, background: disabled ? "#eee" : theme.surface2, outline: "none",
        cursor: disabled ? "not-allowed" : undefined,
        ...extraStyle,
      }}
      onFocus={(e) => e.target.style.borderColor = theme.accent}
      onBlur={(e) => e.target.style.borderColor = theme.border}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value || ""} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{
        width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.border}`,
        fontSize: 14, color: theme.text, background: theme.surface2, outline: "none", resize: "vertical", fontFamily: "inherit",
      }}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={{
      width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${theme.border}`,
      fontSize: 14, color: value ? theme.text : theme.text2, background: theme.surface2, outline: "none",
    }}>
      <option value="">{placeholder || "Seleccionar..."}</option>
      {options.map((o) => typeof o === "string"
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, cursor: "pointer" }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function RadioGroup({ value, onChange, options, name }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const lbl = typeof o === "string" ? o : o.label;
        return (
          <label key={val} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
            <input type="radio" name={name} value={val} checked={value === val} onChange={() => onChange(val)} />
            {lbl}
          </label>
        );
      })}
    </div>
  );
}

function SectionBox({ title, children, color }) {
  return (
    <div style={{ padding: 16, background: `${color || theme.accent}08`, border: `1px solid ${color || theme.accent}20`, borderRadius: 10, marginBottom: 16 }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: color || theme.accent, marginBottom: 12 }}>{title}</div>}
      {children}
    </div>
  );
}

function StepGeneral({ form, update }) {
  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Datos Generales de la Solicitud</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>Información básica que aplica a todos los servicios solicitados</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="N° Solicitud">
          <Input value={form.id} onChange={() => {}} disabled style={{ background: "#eee", cursor: "not-allowed" }} />
        </FieldGroup>
        <FieldGroup label="Fecha">
          <Input type="date" value={form.fecha} onChange={(v) => update("fecha", v)} />
        </FieldGroup>
        <FieldGroup label="Tipo de Operación *">
          <Select value={form.operacion} onChange={(v) => update("operacion", v)} options={OPERACIONES} placeholder="Seleccionar operación..." />
        </FieldGroup>
        <FieldGroup label="Sede *">
          <Select value={form.sede} onChange={(v) => update("sede", v)} options={SEDES} placeholder="Seleccionar sede..." />
        </FieldGroup>
      </div>
      <FieldGroup label="Oficina / Dirección Técnica Solicitante *">
        <Input value={form.oficina} onChange={(v) => update("oficina", v)} placeholder="Ej: Oficina Técnica de Informática" />
      </FieldGroup>
    </div>
  );
}

function StepUsuario({ form, update }) {
  const [dniBusqueda, setDniBusqueda] = useState("");
  const [busquedaEstado, setBusquedaEstado] = useState(null); // null | "encontrado" | "no_encontrado"

  const buscarPorDni = (dni) => {
    const dniLimpio = (dni || "").trim();
    if (dniLimpio.length !== 8) return;
    const empleado = EMPLEADOS_MOCK.find((e) => e.dni === dniLimpio);
    if (empleado) {
      update("dni", empleado.dni);
      update("nombres", empleado.nombres);
      update("cargo", empleado.cargo);
      update("correo", empleado.correo);
      update("telefono", empleado.telefono);
      update("vinculo", empleado.vinculo);
      update("ordenServicio", empleado.ordenServicio);
      update("oficina", empleado.oficina);
      update("sede", empleado.sede);
      // Auto-llenar fecha fin de contrato y tipo de acceso (NO fecha inicio, la pone el usuario)
      if (empleado.fechaInicio) update("fechaInicioContrato", empleado.fechaInicio);
      if (empleado.fechaFin) update("periodoFin", empleado.fechaFin);
      if (empleado.tipoAcceso) update("tipoAcceso", empleado.tipoAcceso);
      setBusquedaEstado("encontrado");
    } else {
      setBusquedaEstado("no_encontrado");
    }
  };

  const handleDniChange = (v) => {
    const soloNumeros = v.replace(/\D/g, "").slice(0, 8);
    setDniBusqueda(soloNumeros);
    update("dni", soloNumeros);
    if (busquedaEstado) setBusquedaEstado(null);
    if (soloNumeros.length === 8) buscarPorDni(soloNumeros);
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Datos del Usuario Beneficiario</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>Ingresa el DNI para auto-completar los datos o llena manualmente</p>

      {/* DNI search bar */}
      <div style={{ marginBottom: 16, padding: 16, background: "rgba(108,138,255,0.05)", border: `1px solid rgba(108,138,255,0.2)`, borderRadius: 10 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.accent, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Buscar por DNI
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={dniBusqueda || form.dni || ""}
            onChange={(e) => handleDniChange(e.target.value)}
            placeholder="Ingrese los 8 dígitos del DNI"
            maxLength={8}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8,
              border: `2px solid ${busquedaEstado === "encontrado" ? theme.green : busquedaEstado === "no_encontrado" ? theme.orange : theme.accent}`,
              fontSize: 16, fontWeight: 600, color: theme.text, background: "#fff",
              outline: "none", letterSpacing: 2,
            }}
          />
          <button
            onClick={() => buscarPorDni(dniBusqueda || form.dni)}
            disabled={((dniBusqueda || form.dni || "").length !== 8)}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "none",
              background: ((dniBusqueda || form.dni || "").length === 8) ? theme.accent : "#ccc",
              color: "#fff", fontWeight: 700, fontSize: 13, cursor: ((dniBusqueda || form.dni || "").length === 8) ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            Buscar
          </button>
        </div>

        {busquedaEstado === "encontrado" && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(5,150,105,0.08)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: theme.green, fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 13, color: theme.green, fontWeight: 600 }}>Datos cargados automáticamente. Puedes editarlos si necesitas ajustes.</span>
          </div>
        )}

        {busquedaEstado === "no_encontrado" && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(217,119,6,0.08)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: theme.orange, fontSize: 16 }}>!</span>
            <span style={{ fontSize: 13, color: theme.orange, fontWeight: 600 }}>DNI no encontrado. Ingrese los datos manualmente.</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="Nombres y Apellidos *">
          <Input value={form.nombres} onChange={(v) => update("nombres", v)} placeholder="Nombres completos" />
        </FieldGroup>
        <FieldGroup label="DNI *">
          <Input value={form.dni} onChange={(v) => { update("dni", v); setDniBusqueda(v); }} placeholder="00000000" />
        </FieldGroup>
        <FieldGroup label="Tipo de Vínculo *">
          <Select value={form.vinculo} onChange={(v) => update("vinculo", v)} options={VINCULOS} />
        </FieldGroup>
        <FieldGroup label="Cargo / Función *">
          <Input value={form.cargo} onChange={(v) => update("cargo", v)} placeholder="Ej: Analista de Sistemas" />
        </FieldGroup>
        <FieldGroup label="Correo Electrónico">
          <Input value={form.correo} onChange={(v) => update("correo", v)} placeholder="usuario@inei.gob.pe" />
        </FieldGroup>
        <FieldGroup label="Teléfono / Anexo">
          <Input value={form.telefono} onChange={(v) => update("telefono", v)} placeholder="Anexo o teléfono" />
        </FieldGroup>
        <FieldGroup label="N° Orden de Servicio (si aplica)">
          <Input value={form.ordenServicio} onChange={(v) => update("ordenServicio", v)} placeholder="Solo para Locadores/O.S." />
        </FieldGroup>
      </div>
    </div>
  );
}

function StepServicios({ form, setForm }) {
  const toggle = (id) => {
    setForm((f) => ({
      ...f,
      servicios: f.servicios.includes(id)
        ? f.servicios.filter((s) => s !== id)
        : [...f.servicios, id],
    }));
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Servicios Solicitados</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>Marca todos los servicios que necesitas. Puedes seleccionar varios.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {SERVICES.map((svc) => {
          const active = form.servicios.includes(svc.id);
          return (
            <div key={svc.id} onClick={() => toggle(svc.id)} style={{
              border: `2px solid ${active ? svc.color : theme.border}`,
              borderRadius: 10, padding: "14px 16px", cursor: "pointer",
              background: active ? `${svc.color}0c` : "#fff",
              transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `2px solid ${active ? svc.color : theme.border}`,
                  background: active ? svc.color : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  transition: "all 0.15s",
                }}>{active ? "✓" : ""}</div>
                <span style={{ fontSize: 20 }}>{svc.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? svc.color : theme.text }}>{svc.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      {form.servicios.length > 0 && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(108,138,255,0.06)", borderRadius: 8, fontSize: 13, color: theme.accent }}>
          ✓ {form.servicios.length} servicio(s) seleccionado(s). En el siguiente paso completarás el detalle técnico de cada uno.
        </div>
      )}
    </div>
  );
}

// ============================================================
// STEP DETALLE — All service modules
// ============================================================
function StepDetalle({ form, setForm, updateDetail }) {
  const activeServices = SERVICES.filter((s) => form.servicios.includes(s.id));
  const [openTab, setOpenTab] = useState(activeServices[0]?.id || "");

  if (activeServices.length === 0) {
    return <p style={{ color: theme.text2 }}>No has seleccionado servicios. Vuelve al paso anterior.</p>;
  }

  const d = (svcId) => form.detalles[svcId] || {};

  const updateDetailObj = (svcId, obj) => {
    setForm((f) => ({
      ...f,
      detalles: { ...f.detalles, [svcId]: { ...(f.detalles[svcId] || {}), ...obj } },
    }));
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Detalle Técnico por Servicio</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 16 }}>Completa la información específica de cada servicio seleccionado</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {activeServices.map((svc) => (
          <button key={svc.id} onClick={() => setOpenTab(svc.id)} style={{
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${openTab === svc.id ? svc.color : theme.border}`,
            background: openTab === svc.id ? `${svc.color}14` : "#fff",
            color: openTab === svc.id ? svc.color : theme.text2,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>{svc.icon} {svc.label}</button>
        ))}
      </div>

      {/* C1 — Cuenta de Red / Internet / Correo (UNIFICADO) */}
      {openTab === "c1" && (
        <DetalleC1 data={d("c1")} updateDetail={updateDetail} updateDetailObj={updateDetailObj} />
      )}

      {/* C4 — VPN */}
      {openTab === "c4" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="Fecha de Inicio"><Input type="date" value={d("c4").fechaInicio} onChange={(v) => updateDetail("c4", "fechaInicio", v)} /></FieldGroup>
            <FieldGroup label="Fecha de Término"><Input type="date" value={d("c4").fechaFin} onChange={(v) => updateDetail("c4", "fechaFin", v)} /></FieldGroup>
          </div>
          <FieldGroup label="Justificación del acceso remoto">
            <TextArea value={d("c4").justificacion} onChange={(v) => updateDetail("c4", "justificacion", v)} placeholder="Indique el motivo por el cual requiere acceso VPN..." />
          </FieldGroup>
        </div>
      )}

      {/* C5 — USB */}
      {openTab === "c5" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="Fecha de Inicio"><Input type="date" value={d("c5").fechaInicio} onChange={(v) => updateDetail("c5", "fechaInicio", v)} /></FieldGroup>
            <FieldGroup label="Fecha de Término"><Input type="date" value={d("c5").fechaFin} onChange={(v) => updateDetail("c5", "fechaFin", v)} /></FieldGroup>
          </div>
          <FieldGroup label="Justificación del desbloqueo USB">
            <TextArea value={d("c5").justificacion} onChange={(v) => updateDetail("c5", "justificacion", v)} placeholder="Indique el motivo por el cual requiere desbloqueo de puertos USB..." />
          </FieldGroup>
        </div>
      )}

      {/* C6 — FTP */}
      {openTab === "c6" && (
        <DetalleC6 data={d("c6")} updateDetail={updateDetail} updateDetailObj={updateDetailObj} form={form} setForm={setForm} />
      )}

      {/* C7 — Recursos Compartidos */}
      {openTab === "c7" && (
        <div>
          <FieldGroup label="Tipo de Solicitud">
            <Select value={d("c7").tipoSolicitud} onChange={(v) => updateDetail("c7", "tipoSolicitud", v)} options={["Acceso", "Modificación", "Quitar permisos"]} />
          </FieldGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="Servidor"><Input value={d("c7").servidor} onChange={(v) => updateDetail("c7", "servidor", v)} placeholder="Ej: \\SAN01" /></FieldGroup>
            <FieldGroup label="Carpeta Compartida"><Input value={d("c7").carpeta} onChange={(v) => updateDetail("c7", "carpeta", v)} placeholder="Ej: \\SAN01\FICHAS" /></FieldGroup>
          </div>
          <FieldGroup label="Nivel de Permiso">
            <Select value={d("c7").permisos} onChange={(v) => updateDetail("c7", "permisos", v)} options={["Lectura", "Escritura", "Control Total"]} />
          </FieldGroup>
          <FieldGroup label="Justificación">
            <TextArea value={d("c7").justificacion} onChange={(v) => updateDetail("c7", "justificacion", v)} placeholder="Justifique la necesidad de acceso al recurso compartido..." />
          </FieldGroup>
        </div>
      )}

      {/* C8 — Base de Datos */}
      {openTab === "c8" && (
        <DetalleC8 data={d("c8")} updateDetail={updateDetail} />
      )}

      {/* C9 — Sistemas / Aplicativos */}
      {openTab === "c9" && (
        <DetalleC9 data={d("c9")} updateDetail={updateDetail} updateDetailObj={updateDetailObj} form={form} setForm={setForm} />
      )}
    </div>
  );
}

// ---- C1: Cuenta de Red + Internet + Correo (UNIFICADO) ----
function DetalleC1({ data, updateDetail, updateDetailObj }) {
  const det = data || {};
  return (
    <div>
      <FieldGroup label="Tipo de operación para este servicio">
        <Select value={det.tipoOperacion} onChange={(v) => updateDetail("c1", "tipoOperacion", v)}
          options={["Creación", "Actualización", "Baja", "Desactivación"]} />
      </FieldGroup>

      {/* Sub-sección: Cuenta de usuario de red */}
      <SectionBox title="🖧 Cuenta de usuario de red" color="#6c8aff">
        <Checkbox checked={det.cuentaRed} onChange={(v) => updateDetail("c1", "cuentaRed", v)} label="Solicitar cuenta de usuario de red" />
        {det.cuentaRed && (
          <div style={{ marginTop: 8 }}>
            <FieldGroup label="Tipo de cuenta">
              <Select value={det.tipoCuenta} onChange={(v) => updateDetail("c1", "tipoCuenta", v)} options={["Personal", "Genérica"]} />
            </FieldGroup>
            {det.tipoCuenta === "Genérica" && (
              <FieldGroup label="Nombre de la cuenta genérica">
                <Input value={det.nombreGenerico} onChange={(v) => updateDetail("c1", "nombreGenerico", v)} placeholder="Ej: recepcion_otin" />
              </FieldGroup>
            )}
          </div>
        )}
      </SectionBox>

      {/* Sub-sección: Internet */}
      <SectionBox title="🌐 Internet" color="#34d399">
        <Checkbox checked={det.internet} onChange={(v) => updateDetail("c1", "internet", v)} label="Solicitar acceso a Internet" />
        {det.internet && (
          <div style={{ marginTop: 8 }}>
            <FieldGroup label="Perfil de Internet">
              <Select value={det.perfilInternet} onChange={(v) => updateDetail("c1", "perfilInternet", v)}
                options={[
                  { value: "1", label: "Perfil 1 - Avanzado" },
                  { value: "2", label: "Perfil 2 - Intermedio" },
                  { value: "3", label: "Perfil 3 - Básico" },
                ]} />
            </FieldGroup>
            {det.perfilInternet === "1" && (
              <FieldGroup label="Redes Sociales">
                <RadioGroup value={det.redesSociales} onChange={(v) => updateDetail("c1", "redesSociales", v)}
                  options={["Con redes sociales", "Sin redes sociales"]} name="redesSociales" />
              </FieldGroup>
            )}
            <FieldGroup label="Justificación del acceso a Internet">
              <TextArea value={det.justificacionInternet} onChange={(v) => updateDetail("c1", "justificacionInternet", v)}
                placeholder="Describa por qué necesita acceso a Internet y para qué actividades..." />
            </FieldGroup>
          </div>
        )}
      </SectionBox>

      {/* Sub-sección: Correo Institucional */}
      <SectionBox title="✉ Correo Institucional" color="#a78bfa">
        <Checkbox checked={det.correoInst} onChange={(v) => updateDetail("c1", "correoInst", v)} label="Solicitar correo institucional" />
        {det.correoInst && (
          <div style={{ marginTop: 8 }}>
            <FieldGroup label="Tipo de solicitud de correo">
              <Select value={det.tipoCorreo} onChange={(v) => updateDetail("c1", "tipoCorreo", v)}
                options={["Creación de cuenta", "Aumento de capacidad de buzón"]} />
            </FieldGroup>
            {det.tipoCorreo === "Aumento de capacidad de buzón" && (
              <FieldGroup label="Nueva capacidad solicitada">
                <Input value={det.capacidadBuzon} onChange={(v) => updateDetail("c1", "capacidadBuzon", v)} placeholder="Ej: 2 GB" />
              </FieldGroup>
            )}
          </div>
        )}
      </SectionBox>
    </div>
  );
}

// ---- C6: Carpeta FTP (2 sub-tipos) ----
function DetalleC6({ data, updateDetail, updateDetailObj, form, setForm }) {
  const det = data || {};
  const usuarios = det.usuarios || [];

  const addUsuario = () => {
    const newUser = { area: form.oficina || "", proyecto: "", dni: "", nombre: "", apellidos: "", lectura: false, escritura: false };
    updateDetail("c6", "usuarios", [...usuarios, newUser]);
  };

  const updateUsuario = (idx, key, val) => {
    const updated = usuarios.map((u, i) => i === idx ? { ...u, [key]: val } : u);
    updateDetail("c6", "usuarios", updated);
  };

  const removeUsuario = (idx) => {
    updateDetail("c6", "usuarios", usuarios.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <FieldGroup label="Tipo de solicitud FTP">
        <Select value={det.subTipo} onChange={(v) => updateDetail("c6", "subTipo", v)}
          options={[
            { value: "generacion", label: "Generación de carpeta FTP" },
            { value: "acceso", label: "Acceso FTP (a carpeta existente)" },
          ]} />
      </FieldGroup>

      {det.subTipo === "generacion" && (
        <SectionBox title="Generación de carpeta FTP" color="#fbbf24">
          <FieldGroup label="Jefe de área">
            <Input value={det.jefeArea} onChange={(v) => updateDetail("c6", "jefeArea", v)} placeholder="Nombre del jefe de área" />
          </FieldGroup>
          <FieldGroup label="Propósito">
            <TextArea value={det.proposito} onChange={(v) => updateDetail("c6", "proposito", v)} placeholder="Describa el propósito de la carpeta FTP..." />
          </FieldGroup>

          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, marginBottom: 8, textTransform: "uppercase" }}>
            Usuarios con acceso a la carpeta
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 8 }}>
              <thead>
                <tr style={{ background: theme.surface2 }}>
                  {["Área", "Proyecto", "DNI", "Nombre", "Apellidos", "Lec.", "Esc.", ""].map((h) => (
                    <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, color: theme.text2, borderBottom: `1px solid ${theme.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, i) => (
                  <tr key={i}>
                    <td style={{ padding: "4px 4px" }}><input style={tblInput} value={u.area} onChange={(e) => updateUsuario(i, "area", e.target.value)} /></td>
                    <td style={{ padding: "4px 4px" }}><input style={tblInput} value={u.proyecto} onChange={(e) => updateUsuario(i, "proyecto", e.target.value)} /></td>
                    <td style={{ padding: "4px 4px" }}><input style={{ ...tblInput, width: 80 }} value={u.dni} onChange={(e) => updateUsuario(i, "dni", e.target.value)} /></td>
                    <td style={{ padding: "4px 4px" }}><input style={tblInput} value={u.nombre} onChange={(e) => updateUsuario(i, "nombre", e.target.value)} /></td>
                    <td style={{ padding: "4px 4px" }}><input style={tblInput} value={u.apellidos} onChange={(e) => updateUsuario(i, "apellidos", e.target.value)} /></td>
                    <td style={{ padding: "4px 4px", textAlign: "center" }}><input type="checkbox" checked={u.lectura} onChange={(e) => updateUsuario(i, "lectura", e.target.checked)} /></td>
                    <td style={{ padding: "4px 4px", textAlign: "center" }}><input type="checkbox" checked={u.escritura} onChange={(e) => updateUsuario(i, "escritura", e.target.checked)} /></td>
                    <td style={{ padding: "4px 4px" }}>
                      <button onClick={() => removeUsuario(i)} style={{ background: "none", border: "none", color: theme.red, cursor: "pointer", fontSize: 14 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addUsuario} style={{
            padding: "6px 14px", borderRadius: 6, border: `1px dashed ${theme.border}`,
            background: "#fff", color: theme.accent, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>+ Agregar usuario</button>
        </SectionBox>
      )}

      {det.subTipo === "acceso" && (
        <SectionBox title="Acceso FTP a carpeta existente" color="#fbbf24">
          <FieldGroup label="Tipo">
            <Select value={det.tipoAccesoFtp} onChange={(v) => updateDetail("c6", "tipoAccesoFtp", v)}
              options={["Acceso", "Modificación", "Quitar permiso"]} />
          </FieldGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="Servidor"><Input value={det.servidor} onChange={(v) => updateDetail("c6", "servidor", v)} placeholder="Ej: ftp.inei.gob.pe" /></FieldGroup>
            <FieldGroup label="Carpeta compartida"><Input value={det.carpeta} onChange={(v) => updateDetail("c6", "carpeta", v)} placeholder="Ej: /proyectos/encuesta2024" /></FieldGroup>
          </div>
          <FieldGroup label="Permiso">
            <Select value={det.permisos} onChange={(v) => updateDetail("c6", "permisos", v)} options={["Lectura", "Escritura", "Control Total"]} />
          </FieldGroup>
          <FieldGroup label="Justificación">
            <TextArea value={det.justificacion} onChange={(v) => updateDetail("c6", "justificacion", v)} placeholder="Justifique la necesidad de acceso FTP..." />
          </FieldGroup>
        </SectionBox>
      )}
    </div>
  );
}

// ---- C8: Base de Datos ----
function DetalleC8({ data, updateDetail }) {
  const det = data || {};
  const permisos = det.permisos || [];

  const togglePerm = (p) => {
    const checked = permisos.includes(p);
    updateDetail("c8", "permisos", checked ? permisos.filter((x) => x !== p) : [...permisos, p]);
  };

  return (
    <div>
      <FieldGroup label="Propósito de acceso / Justificación">
        <TextArea value={det.proposito} onChange={(v) => updateDetail("c8", "proposito", v)} placeholder="Describa el propósito del acceso a la base de datos..." />
      </FieldGroup>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="Nombre del Servidor"><Input value={det.servidor} onChange={(v) => updateDetail("c8", "servidor", v)} placeholder="Nombre del servidor" /></FieldGroup>
        <FieldGroup label="Nombre de la Base de Datos"><Input value={det.baseDatos} onChange={(v) => updateDetail("c8", "baseDatos", v)} placeholder="Nombre de la BD" /></FieldGroup>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="Tipo de Ambiente">
          <RadioGroup value={det.ambiente} onChange={(v) => updateDetail("c8", "ambiente", v)}
            options={["Desarrollo", "Producción"]} name="c8ambiente" />
        </FieldGroup>
        <FieldGroup label="Tipo de Acceso">
          <RadioGroup value={det.tipoAcceso} onChange={(v) => updateDetail("c8", "tipoAcceso", v)}
            options={["Permanente", "Temporal"]} name="c8tipoAcceso" />
        </FieldGroup>
      </div>
      {det.tipoAcceso === "Temporal" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <FieldGroup label="Fecha de Inicio"><Input type="date" value={det.fechaInicio} onChange={(v) => updateDetail("c8", "fechaInicio", v)} /></FieldGroup>
          <FieldGroup label="Fecha de Fin (del contrato)"><Input type="date" value={det.fechaFin} onChange={(v) => updateDetail("c8", "fechaFin", v)} /></FieldGroup>
        </div>
      )}
      <FieldGroup label="Tipo de permiso solicitado">
        {[
          "(i) Lectura de tablas y vistas",
          "(ii) Escritura de información en tablas",
          "(iii) Ejecución de procedimientos y funciones",
          "(iv) Permisos DDL",
        ].map((p) => (
          <Checkbox key={p} checked={permisos.includes(p)} onChange={() => togglePerm(p)} label={p} />
        ))}
      </FieldGroup>
      <FieldGroup label="Objetos específicos (tablas, vistas, etc.) — opcional">
        <Input value={det.objetos} onChange={(v) => updateDetail("c8", "objetos", v)} placeholder="Ej: tbl_encuesta, vw_resultados, sp_procesar" />
      </FieldGroup>
    </div>
  );
}

// ---- C9: Sistemas / Aplicativos (multi-usuario) ----
function DetalleC9({ data, updateDetail, updateDetailObj, form, setForm }) {
  const det = data || {};
  const usuarios = det.usuarios || [];

  const addUsuario = () => {
    const newUser = { dni: "", nombres: "", rol: "", correo: form.correo || "", fechaAlta: "", fechaBaja: "", modulo: "", tipoAcceso: "", otroAcceso: "", sustento: "" };
    updateDetail("c9", "usuarios", [...usuarios, newUser]);
  };

  const updateUsuario = (idx, key, val) => {
    const updated = usuarios.map((u, i) => i === idx ? { ...u, [key]: val } : u);
    updateDetail("c9", "usuarios", updated);
  };

  const removeUsuario = (idx) => {
    updateDetail("c9", "usuarios", usuarios.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <FieldGroup label="Nombre del Sistema / Proyecto">
        <Input value={det.sistema} onChange={(v) => updateDetail("c9", "sistema", v)} placeholder="Ej: SIGE, REDATAM" />
      </FieldGroup>

      <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, marginBottom: 8, marginTop: 8, textTransform: "uppercase" }}>
        Tabla de usuarios
      </div>

      {usuarios.map((u, i) => (
        <SectionBox key={i} title={`Usuario ${i + 1}`} color="#818cf8">
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8, marginBottom: 4 }}>
            <button onClick={() => removeUsuario(i)} style={{ background: "none", border: "none", color: theme.red, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕ Eliminar</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <FieldGroup label="DNI"><Input value={u.dni} onChange={(v) => updateUsuario(i, "dni", v)} placeholder="DNI" /></FieldGroup>
            <FieldGroup label="Apellidos y Nombres"><Input value={u.nombres} onChange={(v) => updateUsuario(i, "nombres", v)} placeholder="Apellidos y nombres" /></FieldGroup>
            <FieldGroup label="Rol / Cargo"><Input value={u.rol} onChange={(v) => updateUsuario(i, "rol", v)} placeholder="Rol o cargo" /></FieldGroup>
            <FieldGroup label="Correo institucional"><Input value={u.correo} onChange={(v) => updateUsuario(i, "correo", v)} placeholder="correo@inei.gob.pe" /></FieldGroup>
            <FieldGroup label="Fecha de alta"><Input type="date" value={u.fechaAlta} onChange={(v) => updateUsuario(i, "fechaAlta", v)} /></FieldGroup>
            <FieldGroup label="Fecha de baja"><Input type="date" value={u.fechaBaja} onChange={(v) => updateUsuario(i, "fechaBaja", v)} /></FieldGroup>
          </div>
          <FieldGroup label="Nombre del módulo / sub-sistema">
            <Input value={u.modulo} onChange={(v) => updateUsuario(i, "modulo", v)} placeholder="Ej: Módulo de consultas" />
          </FieldGroup>
          <FieldGroup label="Tipo de acceso">
            <Select value={u.tipoAcceso} onChange={(v) => updateUsuario(i, "tipoAcceso", v)}
              options={["Creación", "Desactivación", "Actualización", "Consulta", "Otro"]} />
          </FieldGroup>
          {u.tipoAcceso === "Otro" && (
            <FieldGroup label="Especificar tipo de acceso">
              <Input value={u.otroAcceso} onChange={(v) => updateUsuario(i, "otroAcceso", v)} placeholder="Especifique..." />
            </FieldGroup>
          )}
          <FieldGroup label="Sustento de uso">
            <TextArea value={u.sustento} onChange={(v) => updateUsuario(i, "sustento", v)} placeholder="Describa el sustento de uso para este usuario..." rows={2} />
          </FieldGroup>
        </SectionBox>
      ))}

      <button onClick={addUsuario} style={{
        padding: "8px 16px", borderRadius: 6, border: `1px dashed ${theme.border}`,
        background: "#fff", color: theme.accent, fontSize: 12, fontWeight: 600, cursor: "pointer",
      }}>+ Agregar usuario</button>
    </div>
  );
}

const tblInput = {
  width: "100%", padding: "4px 6px", borderRadius: 4, border: `1px solid ${theme.border}`,
  fontSize: 12, color: theme.text, background: "#fff", outline: "none",
};

// ============================================================
// STEP JUSTIFICACIÓN
// ============================================================
function StepJustificacion({ form, update }) {
  const fechaMinima = form.fechaInicioContrato || "";
  const fechaInicioInvalida = fechaMinima && form.periodoInicio && form.periodoInicio < fechaMinima;

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Justificación y Vigencia</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>Una sola justificación para todos los servicios solicitados</p>
      <FieldGroup label="Justificación de la solicitud *">
        <TextArea value={form.justificacion} onChange={(v) => update("justificacion", v)}
          placeholder="Describa el motivo por el cual solicita los accesos/servicios..." rows={4} />
      </FieldGroup>

      {/* Info de vigencia del contrato si existe */}
      {fechaMinima && (
        <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(108,138,255,0.06)", borderRadius: 8, border: "1px solid rgba(108,138,255,0.15)", fontSize: 13, color: theme.accent }}>
          <strong>Vigencia del contrato/orden:</strong> desde {fechaMinima}{form.periodoFin ? ` hasta ${form.periodoFin}` : " (sin fecha fin)"}
          <br />
          <span style={{ fontSize: 12, color: theme.text2 }}>La fecha de inicio del acceso debe ser igual o posterior a la fecha de inicio del contrato.</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <FieldGroup label="Período Inicio *">
          <input
            type="date"
            value={form.periodoInicio || ""}
            min={fechaMinima || undefined}
            onChange={(e) => update("periodoInicio", e.target.value)}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: `1px solid ${fechaInicioInvalida ? theme.red : theme.border}`,
              fontSize: 14, color: theme.text, background: theme.surface2, outline: "none",
            }}
          />
          {fechaInicioInvalida && (
            <div style={{ fontSize: 11, color: theme.red, marginTop: 4, fontWeight: 600 }}>
              La fecha debe ser igual o posterior al {fechaMinima}
            </div>
          )}
        </FieldGroup>
        <FieldGroup label="Período Fin">
          <Input type="date" value={form.periodoFin} onChange={(v) => update("periodoFin", v)} />
        </FieldGroup>
        <FieldGroup label="Tipo de Acceso">
          <Select value={form.tipoAcceso} onChange={(v) => update("tipoAcceso", v)} options={["Permanente", "Temporal"]} />
        </FieldGroup>
      </div>
      <div style={{ marginTop: 12, padding: 16, background: theme.surface2, borderRadius: 8, fontSize: 12, color: theme.text2, lineHeight: 1.6 }}>
        <strong style={{ color: theme.text }}>Compromiso del usuario:</strong> Reconozco que como usuario de los servicios y recursos informáticos del INEI, tendré acceso a datos e información privilegiada, los cuales debo proteger. Me comprometo a mantener y proteger mi contraseña, haciendo uso exclusivo de mis credenciales. Seré responsable por el uso de mi usuario y contraseña.
      </div>
    </div>
  );
}

// ============================================================
// STEP REVISIÓN
// ============================================================
function StepRevision({ form }) {
  const activeServices = SERVICES.filter((s) => form.servicios.includes(s.id));

  const renderServiceDetail = (svc) => {
    const det = form.detalles[svc.id] || {};
    switch (svc.id) {
      case "c1": {
        const items = [];
        if (det.tipoOperacion) items.push(["Tipo operación", det.tipoOperacion]);
        if (det.cuentaRed) {
          items.push(["Cuenta de red", `${det.tipoCuenta || "Personal"}${det.nombreGenerico ? ` (${det.nombreGenerico})` : ""}`]);
        }
        if (det.internet) {
          const perfLabel = { "1": "Perfil 1 - Avanzado", "2": "Perfil 2 - Intermedio", "3": "Perfil 3 - Básico" };
          let inet = perfLabel[det.perfilInternet] || "—";
          if (det.perfilInternet === "1" && det.redesSociales) inet += ` (${det.redesSociales})`;
          items.push(["Internet", inet]);
          if (det.justificacionInternet) items.push(["Justificación Internet", det.justificacionInternet]);
        }
        if (det.correoInst) {
          let corr = det.tipoCorreo || "—";
          if (det.tipoCorreo === "Aumento de capacidad de buzón" && det.capacidadBuzon) corr += ` — ${det.capacidadBuzon}`;
          items.push(["Correo institucional", corr]);
        }
        return items;
      }
      case "c4":
        return [
          ["Fecha inicio", det.fechaInicio || "—"], ["Fecha término", det.fechaFin || "—"],
          ...(det.justificacion ? [["Justificación", det.justificacion]] : []),
        ];
      case "c5":
        return [
          ["Fecha inicio", det.fechaInicio || "—"], ["Fecha término", det.fechaFin || "—"],
          ...(det.justificacion ? [["Justificación", det.justificacion]] : []),
        ];
      case "c6": {
        const items = [["Sub-tipo", det.subTipo === "generacion" ? "Generación de carpeta FTP" : det.subTipo === "acceso" ? "Acceso FTP" : "—"]];
        if (det.subTipo === "generacion") {
          items.push(["Jefe de área", det.jefeArea || "—"], ["Propósito", det.proposito || "—"]);
          if (det.usuarios?.length) items.push(["Usuarios con acceso", `${det.usuarios.length} usuario(s)`]);
        }
        if (det.subTipo === "acceso") {
          items.push(["Tipo", det.tipoAccesoFtp || "—"], ["Servidor", det.servidor || "—"], ["Carpeta", det.carpeta || "—"], ["Permiso", det.permisos || "—"]);
          if (det.justificacion) items.push(["Justificación", det.justificacion]);
        }
        return items;
      }
      case "c7":
        return [
          ["Tipo solicitud", det.tipoSolicitud || "—"],
          ["Servidor", det.servidor || "—"], ["Carpeta", det.carpeta || "—"],
          ["Permiso", det.permisos || "—"],
          ...(det.justificacion ? [["Justificación", det.justificacion]] : []),
        ];
      case "c8": {
        const items = [];
        if (det.proposito) items.push(["Propósito", det.proposito]);
        items.push(["Servidor", det.servidor || "—"], ["BD", det.baseDatos || "—"]);
        items.push(["Ambiente", det.ambiente || "—"], ["Tipo acceso", det.tipoAcceso || "—"]);
        if (det.tipoAcceso === "Temporal") items.push(["Período", `${det.fechaInicio || "—"} al ${det.fechaFin || "—"}`]);
        if (det.permisos?.length) items.push(["Permisos", det.permisos.join("; ")]);
        if (det.objetos) items.push(["Objetos", det.objetos]);
        return items;
      }
      case "c9": {
        const items = [["Sistema/Proyecto", det.sistema || "—"]];
        if (det.usuarios?.length) items.push(["Usuarios registrados", `${det.usuarios.length} usuario(s)`]);
        return items;
      }
      default:
        return [];
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Revisión Final</h3>
      <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>Verifica que toda la información sea correcta antes de generar el PDF</p>

      <div style={{ display: "grid", gap: 16 }}>
        <ReviewBlock title="Datos Generales" items={[
          ["N° Solicitud", form.id], ["Fecha", form.fecha],
          ["Operación", form.operacion], ["Oficina", form.oficina], ["Sede", form.sede],
        ]} />
        <ReviewBlock title="Datos del Usuario" items={[
          ["Nombre", form.nombres], ["DNI", form.dni], ["Vínculo", form.vinculo],
          ["Cargo", form.cargo], ["Correo", form.correo || "—"], ["Teléfono", form.telefono || "—"],
          ["O.S.", form.ordenServicio || "—"],
        ]} />

        {/* Per-service details */}
        {activeServices.map((svc) => {
          const items = renderServiceDetail(svc);
          return items.length > 0 ? (
            <ReviewBlock key={svc.id} title={`${svc.icon} ${svc.label}`} items={items} />
          ) : null;
        })}

        <ReviewBlock title="Justificación" items={[
          ["Justificación", form.justificacion || "—"],
          ["Período", `${form.periodoInicio || "—"} al ${form.periodoFin || "—"}`],
          ["Tipo", form.tipoAcceso],
        ]} />
      </div>

      <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(5,150,105,0.06)", borderRadius: 8, border: "1px solid rgba(5,150,105,0.15)" }}>
        <p style={{ fontSize: 13, color: theme.green, fontWeight: 600 }}>
          ✓ Al generar el PDF, la solicitud pasará a estado "Generado". Podrás imprimir el documento, firmarlo y luego subir el escaneo.
        </p>
      </div>
    </div>
  );
}

function ReviewBlock({ title, items }) {
  return (
    <div style={{ padding: 16, background: theme.surface2, borderRadius: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
        {items.map(([label, value], i) => (
          <div key={i} style={{ fontSize: 13, gridColumn: (value && value.length > 60) ? "1 / -1" : undefined }}>
            <span style={{ color: theme.text2 }}>{label}: </span>
            <span style={{ color: theme.text, fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// DETAIL VIEW
// ============================================================
function DetailView({ sol, onBack, onStatusChange, onUploadFirmado, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const st = STATUS_MAP[sol.status];
  const activeServices = SERVICES.filter((s) => sol.servicios.includes(s.id));

  const generatePdfContent = () => {
    const d = (svcId) => sol.detalles[svcId] || {};

    // Build detailed HTML per service
    let servicesHtml = activeServices.map((svc) => {
      const det = d(svc.id);
      let detailRows = "";

      if (svc.id === "c1") {
        const parts = [];
        if (det.tipoOperacion) parts.push(`<b>Tipo operación:</b> ${det.tipoOperacion}`);
        if (det.cuentaRed) {
          let cta = `Cuenta de red: ${det.tipoCuenta || "Personal"}`;
          if (det.nombreGenerico) cta += ` (${det.nombreGenerico})`;
          parts.push(cta);
        }
        if (det.internet) {
          const perfLabel = { "1": "Perfil 1 - Avanzado", "2": "Perfil 2 - Intermedio", "3": "Perfil 3 - Básico" };
          let inet = `Internet: ${perfLabel[det.perfilInternet] || "—"}`;
          if (det.perfilInternet === "1" && det.redesSociales) inet += ` (${det.redesSociales})`;
          parts.push(inet);
          if (det.justificacionInternet) parts.push(`<i>Justificación:</i> ${det.justificacionInternet}`);
        }
        if (det.correoInst) {
          let corr = `Correo: ${det.tipoCorreo || "—"}`;
          if (det.capacidadBuzon) corr += ` — Capacidad: ${det.capacidadBuzon}`;
          parts.push(corr);
        }
        detailRows = parts.join("<br>");
      }
      else if (svc.id === "c4") {
        detailRows = `Inicio: ${det.fechaInicio || "—"} | Término: ${det.fechaFin || "—"}`;
        if (det.justificacion) detailRows += `<br><i>Justificación:</i> ${det.justificacion}`;
      }
      else if (svc.id === "c5") {
        detailRows = `Inicio: ${det.fechaInicio || "—"} | Término: ${det.fechaFin || "—"}`;
        if (det.justificacion) detailRows += `<br><i>Justificación:</i> ${det.justificacion}`;
      }
      else if (svc.id === "c6") {
        if (det.subTipo === "generacion") {
          detailRows = `<b>Generación de carpeta FTP</b><br>Jefe de área: ${det.jefeArea || "—"}<br>Propósito: ${det.proposito || "—"}`;
          if (det.usuarios?.length) {
            detailRows += `<br><table style="width:100%;border-collapse:collapse;margin-top:4px;"><tr>${["Área", "Proyecto", "DNI", "Nombre", "Apellidos", "Lec.", "Esc."].map(h => `<th style="padding:3px 5px;border:1px solid #ccc;font-size:9px;background:#f0f0f0;">${h}</th>`).join("")}</tr>`;
            det.usuarios.forEach(u => {
              detailRows += `<tr><td style="padding:2px 5px;border:1px solid #ccc;font-size:9px;">${u.area}</td><td style="padding:2px 5px;border:1px solid #ccc;font-size:9px;">${u.proyecto}</td><td style="padding:2px 5px;border:1px solid #ccc;font-size:9px;">${u.dni}</td><td style="padding:2px 5px;border:1px solid #ccc;font-size:9px;">${u.nombre}</td><td style="padding:2px 5px;border:1px solid #ccc;font-size:9px;">${u.apellidos}</td><td style="padding:2px 5px;border:1px solid #ccc;font-size:9px;text-align:center;">${u.lectura ? "✓" : ""}</td><td style="padding:2px 5px;border:1px solid #ccc;font-size:9px;text-align:center;">${u.escritura ? "✓" : ""}</td></tr>`;
            });
            detailRows += `</table>`;
          }
        } else if (det.subTipo === "acceso") {
          detailRows = `<b>Acceso FTP</b><br>Tipo: ${det.tipoAccesoFtp || "—"} | Servidor: ${det.servidor || "—"} | Carpeta: ${det.carpeta || "—"} | Permiso: ${det.permisos || "—"}`;
          if (det.justificacion) detailRows += `<br><i>Justificación:</i> ${det.justificacion}`;
        } else {
          detailRows = "—";
        }
      }
      else if (svc.id === "c7") {
        detailRows = `Tipo: ${det.tipoSolicitud || "—"} | Servidor: ${det.servidor || "—"} | Carpeta: ${det.carpeta || "—"} | Permiso: ${det.permisos || "—"}`;
        if (det.justificacion) detailRows += `<br><i>Justificación:</i> ${det.justificacion}`;
      }
      else if (svc.id === "c8") {
        detailRows = `Servidor: ${det.servidor || "—"} | BD: ${det.baseDatos || "—"} | Ambiente: ${det.ambiente || "—"} | Acceso: ${det.tipoAcceso || "—"}`;
        if (det.tipoAcceso === "Temporal") detailRows += ` (${det.fechaInicio || "—"} al ${det.fechaFin || "—"})`;
        if (det.permisos?.length) detailRows += `<br><b>Permisos:</b> ${det.permisos.join("; ")}`;
        if (det.objetos) detailRows += `<br><b>Objetos:</b> ${det.objetos}`;
        if (det.proposito) detailRows += `<br><i>Propósito:</i> ${det.proposito}`;
      }
      else if (svc.id === "c9") {
        detailRows = `<b>Sistema:</b> ${det.sistema || "—"}`;
        if (det.usuarios?.length) {
          detailRows += `<br><table style="width:100%;border-collapse:collapse;margin-top:4px;"><tr>${["DNI", "Apellidos y Nombres", "Rol", "Correo", "Alta", "Baja", "Módulo", "Tipo Acceso", "Sustento"].map(h => `<th style="padding:3px 4px;border:1px solid #ccc;font-size:8px;background:#f0f0f0;">${h}</th>`).join("")}</tr>`;
          det.usuarios.forEach(u => {
            const tipoAcc = u.tipoAcceso === "Otro" ? (u.otroAcceso || "Otro") : (u.tipoAcceso || "—");
            detailRows += `<tr><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${u.dni}</td><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${u.nombres}</td><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${u.rol}</td><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${u.correo}</td><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${u.fechaAlta}</td><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${u.fechaBaja}</td><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${u.modulo}</td><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${tipoAcc}</td><td style="padding:2px 4px;border:1px solid #ccc;font-size:8px;">${u.sustento}</td></tr>`;
          });
          detailRows += `</table>`;
        }
      }

      return `<tr><td style="padding:6px 10px;border:1px solid #ccc;font-weight:600;vertical-align:top;width:25%;">${svc.icon} ${svc.label}</td><td style="padding:6px 10px;border:1px solid #ccc;">${detailRows}</td></tr>`;
    }).join("");

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@page{size:A4;margin:18mm 15mm;}
body{font-family:Arial,sans-serif;font-size:11px;color:#1e2330;line-height:1.5;}
h1{font-size:14px;text-align:center;margin:0 0 2px;}
h2{font-size:11px;background:#1a56db;color:#fff;padding:5px 10px;margin:14px 0 6px;border-radius:3px;}
.subtitle{text-align:center;font-size:10px;color:#666;margin-bottom:14px;}
table{width:100%;border-collapse:collapse;margin-bottom:10px;}
td,th{padding:5px 8px;border:1px solid #ccc;font-size:10.5px;}
th{background:#e8ecf4;font-weight:700;text-align:left;}
.sig-table td{border:1px solid #999;height:80px;vertical-align:top;padding:8px;width:50%;}
.sig-label{font-size:9px;color:#666;margin-bottom:4px;font-weight:700;text-transform:uppercase;}
.footer{text-align:center;font-size:8px;color:#999;margin-top:20px;border-top:1px solid #ddd;padding-top:6px;}
.id-box{text-align:center;font-size:12px;font-weight:700;color:#1a56db;margin:10px 0;padding:6px;border:2px solid #1a56db;border-radius:4px;}
.compromiso{font-size:9.5px;color:#444;background:#f7f7f7;padding:8px;border-radius:3px;margin:8px 0;}
</style></head><body>
<h1>SOLICITUD UNIFICADA DE ACCESOS Y SERVICIOS INFORMÁTICOS</h1>
<div class="subtitle">INSTITUTO NACIONAL DE ESTADÍSTICA E INFORMÁTICA — OTIN</div>
<div class="id-box">${sol.id} &nbsp;|&nbsp; Fecha: ${sol.fecha} &nbsp;|&nbsp; Operación: ${sol.operacion}</div>

<h2>A. DATOS GENERALES</h2>
<table><tr><th>Oficina / Dirección</th><td>${sol.oficina}</td><th>Sede</th><td>${sol.sede}</td></tr></table>

<h2>B. DATOS DEL USUARIO</h2>
<table>
<tr><th>Nombres y Apellidos</th><td colspan="3">${sol.nombres}</td></tr>
<tr><th>DNI</th><td>${sol.dni}</td><th>Vínculo</th><td>${sol.vinculo}</td></tr>
<tr><th>Cargo</th><td>${sol.cargo}</td><th>Correo</th><td>${sol.correo || "—"}</td></tr>
<tr><th>Teléfono</th><td>${sol.telefono || "—"}</td><th>N° O.S.</th><td>${sol.ordenServicio || "—"}</td></tr>
</table>

<h2>C. SERVICIOS SOLICITADOS</h2>
<table><tr><th style="width:25%;">Servicio</th><th>Detalle</th></tr>${servicesHtml}</table>

<h2>D. JUSTIFICACIÓN Y VIGENCIA</h2>
<table>
<tr><th>Justificación</th><td colspan="3">${sol.justificacion || "—"}</td></tr>
<tr><th>Período</th><td>${sol.periodoInicio || "—"} al ${sol.periodoFin || "—"}</td><th>Tipo</th><td>${sol.tipoAcceso}</td></tr>
</table>

<div class="compromiso"><strong>Compromiso del usuario:</strong> Reconozco que como usuario de los servicios y recursos informáticos del INEI, tendré acceso a datos e información privilegiada, los cuales debo proteger. Me comprometo a mantener y proteger mi contraseña, haciendo uso exclusivo de mis credenciales. Seré responsable por el uso de mi usuario y contraseña.</div>

<h2>E. FIRMAS Y APROBACIONES</h2>
<table class="sig-table">
<tr>
<td><div class="sig-label">Usuario Beneficiario</div><br><br><br><br>________________________<br>${sol.nombres}<br>DNI: ${sol.dni}<br>${sol.cargo}</td>
<td><div class="sig-label">Director Técnico / Nacional y/o Director Ejecutivo</div><br><br><br><br>________________________<br>Nombres:<br>Cargo:</td>
</tr>
</table>

${sol.servicios.includes("c8") ? `<table class="sig-table"><tr><td><div class="sig-label">Administrador DBA (Solo para BD)</div><br><br><br>________________________<br>Nombres:</td><td><div class="sig-label">USO INTERNO OTIN</div><br>Técnico asignado:________________ Fecha atención:________________<br>Observaciones:____________________________________________</td></tr></table>` : `<table class="sig-table"><tr><td colspan="2"><div class="sig-label">USO INTERNO OTIN</div><br>Técnico asignado:_________________________ Fecha atención:_________________________<br>Observaciones:_______________________________________________________________</td></tr></table>`}

<div class="footer">Documento generado por SASI – Sistema de Accesos y Servicios Informáticos — INEI | ${sol.id} | ${new Date().toLocaleString("es-PE")}</div>
</body></html>`;
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=800,height=1000");
    w.document.write(generatePdfContent());
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onUploadFirmado({ name: file.name, type: file.type, size: file.size, data: reader.result });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: theme.accent, fontSize: 13,
        fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0,
      }}>← Volver al panel</button>

      {/* Header card */}
      <div style={{
        background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`,
        padding: "24px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: 0 }}>{sol.id}</h2>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 20,
                background: st.bg, color: st.color,
              }}>{st.label}</span>
            </div>
            <p style={{ fontSize: 14, color: theme.text, margin: "0 0 4px" }}>{sol.nombres} — {sol.oficina}</p>
            <p style={{ fontSize: 12, color: theme.text2 }}>{sol.fecha} | {sol.sede} | {sol.operacion}</p>
          </div>
        </div>

        {/* Services */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
          {activeServices.map((svc) => (
            <span key={svc.id} style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: `${svc.color}12`, color: svc.color, border: `1px solid ${svc.color}25`,
            }}>{svc.icon} {svc.label}</span>
          ))}
        </div>
      </div>

      {/* Status flow */}
      <div style={{
        background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`,
        padding: "20px 24px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          Estado de la Solicitud
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {Object.entries(STATUS_MAP).map(([key, val], i) => {
            const keys = Object.keys(STATUS_MAP);
            const currentIdx = keys.indexOf(sol.status);
            const isActive = i <= currentIdx;
            const isCurrent = key === sol.status;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isActive ? val.color : theme.surface2,
                  color: isActive ? "#fff" : theme.text2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                  border: isCurrent ? `3px solid ${val.color}` : "3px solid transparent",
                  boxShadow: isCurrent ? `0 0 0 3px ${val.color}30` : "none",
                }}>{i + 1}</div>
                <div style={{ marginLeft: 6, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isActive ? val.color : theme.text2 }}>{val.label}</div>
                </div>
                {i < 3 && <div style={{ width: 20, height: 2, background: isActive && i < currentIdx ? val.color : theme.border, margin: "0 4px" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions based on status */}
      <div style={{
        background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`,
        padding: "20px 24px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          Acciones
        </div>

        {sol.status === "borrador" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13, color: theme.text2 }}>Esta solicitud está en borrador. Puedes editarla o eliminarla.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onBack} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Editar</button>
              <button onClick={() => onDelete()} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: theme.red, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Eliminar</button>
            </div>
          </div>
        )}

        {sol.status === "generado" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 14, background: "rgba(108,138,255,0.06)", borderRadius: 8, border: "1px solid rgba(108,138,255,0.15)" }}>
              <p style={{ fontSize: 13, color: theme.accent, fontWeight: 600, marginBottom: 8 }}>📄 Paso 1: Imprimir el documento para firmas</p>
              <button onClick={handlePrint} style={{
                padding: "10px 24px", borderRadius: 8, border: "none",
                background: theme.accent, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>🖨 Imprimir / Guardar PDF</button>
            </div>
            <div style={{ padding: 14, background: "rgba(251,191,36,0.06)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.15)" }}>
              <p style={{ fontSize: 13, color: theme.orange, fontWeight: 600, marginBottom: 8 }}>📤 Paso 2: Subir documento firmado y sellado</p>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} style={{ display: "none" }} />
              <button onClick={() => fileRef.current.click()} disabled={uploading} style={{
                padding: "10px 24px", borderRadius: 8, border: "none",
                background: uploading ? "#ccc" : "#d97706", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>{uploading ? "Subiendo..." : "📎 Subir archivo firmado (PDF o imagen)"}</button>
            </div>
          </div>
        )}

        {sol.status === "firmado" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 14, background: "rgba(251,191,36,0.06)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.15)" }}>
              <p style={{ fontSize: 13, color: theme.orange, fontWeight: 600 }}>
                ✓ Documento firmado subido: <span style={{ fontWeight: 400 }}>{sol.archivoFirmado?.name}</span>
                <span style={{ color: theme.text2, fontWeight: 400 }}> ({(sol.archivoFirmado?.size / 1024).toFixed(0)} KB)</span>
              </p>
            </div>
            {sol.archivoFirmado?.data && sol.archivoFirmado.type?.startsWith("image") && (
              <div style={{ border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", maxHeight: 300 }}>
                <img src={sol.archivoFirmado.data} alt="Doc firmado" style={{ width: "100%", objectFit: "contain" }} />
              </div>
            )}
            <button onClick={() => onStatusChange("atendido")} style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #059669, #34d399)", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer", alignSelf: "flex-start",
            }}>✓ Marcar como Atendido</button>
          </div>
        )}

        {sol.status === "atendido" && (
          <div style={{ padding: 14, background: "rgba(5,150,105,0.06)", borderRadius: 8, border: "1px solid rgba(5,150,105,0.15)" }}>
            <p style={{ fontSize: 14, color: theme.green, fontWeight: 600 }}>
              ✅ Solicitud completada y atendida
            </p>
            <p style={{ fontSize: 12, color: theme.text2, marginTop: 4 }}>
              Todos los servicios de esta solicitud han sido procesados.
            </p>
          </div>
        )}

        {/* Always allow reprint */}
        {(sol.status === "firmado" || sol.status === "atendido") && (
          <button onClick={handlePrint} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${theme.border}`,
            background: "#fff", color: theme.text2, fontWeight: 500, fontSize: 12, cursor: "pointer", marginTop: 10,
          }}>🖨 Reimprimir documento</button>
        )}
      </div>

      {/* Quick summary of details */}
      <div style={{
        background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`,
        padding: "20px 24px",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          Resumen de la Solicitud
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: 13 }}>
          <div><span style={{ color: theme.text2 }}>DNI: </span><span style={{ fontWeight: 600 }}>{sol.dni}</span></div>
          <div><span style={{ color: theme.text2 }}>Vínculo: </span><span style={{ fontWeight: 600 }}>{sol.vinculo}</span></div>
          <div><span style={{ color: theme.text2 }}>Cargo: </span><span style={{ fontWeight: 600 }}>{sol.cargo}</span></div>
          <div><span style={{ color: theme.text2 }}>Correo: </span><span style={{ fontWeight: 600 }}>{sol.correo || "—"}</span></div>
          <div><span style={{ color: theme.text2 }}>Período: </span><span style={{ fontWeight: 600 }}>{sol.periodoInicio || "—"} al {sol.periodoFin || "—"}</span></div>
          <div><span style={{ color: theme.text2 }}>Tipo: </span><span style={{ fontWeight: 600 }}>{sol.tipoAcceso}</span></div>
        </div>
        {sol.justificacion && (
          <div style={{ marginTop: 12, padding: 10, background: theme.surface2, borderRadius: 6, fontSize: 12, color: theme.text }}>
            <span style={{ color: theme.text2, fontWeight: 600 }}>Justificación: </span>{sol.justificacion}
          </div>
        )}
      </div>
    </div>
  );
}
