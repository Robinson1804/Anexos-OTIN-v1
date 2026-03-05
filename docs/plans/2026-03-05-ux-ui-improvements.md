# UX/UI Improvements — Service Detail Forms

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enrich each service detail form (C1, C4, C6, C7, C8, C9) with contextual information, tooltips, disclaimers, and additional fields. Then refactor the 1900-line single file into clean modules.

**Architecture:** Phase 1 (Tasks 1-7): UI improvements in `SasiInei.jsx`. Phase 2 (Tasks 8-12): Split into ~20 focused module files. No backend changes needed.

**Tech Stack:** React (inline styles), Vite, single-file SPA → modular SPA

---

## Shared: InfoTooltip Component

Before modifying any service, we need a reusable tooltip/info component that shows explanatory text on hover or click.

### Task 1: Add InfoTooltip and InfoBox helper components

**Files:**
- Modify: `sasi-app/src/SasiInei.jsx:620-627` (after SectionBox, before FORM STEPS)

**Step 1: Add InfoTooltip component after SectionBox (line ~627)**

```jsx
function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 6, cursor: "pointer" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onClick={() => setShow(s => !s)}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "rgba(108,138,255,0.15)", color: theme.accent, fontSize: 11, fontWeight: 700 }}>?</span>
      {show && (
        <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#1e2330", color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 12, lineHeight: 1.5, width: 260, zIndex: 50, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", whiteSpace: "normal" }}>
          {text}
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #1e2330" }} />
        </div>
      )}
    </span>
  );
}
```

**Step 2: Add InfoBox component (for disclaimer/conditions blocks)**

```jsx
function InfoBox({ type, children }) {
  const styles = {
    warning: { bg: "rgba(217,119,6,0.06)", border: "rgba(217,119,6,0.2)", icon: "⚠", color: theme.orange },
    info: { bg: "rgba(108,138,255,0.06)", border: "rgba(108,138,255,0.2)", icon: "ℹ", color: theme.accent },
    conditions: { bg: "rgba(30,35,48,0.04)", border: "rgba(30,35,48,0.12)", icon: "📋", color: theme.text },
  };
  const s = styles[type] || styles.info;
  return (
    <div style={{ padding: "12px 16px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, marginBottom: 16, fontSize: 12, lineHeight: 1.6, color: s.color }}>
      <span style={{ marginRight: 6 }}>{s.icon}</span>{children}
    </div>
  );
}
```

**Step 3: Verify build**

Run: `cd sasi-app && npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/SasiInei.jsx
git commit -m "feat: add InfoTooltip and InfoBox reusable components"
```

---

## C1: Internet Profile Descriptions with Tooltips

### Task 2: Add profile descriptions to Internet section in DetalleC1

**Files:**
- Modify: `sasi-app/src/SasiInei.jsx` — `DetalleC1` function (line ~812-852)

**Step 1: Replace the internet FieldGroup label with tooltip**

Change the `<FieldGroup label="Perfil de Internet">` at line ~833 to include an InfoTooltip and add a description block below the Select showing what each profile includes.

Replace the internet section inside `{det.internet && ( ... )}` (lines ~831-839) with:

```jsx
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
```

**Step 2: Verify build**

Run: `cd sasi-app && npm run build`

**Step 3: Commit**

```bash
git add src/SasiInei.jsx
git commit -m "feat(C1): add internet profile descriptions with tooltips"
```

---

## C4: VPN — Additional Fields

### Task 3: Convert C4 from inline JSX to a proper DetalleC4 component with additional fields

**Files:**
- Modify: `sasi-app/src/SasiInei.jsx` — inline C4 at StepDetalle (lines ~776-783) and add new DetalleC4 component

**Step 1: Create DetalleC4 component (insert after DetalleC1, around line ~852)**

```jsx
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
```

**Step 2: Replace inline C4 in StepDetalle (line ~776-783)**

Replace:
```jsx
{openTab === "c4" && (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
      <FieldGroup label="Fecha de Inicio">...
    </div>
    <FieldGroup label="Justificación del acceso remoto">...
  </div>
)}
```

With:
```jsx
{openTab === "c4" && <DetalleC4 data={d("c4")} updateDetail={updateDetail} form={form} />}
```

**Step 3: Update StepDocumento's renderServiceDetail for c4 to include new fields**

In `renderServiceDetail` (line ~1011), update the c4 case:
```jsx
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
```

**Step 4: Update both generatePdfContent functions for C4 (in StepDocumento ~line 1042 and DetailView ~line 1235)**

Replace the c4 PDF rows with:
```js
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
```

**Step 5: Verify build**

Run: `cd sasi-app && npm run build`

**Step 6: Commit**

```bash
git add src/SasiInei.jsx
git commit -m "feat(C4): add VPN fields - usuario red, IP, host, correo personal, telefono"
```

---

## C6: FTP Disclaimer

### Task 4: Add responsibility disclaimer to FTP section

**Files:**
- Modify: `sasi-app/src/SasiInei.jsx` — `DetalleC6` function (line ~856-911)

**Step 1: Add InfoBox disclaimer at the top of DetalleC6's return, before the subTipo select**

Insert after `<div>` and before the FieldGroup at line ~866:

```jsx
<InfoBox type="warning">
  <strong>Responsabilidad del usuario:</strong> El usuario que solicita la carpeta FTP es responsable del contenido almacenado en la misma. La OTIN no se hace responsable por el uso indebido del espacio asignado. El contenido debe ser exclusivamente relacionado con las funciones institucionales.
</InfoBox>
```

**Step 2: Verify build**

Run: `cd sasi-app && npm run build`

**Step 3: Commit**

```bash
git add src/SasiInei.jsx
git commit -m "feat(C6): add FTP responsibility disclaimer"
```

---

## C7: Permission Level Descriptions

### Task 5: Add permission descriptions with tooltips to Recursos Compartidos

**Files:**
- Modify: `sasi-app/src/SasiInei.jsx` — inline C7 in StepDetalle (lines ~795-804)

**Step 1: Replace inline C7 section with enhanced version**

Replace the `{openTab === "c7" && ( ... )}` block (lines ~795-804) with:

```jsx
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
```

**Step 2: Verify build**

Run: `cd sasi-app && npm run build`

**Step 3: Commit**

```bash
git add src/SasiInei.jsx
git commit -m "feat(C7): add permission level descriptions with tooltips"
```

---

## C8: Database Permission Descriptions

### Task 6: Add permission descriptions with tooltips to Base de Datos

**Files:**
- Modify: `sasi-app/src/SasiInei.jsx` — `DetalleC8` function (line ~913-943)

**Step 1: Replace the permissions FieldGroup section (lines ~936-939)**

Replace:
```jsx
<FieldGroup label="Tipo de permiso solicitado">
  {["(i) Lectura de tablas y vistas", "(ii) Escritura de información en tablas", "(iii) Ejecución de procedimientos y funciones", "(iv) Permisos DDL"].map(p => (
    <Checkbox key={p} checked={permisos.includes(p)} onChange={() => togglePerm(p)} label={p} />
  ))}
</FieldGroup>
```

With:
```jsx
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
```

**Step 2: Verify build**

Run: `cd sasi-app && npm run build`

**Step 3: Commit**

```bash
git add src/SasiInei.jsx
git commit -m "feat(C8): add database permission descriptions with tooltips"
```

---

## C9: Conditions Text Block

### Task 7: Add conditions text block to Sistemas / Aplicativos

**Files:**
- Modify: `sasi-app/src/SasiInei.jsx` — `DetalleC9` function (line ~946-980)

**Step 1: Add conditions block at the beginning of DetalleC9's return, before the sistema FieldGroup**

Insert after `<div>` and before the FieldGroup at line ~956:

```jsx
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
```

**Step 2: Verify build**

Run: `cd sasi-app && npm run build`

**Step 3: Commit**

```bash
git add src/SasiInei.jsx
git commit -m "feat(C9): add conditions text block for systems access"
```

---

---

## Refactoring: Split SasiInei.jsx into Modules

The file is currently ~1900 lines in a single `SasiInei.jsx`. We split it into logical modules for maintainability.

### Task 8: Create module structure and extract shared code

**Proposed file structure:**
```
src/
  SasiInei.jsx          → slim entry: App export, imports all modules
  constants.js          → SERVICES, STATUS_MAP, VINCULOS, SEDES, emptyForm(), theme
  api.js                → api helper object
  components/
    FormControls.jsx    → FieldGroup, Input, TextArea, Select, Checkbox, RadioGroup, SectionBox, InfoTooltip, InfoBox
    Header.jsx          → Header
    ReviewBlock.jsx     → ReviewBlock
  user/
    PortalUsuario.jsx   → PortalUsuario, handleNew/Edit/Save/Delete/Generate
    DashboardUsuario.jsx → DashboardUsuario, SolicitudCard
    PerfilTISection.jsx → PerfilTISection
    FormWizard.jsx      → STEPS, FormWizard
    StepDatosSolicitud.jsx → StepDatosSolicitud
    StepServicios.jsx   → StepServicios
    StepDetalle.jsx     → StepDetalle + DetalleC1, DetalleC4, DetalleC6, DetalleC8, DetalleC9 (inline C5/C7 stay in StepDetalle)
    StepDocumento.jsx   → StepDocumento, generatePdfContent (shared)
    DetailView.jsx      → DetailView (user's view of a submitted solicitud)
  admin/
    PanelAdmin.jsx      → PanelAdmin
    AdminDashboard.jsx  → AdminDashboard
    AdminCola.jsx       → AdminCola
    AdminTodas.jsx      → AdminTodas
    AdminEmpleados.jsx  → AdminEmpleados
  LoginScreen.jsx       → LoginScreen
```

**Step 1: Create `src/constants.js`**

Extract from SasiInei.jsx lines 1-70:
- `SERVICES`, `STATUS_MAP`, `VINCULOS`, `SEDES`
- `emptyForm()` function
- `theme` object

All exported as named exports.

```js
// src/constants.js
export const SERVICES = [ ... ];
export const STATUS_MAP = { ... };
export const VINCULOS = [ ... ];
export const SEDES = [ ... ];
export const theme = { ... };
export const emptyForm = () => ({ ... });
```

**Step 2: Create `src/api.js`**

```js
// src/api.js
export const api = { ... };
```

**Step 3: Verify build**

Run: `cd sasi-app && npm run build`

**Step 4: Commit**

```bash
git add src/constants.js src/api.js
git commit -m "refactor: extract constants and api to separate modules"
```

### Task 9: Extract form control components

**Files:**
- Create: `src/components/FormControls.jsx`
- Create: `src/components/Header.jsx`
- Create: `src/components/ReviewBlock.jsx`

**Step 1: Create `src/components/FormControls.jsx`**

Move from SasiInei.jsx:
- `FieldGroup` (line ~558)
- `Input` (line ~567)
- `TextArea` (line ~575)
- `Select` (line ~582)
- `Checkbox` (line ~594)
- `RadioGroup` (line ~603)
- `SectionBox` (line ~620)
- `InfoTooltip` (new from Task 1)
- `InfoBox` (new from Task 1)

All import `{ theme }` from `../constants` and `{ useState }` from `react`.
All exported as named exports.

**Step 2: Create `src/components/Header.jsx`**

Move `Header` component. Import `theme` from constants, `ineiLogo` from assets.

**Step 3: Create `src/components/ReviewBlock.jsx`**

Move `ReviewBlock` component.

**Step 4: Verify build**

Run: `cd sasi-app && npm run build`

**Step 5: Commit**

```bash
git add src/components/
git commit -m "refactor: extract shared UI components to components/"
```

### Task 10: Extract user portal modules

**Files:**
- Create: `src/user/PortalUsuario.jsx`
- Create: `src/user/DashboardUsuario.jsx`
- Create: `src/user/PerfilTISection.jsx`
- Create: `src/user/FormWizard.jsx`
- Create: `src/user/StepDatosSolicitud.jsx`
- Create: `src/user/StepServicios.jsx`
- Create: `src/user/StepDetalle.jsx` (includes DetalleC1, DetalleC4, DetalleC6, DetalleC8, DetalleC9, inline C5/C7)
- Create: `src/user/StepDocumento.jsx`
- Create: `src/user/DetailView.jsx`

Each file imports from `../constants`, `../api`, and `../components/FormControls`.
`PortalUsuario` is the main orchestrator — it imports all other user modules.

**Step 1-9: Create each file** extracting the corresponding function from SasiInei.jsx. The key is preserving the exact same logic — just moving code between files.

**Step 10: Verify build**

Run: `cd sasi-app && npm run build`

**Step 11: Commit**

```bash
git add src/user/
git commit -m "refactor: extract user portal into src/user/ modules"
```

### Task 11: Extract admin modules

**Files:**
- Create: `src/admin/PanelAdmin.jsx`
- Create: `src/admin/AdminDashboard.jsx`
- Create: `src/admin/AdminCola.jsx`
- Create: `src/admin/AdminTodas.jsx`
- Create: `src/admin/AdminEmpleados.jsx`

Each imports from `../constants`, `../api`, `../components/FormControls`.

**Step 1-5: Create each file.**

**Step 6: Verify build**

Run: `cd sasi-app && npm run build`

**Step 7: Commit**

```bash
git add src/admin/
git commit -m "refactor: extract admin panel into src/admin/ modules"
```

### Task 12: Extract LoginScreen and slim down SasiInei.jsx

**Files:**
- Create: `src/LoginScreen.jsx`
- Modify: `src/SasiInei.jsx` — reduce to slim entry point

**Step 1: Create `src/LoginScreen.jsx`**

**Step 2: Reduce `src/SasiInei.jsx` to:**

```jsx
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
```

**Step 3: Verify build**

Run: `cd sasi-app && npm run build`
Expected: Build succeeds, app works identically.

**Step 4: Commit**

```bash
git add src/
git commit -m "refactor: complete module split - SasiInei.jsx now slim entry point"
```

---

## Final Verification

### Task 13: Full build and visual check

**Step 1: Run full build**

Run: `cd sasi-app && npm run build`
Expected: Build succeeds with no errors

**Step 2: Start dev server for visual check**

Run: `cd sasi-app && npm run dev`
Check: navigate to each service detail tab (C1, C4, C6, C7, C8, C9) and verify tooltips/descriptions render correctly. Verify all imports work after module split.

**Step 3: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "fix: final adjustments from visual review"
```

**Step 4: Merge dev into railway for deployment**

```bash
git checkout railway
git merge dev --no-edit
git push origin railway
git checkout dev
```
