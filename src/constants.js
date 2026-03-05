export const SERVICES = [
  { id: "c1", label: "Cuenta de Red / Internet / Correo", icon: "\uD83D\uDDA7", color: "#6c8aff" },
  { id: "c4", label: "Acceso Remoto (VPN)", icon: "\uD83D\uDD17", color: "#fb923c" },
  { id: "c5", label: "Desbloqueo USB", icon: "\uD83D\uDD0C", color: "#f87171" },
  { id: "c6", label: "Carpeta FTP", icon: "\uD83D\uDCC2", color: "#fbbf24" },
  { id: "c7", label: "Recursos Compartidos", icon: "\uD83D\uDCC1", color: "#2dd4bf" },
  { id: "c8", label: "Base de Datos", icon: "\uD83D\uDDC4", color: "#f472b6" },
  { id: "c9", label: "Sistemas / Aplicativos", icon: "\u2699", color: "#818cf8" },
];

export const STATUS_MAP = {
  borrador: { label: "Borrador", color: "#8b90a5", bg: "rgba(139,144,165,0.12)" },
  enviado: { label: "Enviado", color: "#6c8aff", bg: "rgba(108,138,255,0.12)" },
  en_revision: { label: "En Revisión", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  observado: { label: "Observado", color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  aprobado: { label: "Aprobado", color: "#059669", bg: "rgba(5,150,105,0.12)" },
  atendido: { label: "Atendido", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  rechazado: { label: "Rechazado", color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
};

export const VINCULOS = ["Nombrado", "CAS", "Locador / O.S.", "Otros"];
export const SEDES = ["Sede Central", "Sede Arenales", "Sede Salas", "Sede Regional", "Otra"];

export const emptyForm = () => ({
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

export const theme = {
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
