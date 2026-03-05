import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { emptyForm, theme } from "../constants";
import Header from "../components/Header";
import DashboardUsuario from "./DashboardUsuario";
import PerfilTISection from "./PerfilTISection";
import FormWizard from "./FormWizard";
import DetailView from "./DetailView";

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

export default PortalUsuario;
