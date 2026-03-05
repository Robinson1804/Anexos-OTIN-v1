export const api = {
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
