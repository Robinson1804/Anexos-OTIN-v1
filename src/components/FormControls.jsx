import { useState } from "react";
import { theme } from "../constants";

export function FieldGroup({ label, children, style: extraStyle }) {
  return (
    <div style={{ marginBottom: 16, ...extraStyle }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.text2, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = "text", style: extraStyle, disabled }) {
  return (
    <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 14, color: theme.text, background: disabled ? "#eee" : theme.surface2, outline: "none", cursor: disabled ? "not-allowed" : undefined, boxSizing: "border-box", ...extraStyle }}
      onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 14, color: theme.text, background: theme.surface2, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
  );
}

export function Select({ value, onChange, options, placeholder }) {
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

export function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, cursor: "pointer" }}>
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function RadioGroup({ value, onChange, options, name }) {
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

export function SectionBox({ title, children, color }) {
  return (
    <div style={{ padding: 16, background: `${color || theme.accent}08`, border: `1px solid ${color || theme.accent}20`, borderRadius: 10, marginBottom: 16 }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: color || theme.accent, marginBottom: 12 }}>{title}</div>}
      {children}
    </div>
  );
}

export function InfoTooltip({ text }) {
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

export function InfoBox({ type, children }) {
  const styles = {
    warning: { bg: "rgba(217,119,6,0.06)", border: "rgba(217,119,6,0.2)", icon: "\u26A0", color: theme.orange },
    info: { bg: "rgba(108,138,255,0.06)", border: "rgba(108,138,255,0.2)", icon: "\u2139", color: theme.accent },
    conditions: { bg: "rgba(30,35,48,0.04)", border: "rgba(30,35,48,0.12)", icon: "\uD83D\uDCCB", color: theme.text },
  };
  const s = styles[type] || styles.info;
  return (
    <div style={{ padding: "12px 16px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, marginBottom: 16, fontSize: 12, lineHeight: 1.6, color: s.color }}>
      <span style={{ marginRight: 6 }}>{s.icon}</span>{children}
    </div>
  );
}

export function ReviewBlock({ title, items }) {
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
