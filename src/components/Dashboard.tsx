import React from 'react';

interface DashboardProps {
  quotes: any[];
  setPage: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ quotes, setPage }) => {
  const pending = quotes.filter(q => q.status === "pending");
  const won = quotes.filter(q => q.status === "won");
  const revenue = won.reduce((s, q) => s + (q.amount || 0), 0);
  const atStake = pending.reduce((s, q) => s + (q.amount || 0), 0);
  const urgent = pending.filter(q => (q.daysOld || 0) > 7);

  const stats = [
    { l: "Total Quotes", v: quotes.length, e: "📄", c: "var(--text)" },
    { l: "Pending", v: pending.length, e: "⏳", c: "var(--yellow)", sub: `$${atStake.toLocaleString()} at stake` },
    { l: "Won", v: won.length, e: "✅", c: "var(--green)", sub: `${quotes.length ? Math.round(won.length / quotes.length * 100) : 0}% win rate` },
    { l: "Revenue Recovered", v: `$${revenue.toLocaleString()}`, e: "💰", c: "var(--green)", sub: "this month" },
  ];

  return (
    <div style={{ padding: 28 }} className="fi">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-1px", marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setPage("quotes")}>+ Add Quote</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}>{s.l}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{s.e}</div>
            </div>
            <div style={{ fontFamily: "Outfit", fontSize: 30, fontWeight: 900, letterSpacing: "-1.5px", color: s.c }}>{s.v}</div>
            {s.sub && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {urgent.length > 0 && (
        <div style={{ marginBottom: 18, background: "var(--ybg)", border: "1px solid rgba(255,178,30,.2)", borderRadius: 12, padding: "13px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{urgent.length} quote(s) going cold — follow up now!</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>7+ days old with no response.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("followups")}>View →</button>
        </div>
      )}

      {quotes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "52px 32px" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No quotes yet</h3>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 22 }}>Add your first quote and let AI handle the follow-ups</p>
          <button className="btn btn-primary" onClick={() => setPage("quotes")}>+ Add Your First Quote</button>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Recent Quotes</h3>
            <span style={{ fontSize: 13, color: "var(--orange)", fontWeight: 600, cursor: "pointer" }} onClick={() => setPage("quotes")}>View all →</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--s2)" }}>
                {["Customer", "Job", "Amount", "Status", "Age"].map(h => <th key={h} style={{ padding: "8px 20px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {quotes.slice(0, 6).map(q => (
                <tr key={q.id} className="trow">
                  <td style={{ padding: "12px 20px" }}><div style={{ fontWeight: 600, fontSize: 13 }}>{q.customer}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{q.phone || "No phone"}</div></td>
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text2)" }}>{q.job}</td>
                  <td style={{ padding: "12px 20px", fontWeight: 800, fontFamily: "Outfit", fontSize: 14 }}>${(q.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: "12px 20px" }}><span className={`badge badge-${q.status}`}>{q.status === "won" ? "✓ Won" : q.status === "lost" ? "✗ Lost" : "⏳ Pending"}</span></td>
                  <td style={{ padding: "12px 20px", fontSize: 12, color: (q.daysOld || 0) > 7 ? "var(--red)" : "var(--text2)" }}>{(q.daysOld || 0) === 0 ? "Today" : `${q.daysOld || 0}d ago`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
