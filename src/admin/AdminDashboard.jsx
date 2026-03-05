import { STATUS_MAP, theme } from "../constants";

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

export default AdminDashboard;
