import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { parseQuote } from '../lib/gemini';

interface QuotesPageProps {
  quotes: any[];
  setQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  userId: string;
}

export const QuotesPage: React.FC<QuotesPageProps> = ({ quotes, setQuotes, userId }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [parsing, setParsing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");

  const showT = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  async function handleParse() {
    if (!raw.trim()) return;
    setParsing(true); setParsed(null);
    try {
      const data = await parseQuote(raw);
      setParsed(data);
    } catch (e) {
      showT("❌ Parse failed. Try again.");
    } finally {
      setParsing(false);
    }
  }

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    console.log("Quotes: handleSave initiated");
    if (!parsed) {
      console.log("Quotes: No parsed data found to save");
      return;
    }
    if (!userId) {
      console.error("Quotes: No userId found in props");
      showT("❌ Not logged in. Please refresh.");
      return;
    }
    
    // Clean and validate amount
    let finalAmount = 0;
    if (typeof parsed.amount === 'string') {
      finalAmount = Number(parsed.amount.replace(/[^0-9.]/g, ''));
    } else {
      finalAmount = Number(parsed.amount);
    }

    if (isNaN(finalAmount)) finalAmount = 0;

    // Validate required fields
    if (!parsed.customer || !parsed.job) {
      showT("❌ Missing Customer or Job info. Please edit and re-parse.");
      return;
    }

    setSaving(true);
    console.log("Quotes: Attempting API save...", { userId, customer: parsed.customer, amount: finalAmount });
    
    try {
      const quoteData = {
        userId,
        customer: parsed.customer,
        phone: parsed.phone || null,
        email: parsed.email || null,
        job: parsed.job,
        amount: finalAmount,
        address: parsed.address || null,
        notes: parsed.notes || "",
        urgency: parsed.urgency || "medium",
        status: "pending",
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save quote via API");
      }

      const { id } = await res.json();
      console.log("Quotes: API save successful, ID:", id);
      
      const newQuote = {
        id,
        ...quoteData,
        followUpsSent: 0,
        daysOld: 0,
      };

      setQuotes(p => [newQuote, ...p]);
      showT("✅ Quote saved successfully!");
      setShowAdd(false); 
      setParsed(null); 
      setRaw("");
    } catch (e: any) {
      console.error("Quotes: API save error:", e);
      showT(`❌ ${e.message || "Save failed. Please try again."}`);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try { 
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (e) {
      console.error("Error updating status:", e);
    }
    setQuotes(p => p.map(q => q.id === id ? { ...q, status } : q));
  }

  const list = filter === "all" ? quotes : quotes.filter(q => q.status === filter);

  return (
    <div style={{ padding: 28 }} className="fi">
      {toast && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: "var(--s1)", border: `1px solid ${toast.startsWith("✅") ? "var(--green)" : "var(--red)"}`, borderRadius: 12, padding: "12px 18px", fontSize: 13, color: toast.startsWith("✅") ? "var(--green)" : "var(--red)", boxShadow: "0 4px 20px rgba(0,0,0,.5)" }}>{toast}</div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-1px", marginBottom: 4 }}>Quotes</h1>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>{quotes.length} total · {quotes.filter(q => q.status === "pending").length} pending</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowAdd(!showAdd); setParsed(null); setRaw(""); }}>
          {showAdd ? "✕ Cancel" : "+ Add Quote"}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ padding: 24, marginBottom: 20, border: "1px solid var(--border2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, background: "var(--obg)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div><h3 style={{ fontSize: 15, fontWeight: 700 }}>AI Quote Parser</h3><p style={{ fontSize: 12, color: "var(--text2)" }}>Paste any quote or job note — AI extracts everything instantly</p></div>
          </div>
          <textarea className="inp" style={{ minHeight: 110, resize: "vertical", lineHeight: 1.65 }}
            placeholder={`Example: "Mike Johnson 832-555-0101 needs 3-ton AC at 123 Oak St Houston TX. Quote $4,200."`}
            value={raw} onChange={e => { setRaw(e.target.value); setParsed(null); }} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={handleParse} disabled={parsing || !raw.trim()}>
              {parsing ? <><span className="spin" />Parsing...</> : "🤖 Parse with Gemini"}
            </button>
          </div>
          {parsed && (
            <div style={{ marginTop: 18, background: "var(--s2)", borderRadius: 10, padding: 18, border: "1px solid var(--border2)" }}>
              <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>✅ Parsed successfully!</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Customer", parsed.customer], ["Job", parsed.job], ["Amount", parsed.amount ? `$${Number(parsed.amount).toLocaleString()}` : "—"], ["Urgency", parsed.urgency || "medium"], ["Phone", parsed.phone || "Not found"], ["Email", parsed.email || "Not found"], ["Address", parsed.address || "Not found"], ["Notes", parsed.notes || "—"]].map(([l, v], i) => (
                  <div key={i}><div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spin" /> Saving...</> : "💾 Save & Schedule Follow-ups"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setParsed(null)}>Re-parse</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "pending", "won", "lost"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s", borderColor: filter === s ? "var(--orange)" : "var(--border)", background: filter === s ? "var(--obg)" : "transparent", color: filter === s ? "var(--orange)" : "var(--text2)" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}{s !== "all" && ` (${quotes.filter(q => q.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <p style={{ fontSize: 13 }}>No {filter === "all" ? "" : filter} quotes yet</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--s2)" }}>
                {["Customer", "Job", "Amount", "Status", "Follow-ups", "Actions"].map(h => <th key={h} style={{ padding: "8px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {list.map(q => (
                <tr key={q.id} className="trow">
                  <td style={{ padding: "12px 18px" }}><div style={{ fontWeight: 600, fontSize: 13 }}>{q.customer}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{q.phone || "No phone"}</div></td>
                  <td style={{ padding: "12px 18px" }}><div style={{ fontSize: 13 }}>{q.job}</div>{q.notes && <div style={{ fontSize: 11, color: "var(--text3)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.notes}</div>}</td>
                  <td style={{ padding: "12px 18px", fontWeight: 800, fontFamily: "Outfit", fontSize: 14 }}>${(q.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: "12px 18px" }}><span className={`badge badge-${q.status}`}>{q.status === "won" ? "✓ Won" : q.status === "lost" ? "✗ Lost" : "⏳ Pending"}</span></td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text2)" }}>{q.followUpsSent || 0} sent</td>
                  <td style={{ padding: "12px 18px" }}>
                    {q.status === "pending" && <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" style={{ color: "var(--green)", borderColor: "rgba(15,212,122,.2)", fontSize: 11 }} onClick={() => updateStatus(q.id, "won")}>✓ Won</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)", borderColor: "rgba(255,69,69,.2)", fontSize: 11 }} onClick={() => updateStatus(q.id, "lost")}>✗ Lost</button>
                    </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
