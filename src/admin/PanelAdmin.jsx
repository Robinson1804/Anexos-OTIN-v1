import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { theme } from "../constants";
import Header from "../components/Header";
import AdminDashboard from "./AdminDashboard";
import AdminCola from "./AdminCola";
import AdminTodas from "./AdminTodas";
import AdminEmpleados from "./AdminEmpleados";

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

export default PanelAdmin;
