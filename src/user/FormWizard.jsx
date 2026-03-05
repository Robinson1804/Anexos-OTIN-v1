import { theme } from "../constants";
import StepDatosSolicitud from "./StepDatosSolicitud";
import StepServicios from "./StepServicios";
import StepDetalle from "./StepDetalle";
import StepDocumento from "./StepDocumento";

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

export default FormWizard;
export { STEPS };
