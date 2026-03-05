import { useState } from "react";
import LoginScreen from "./LoginScreen";
import PortalUsuario from "./user/PortalUsuario";
import PanelAdmin from "./admin/PanelAdmin";

export default function App() {
  const [session, setSession] = useState(null);
  if (!session) return <LoginScreen onLogin={setSession} />;
  if (session.rol === "admin") return <PanelAdmin session={session} onLogout={() => setSession(null)} />;
  return <PortalUsuario session={session} onLogout={() => setSession(null)} />;
}
