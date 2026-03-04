import { useState, useEffect, useRef, useCallback } from "react";
import ineiLogo from "./assets/INEI-LOG.png";

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
  enviado: { label: "Enviado", color: "#6c8aff", bg: "rgba(108,138,255,0.12)" },
  en_revision: { label: "En Revisión", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  observado: { label: "Observado", color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  aprobado: { label: "Aprobado", color: "#059669", bg: "rgba(5,150,105,0.12)" },
  atendido: { label: "Atendido", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  rechazado: { label: "Rechazado", color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
};

const VINCULOS = ["Nombrado", "CAS", "Locador / O.S.", "Otros"];
// OPERACIONES removed — each service (e.g. C1) has its own tipoOperacion
const SEDES = ["Sede Central", "Sede Arenales", "Sede Salas", "Sede Regional", "Otra"];

const emptyForm = () => ({
  id: "SOL-" + String(Date.now()).slice(-6),
  fecha: new Date().toISOString().split("T")[0],
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
  periodoInicio: "",
  periodoFin: "",
  fechaInicioContrato: "",
  tipoAcceso: "Temporal",
  status: "borrador",
  createdAt: Date.now(),
  archivoFirmadoNombre: null,
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
// API HELPERS
// ============================================================
const api = {
  async post(url, data) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Error"); }
    return r.json();
  },
  async put(url, data) {
    const r = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Error"); }
    return r.json();
  },
  async get(url) {
    const r = await fetch(url);
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Error"); }
    return r.json();
  },
  async del(url) {
    const r = await fetch(url, { method: "DELETE" });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Error"); }
    return r.json();
  },
};

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [session, setSession] = useState(null); // null=login, {rol, datos}

  if (!session) return <LoginScreen onLogin={setSession} />;
  if (session.rol === "admin") return <PanelAdmin session={session} onLogout={() => setSession(null)} />;
  return <PortalUsuario session={session} onLogout={() => setSession(null)} />;
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState("usuario");
  const [dni, setDni] = useState("");
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsuarioLogin = async () => {
    if (dni.length !== 8) { setError("El DNI debe tener 8 dígitos"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/login/usuario", { dni });
      onLogin(res);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    if (!usuario || !clave) { setError("Complete ambos campos"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/login/admin", { usuario, clave });
      onLogin(res);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={ineiLogo} alt="INEI" style={{ height: 64, marginBottom: 12 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.text, marginBottom: 4 }}>SASI – INEI</h1>
          <p style={{ fontSize: 12, color: theme.text2 }}>Sistema de Accesos y Servicios Informáticos</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: theme.surface2, borderRadius: 10, padding: 4 }}>
          {[{ key: "usuario", label: "Soy Usuario" }, { key: "admin", label: "Soy Administrador" }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(""); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
              background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? theme.accent : theme.text2,
              boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {tab === "usuario" ? (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.text2, marginBottom: 6, textTransform: "uppercase" }}>DNI</label>
            <input value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Ingrese su DNI (8 dígitos)"
              onKeyDown={e => e.key === "Enter" && handleUsuarioLogin()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 16, letterSpacing: 2, fontWeight: 600, outline: "none", background: theme.surface2, boxSizing: "border-box" }} />
            <button onClick={handleUsuarioLogin} disabled={loading} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none", background: theme.accent, color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer", marginTop: 16, opacity: loading ? 0.7 : 1,
            }}>{loading ? "Verificando..." : "Ingresar"}</button>
          </div>
        ) : (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.text2, marginBottom: 6, textTransform: "uppercase" }}>Usuario</label>
            <input value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Usuario administrador"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 14, outline: "none", background: theme.surface2, marginBottom: 12, boxSizing: "border-box" }} />
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.text2, marginBottom: 6, textTransform: "uppercase" }}>Contraseña</label>
            <input type="password" value={clave} onChange={e => setClave(e.target.value)} placeholder="Contraseña"
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 14, outline: "none", background: theme.surface2, boxSizing: "border-box" }} />
            <button onClick={handleAdminLogin} disabled={loading} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none", background: theme.accent, color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer", marginTop: 16, opacity: loading ? 0.7 : 1,
            }}>{loading ? "Verificando..." : "Ingresar"}</button>
          </div>
        )}

        {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(220,38,38,0.08)", borderRadius: 8, fontSize: 13, color: theme.red, fontWeight: 600 }}>{error}</div>}
      </div>
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================
function Header({ session, onLogout, onHome, rightContent }) {
  return (
    <div style={{
      background: "#fff", borderBottom: `1px solid ${theme.border}`, padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={onHome}>
        <img src={ineiLogo} alt="INEI" style={{ height: 36 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: theme.text, lineHeight: 1.2 }}>SASI – INEI</div>
          <div style={{ fontSize: 10, color: theme.text2, letterSpacing: 0.5 }}>Sistema de Accesos y Servicios Informáticos</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {rightContent}
        <div style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{session.datos.nombres || session.datos.nombre}</div>
        <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, background: session.rol === "admin" ? "rgba(220,38,38,0.1)" : "rgba(26,86,219,0.1)", color: session.rol === "admin" ? theme.red : theme.accent, fontWeight: 700 }}>
          {session.rol === "admin" ? "ADMIN" : "USUARIO"}
        </span>
        <button onClick={onLogout} style={{ background: "none", border: `1px solid ${theme.border}`, padding: "6px 14px", borderRadius: 8, fontSize: 12, color: theme.text2, cursor: "pointer", fontWeight: 600 }}>Cerrar sesión</button>
      </div>
    </div>
  );
}

// ============================================================
// PORTAL USUARIO
// ============================================================
function PortalUsuario({ session, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [solicitudes, setSolicitudes] = useState([]);
  const [perfilTi, setPerfilTi] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sols, perfil] = await Promise.all([
        api.get(`/api/solicitudes?dni=${session.datos.dni}`),
        api.get(`/api/perfil-ti/${session.datos.dni}`),
      ]);
      setSolicitudes(sols);
      setPerfilTi(perfil);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [session.datos.dni]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleNew = () => {
    const f = emptyForm();
    f.dni = session.datos.dni;
    f.nombres = session.datos.nombres;
    f.cargo = session.datos.cargo;
    f.correo = session.datos.correo;
    f.telefono = session.datos.telefono;
    f.vinculo = session.datos.vinculo;
    f.oficina = session.datos.oficina;
    f.sede = session.datos.sede;
    f.ordenServicio = session.datos.ordenServicio || "";
    f.fechaInicioContrato = session.datos.fechaInicio || "";
    f.periodoFin = session.datos.fechaFin || "";
    f.tipoAcceso = "Temporal";
    setCurrentForm(f);
    setStep(0);
    setView("form");
  };

  const handleEdit = (sol) => {
    setCurrentForm({ ...sol });
    setStep(0);
    setView("form");
  };

  const handleSave = async (form) => {
    try {
      const existing = solicitudes.find(s => s.id === form.id);
      if (existing) {
        await api.put(`/api/solicitudes/${form.id}`, form);
      } else {
        await api.post("/api/solicitudes", form);
      }
      await loadData();
    } catch (e) { console.error(e); alert("Error al guardar: " + e.message); }
  };

  const handleDelete = async (id) => {
    try {
      await api.del(`/api/solicitudes/${id}`);
      await loadData();
      setView("dashboard");
    } catch (e) { console.error(e); alert("Error: " + e.message); }
  };

  const handleGenerate = async (form) => {
    const updated = { ...form, status: "enviado" };
    await handleSave(updated);
    setCurrentForm(updated);
    setView("detail");
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Header session={session} onLogout={onLogout} onHome={() => setView("dashboard")}
        rightContent={<button onClick={() => handleNew()} style={{ background: theme.accent, color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nueva Solicitud</button>} />

      {view === "dashboard" && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
          {/* Perfil TI */}
          <PerfilTISection perfilTi={perfilTi} onActualizar={(svcId) => {
            const f = emptyForm();
            f.dni = session.datos.dni; f.nombres = session.datos.nombres;
            f.cargo = session.datos.cargo; f.correo = session.datos.correo;
            f.telefono = session.datos.telefono; f.vinculo = session.datos.vinculo;
            f.oficina = session.datos.oficina; f.sede = session.datos.sede;
            f.ordenServicio = session.datos.ordenServicio || "";
            f.fechaInicioContrato = session.datos.fechaInicio || "";
            f.tipoAcceso = "Temporal";
            f.servicios = [svcId];
            const perfItem = perfilTi.find(p => p.servicioId === svcId);
            if (perfItem) f.detalles = { [svcId]: perfItem.config || {} };
            setCurrentForm(f); setStep(0); setView("form");
          }} onBaja={(svcId) => {
            const f = emptyForm();
            f.dni = session.datos.dni; f.nombres = session.datos.nombres;
            f.cargo = session.datos.cargo; f.correo = session.datos.correo;
            f.telefono = session.datos.telefono; f.vinculo = session.datos.vinculo;
            f.oficina = session.datos.oficina; f.sede = session.datos.sede;
            f.ordenServicio = session.datos.ordenServicio || "";
            f.fechaInicioContrato = session.datos.fechaInicio || "";
            f.tipoAcceso = "Temporal";
            f.servicios = [svcId];
            setCurrentForm(f); setStep(0); setView("form");
          }} />

          {/* Solicitudes */}
          <DashboardUsuario solicitudes={solicitudes} loading={loading} onNew={() => handleNew()} onEdit={handleEdit}
            onView={(sol) => { setCurrentForm(sol); setView("detail"); }} />
        </div>
      )}

      {view === "form" && currentForm && (
        <FormWizard form={currentForm} setForm={setCurrentForm} step={step} setStep={setStep}
          onSave={handleSave} onCancel={() => setView("dashboard")} onGenerate={handleGenerate}
          perfilTi={perfilTi} session={session} />
      )}

      {view === "detail" && currentForm && (
        <DetailView sol={currentForm} onBack={() => { loadData(); setView("dashboard"); }}
          onDelete={() => handleDelete(currentForm.id)} session={session} />
      )}
    </div>
  );
}

// ============================================================
// PERFIL TI SECTION
// ============================================================
function PerfilTISection({ perfilTi, onActualizar, onBaja }) {
  if (!perfilTi || perfilTi.length === 0) return (
    <div style={{ marginBottom: 28, padding: "20px 24px", background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}` }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Mi Perfil TI</h2>
      <p style={{ fontSize: 13, color: theme.text2 }}>No tienes servicios activos. Crea una solicitud para obtener accesos.</p>
    </div>
  );

  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Mi Perfil TI — Servicios Activos</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {perfilTi.map(item => {
          const svc = SERVICES.find(s => s.id === item.servicioId);
          if (!svc) return null;
          const isTemp = item.vigencia;
          return (
            <div key={item.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "16px 20px", borderLeft: `4px solid ${svc.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{svc.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{svc.label}</span>
              </div>
              <div style={{ fontSize: 12, color: theme.text2, marginBottom: 4 }}>Otorgado: {item.fechaOtorgado || "—"}</div>
              <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 12, fontWeight: 700, background: isTemp ? "rgba(217,119,6,0.1)" : "rgba(5,150,105,0.1)", color: isTemp ? theme.orange : theme.green }}>
                {isTemp ? `Vence: ${item.vigencia}` : "Permanente"}
              </span>
              {/* Config summary */}
              {item.config && Object.keys(item.config).length > 0 && (
                <div style={{ marginTop: 8, padding: 8, background: theme.surface2, borderRadius: 6, fontSize: 11, color: theme.text2 }}>
                  {Object.entries(item.config).slice(0, 3).map(([k, v]) => (
                    <div key={k}><strong>{k}:</strong> {typeof v === "object" ? JSON.stringify(v) : String(v)}</div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={() => onActualizar(item.servicioId)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${theme.accent}`, background: "#fff", color: theme.accent, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Actualizar</button>
                <button onClick={() => onBaja(item.servicioId)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${theme.red}`, background: "#fff", color: theme.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Dar de baja</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD USUARIO
// ============================================================
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

// ============================================================
// FORM WIZARD
// ============================================================
const STEPS = [
  { label: "Datos de la Solicitud", icon: "👤" },
  { label: "Servicios", icon: "🔧" },
  { label: "Detalle Técnico", icon: "⚙" },
  { label: "Documento", icon: "📄" },
];

function FormWizard({ form, setForm, step, setStep, onSave, onCancel, onGenerate, perfilTi, session }) {
  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const updateDetail = (svcId, key, val) =>
    setForm(f => ({ ...f, detalles: { ...f.detalles, [svcId]: { ...(f.detalles[svcId] || {}), [key]: val } } }));

  const maxStep = STEPS.length - 1;

  const canNext = () => {
    if (step === 0) return form.nombres && form.dni && form.vinculo && form.cargo && form.oficina && form.sede;
    if (step === 1) return form.servicios.length > 0;
    return true;
  };

  // In step 3 (Documento), all actions are inside the step itself
  const showNavButtons = step < 3;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 28, overflowX: "auto" }}>
        {STEPS.map((s, i) => (
          <div key={i} onClick={() => i <= step && setStep(i)} style={{
            flex: 1, minWidth: 80, textAlign: "center", padding: "10px 4px",
            borderBottom: `3px solid ${i === step ? theme.accent : i < step ? theme.green : theme.border}`,
            cursor: i <= step ? "pointer" : "default",
          }}>
            <div style={{ fontSize: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: i === step ? 700 : 500, color: i === step ? theme.accent : i < step ? theme.green : theme.text2, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "28px 24px", marginBottom: 20 }}>
        {step === 0 && <StepDatosSolicitud form={form} update={update} session={session} />}
        {step === 1 && <StepServicios form={form} setForm={setForm} perfilTi={perfilTi} />}
        {step === 2 && <StepDetalle form={form} setForm={setForm} updateDetail={updateDetail} />}
        {step === 3 && <StepDocumento form={form} onSave={onSave} onGenerate={onGenerate} />}
      </div>

      {showNavButtons && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button onClick={step === 0 ? onCancel : () => setStep(step - 1)} style={{
            padding: "10px 20px", borderRadius: 8, border: `1px solid ${theme.border}`,
            background: "#fff", color: theme.text2, fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>{step === 0 ? "Cancelar" : "← Anterior"}</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onSave(form)} style={{
              padding: "10px 16px", borderRadius: 8, border: `1px solid ${theme.border}`,
              background: "#fff", color: theme.text2, fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}>Guardar borrador</button>
            <button disabled={!canNext()} onClick={() => setStep(step + 1)} style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: canNext() ? theme.accent : "#ccc", color: "#fff",
              fontWeight: 600, fontSize: 13, cursor: canNext() ? "pointer" : "not-allowed",
            }}>Siguiente →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FORM COMPONENTS
// ============================================================
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
    <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 14, color: theme.text, background: disabled ? "#eee" : theme.surface2, outline: "none", cursor: disabled ? "not-allowed" : undefined, boxSizing: "border-box", ...extraStyle }}
      onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 14, color: theme.text, background: theme.surface2, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ""} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${theme.border}`,
      fontSize: 14, color: value ? theme.text : theme.text2, background: theme.surface2, outline: "none", boxSizing: "border-box",
    }}>
      <option value="">{placeholder || "Seleccionar..."}</option>
      {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, cursor: "pointer" }}>
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function RadioGroup({ value, onChange, options, name }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {options.map(o => {
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

// ============================================================
// FORM STEPS
// ============================================================
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

// ============================================================
// STEP DETALLE
// ============================================================
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
      {openTab === "c4" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FieldGroup label="Fecha de Inicio"><Input type="date" value={d("c4").fechaInicio} onChange={v => updateDetail("c4", "fechaInicio", v)} /></FieldGroup>
            <FieldGroup label="Fecha de Término"><Input type="date" value={d("c4").fechaFin} onChange={v => updateDetail("c4", "fechaFin", v)} /></FieldGroup>
          </div>
          <FieldGroup label="Justificación del acceso remoto"><TextArea value={d("c4").justificacion} onChange={v => updateDetail("c4", "justificacion", v)} placeholder="Indique el motivo por el cual requiere acceso VPN..." /></FieldGroup>
        </div>
      )}
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
          <FieldGroup label="Nivel de Permiso"><Select value={d("c7").permisos} onChange={v => updateDetail("c7", "permisos", v)} options={["Lectura", "Escritura", "Control Total"]} /></FieldGroup>
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
            <FieldGroup label="Perfil de Internet">
              <Select value={det.perfilInternet} onChange={v => updateDetail("c1", "perfilInternet", v)} options={[{ value: "1", label: "Perfil 1 - Avanzado" }, { value: "2", label: "Perfil 2 - Intermedio" }, { value: "3", label: "Perfil 3 - Básico" }]} />
            </FieldGroup>
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

const tblInput = { width: "100%", padding: "4px 6px", borderRadius: 4, border: `1px solid ${theme.border}`, fontSize: 12, color: theme.text, background: "#fff", outline: "none", boxSizing: "border-box" };

// ---- C6: Carpeta FTP ----
function DetalleC6({ data, updateDetail, form }) {
  const det = data || {};
  const usuarios = det.usuarios || [];
  const addUsuario = () => updateDetail("c6", "usuarios", [...usuarios, { area: form.oficina || "", proyecto: "", dni: "", nombre: "", apellidos: "", lectura: false, escritura: false }]);
  const updateUsuario = (idx, key, val) => updateDetail("c6", "usuarios", usuarios.map((u, i) => i === idx ? { ...u, [key]: val } : u));
  const removeUsuario = (idx) => updateDetail("c6", "usuarios", usuarios.filter((_, i) => i !== idx));

  return (
    <div>
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
      <FieldGroup label="Tipo de permiso solicitado">
        {["(i) Lectura de tablas y vistas", "(ii) Escritura de información en tablas", "(iii) Ejecución de procedimientos y funciones", "(iv) Permisos DDL"].map(p => (
          <Checkbox key={p} checked={permisos.includes(p)} onChange={() => togglePerm(p)} label={p} />
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

// ============================================================
// STEP DOCUMENTO
// ============================================================
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
      case "c4": return [["Fecha inicio", det.fechaInicio || "—"], ["Fecha término", det.fechaFin || "—"], ...(det.justificacion ? [["Justificación", det.justificacion]] : [])];
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
      } else if (svc.id === "c4" || svc.id === "c5") {
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
      } else if (svc.id === "c4" || svc.id === "c5") {
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

// ============================================================
// PANEL ADMINISTRADOR
// ============================================================
function PanelAdmin({ session, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [solicitudes, setSolicitudes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSol, setSelectedSol] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sols, emps, st] = await Promise.all([
        api.get("/api/solicitudes"),
        api.get("/api/empleados"),
        api.get("/api/stats"),
      ]);
      setSolicitudes(sols);
      setEmpleados(emps);
      setStats(st);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (solId, newStatus, comentario) => {
    try {
      await api.put(`/api/solicitudes/${solId}/status`, {
        status: newStatus,
        comentario: comentario || null,
        adminId: session.datos.id,
      });
      await loadData();
    } catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Header session={session} onLogout={onLogout} onHome={() => setView("dashboard")} />

      {/* Admin Navigation */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${theme.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 4 }}>
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "cola", label: "Cola de Aprobación" },
            { key: "todas", label: "Todas las Solicitudes" },
            { key: "empleados", label: "Empleados" },
          ].map(t => (
            <button key={t.key} onClick={() => { setView(t.key); setSelectedSol(null); }} style={{
              padding: "12px 20px", border: "none", borderBottom: `3px solid ${view === t.key ? theme.accent : "transparent"}`,
              background: "transparent", color: view === t.key ? theme.accent : theme.text2,
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {loading && <div style={{ textAlign: "center", padding: 40, color: theme.text2 }}>Cargando...</div>}

        {!loading && view === "dashboard" && <AdminDashboard stats={stats} />}
        {!loading && view === "cola" && <AdminCola solicitudes={solicitudes.filter(s => s.status === "enviado" || s.status === "en_revision")} onAction={handleStatusChange} onSelect={setSelectedSol} selectedSol={selectedSol} />}
        {!loading && view === "todas" && <AdminTodas solicitudes={solicitudes} onSelect={setSelectedSol} selectedSol={selectedSol} onAction={handleStatusChange} />}
        {!loading && view === "empleados" && <AdminEmpleados empleados={empleados} onReload={loadData} />}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN: DASHBOARD MÉTRICAS
// ============================================================
function AdminDashboard({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: "Pendientes", value: stats.pendientes || 0, color: "#6c8aff", bg: "rgba(108,138,255,0.1)" },
    { label: "En Proceso", value: stats.enProceso || 0, color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
    { label: "Atendidas (mes)", value: stats.atendidasMes || 0, color: "#059669", bg: "rgba(5,150,105,0.1)" },
    { label: "Rechazadas", value: stats.rechazadas || 0, color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 24 }}>Panel de Administración</h1>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "20px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.text2, textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Status bars */}
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "24px", marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 16 }}>Distribución por Estado</h3>
        {Object.entries(stats.byStatus || {}).map(([status, count]) => {
          const st = STATUS_MAP[status] || { label: status, color: "#999" };
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={status} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: theme.text }}>{st.label}</span>
                <span style={{ color: theme.text2 }}>{count}</span>
              </div>
              <div style={{ height: 8, background: theme.surface2, borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: st.color, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* By office */}
      {stats.byOficina?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, padding: "24px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 16 }}>Por Oficina</h3>
          {stats.byOficina.map((o, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 13 }}>
              <span style={{ color: theme.text }}>{o.oficina || "—"}</span>
              <span style={{ fontWeight: 700, color: theme.accent }}>{o.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN: COLA DE APROBACIÓN
// ============================================================
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

// ============================================================
// ADMIN: TODAS LAS SOLICITUDES
// ============================================================
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

// ============================================================
// ADMIN: GESTIÓN DE EMPLEADOS
// ============================================================
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
