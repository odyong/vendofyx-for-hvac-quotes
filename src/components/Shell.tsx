import React from 'react';

interface ShellProps {
  user: any;
  profile: any;
  page: string;
  setPage: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ user, profile, page, setPage, onLogout, children }) => {
  const nav = [
    { id: "dashboard", l: "Dashboard", e: "▦" },
    { id: "quotes", l: "Quotes", e: "📄" },
    { id: "followups", l: "Follow-ups", e: "💬" },
    { id: "settings", l: "Settings", e: "⚙️" }
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <aside style={{ width: 210, flexShrink: 0, background: "var(--s1)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 4px", marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, background: "var(--orange)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
          <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 16, letterSpacing: "-.5px" }}>Vendo<span style={{ color: "var(--orange)" }}>fyx</span></span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {nav.map(item => (
            <button key={item.id} className={`nav-item${page === item.id ? " active" : ""}`} onClick={() => setPage(item.id)}>
              <span style={{ fontSize: 15 }}>{item.e}</span>{item.l}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div style={{ padding: "5px 4px", marginBottom: 7 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{profile?.name || user?.displayName || "HVAC Pro"}</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>{profile?.company || "My HVAC Company"}</div>
          </div>
          <button className="nav-item" style={{ color: "var(--red)" }} onClick={onLogout}>↩ Sign out</button>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>{children}</main>
    </div>
  );
};
