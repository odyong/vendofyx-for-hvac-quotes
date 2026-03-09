import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FollowupsPageProps {
  quotes: any[];
  setQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  userId: string;
  profile: any;
}

export const FollowupsPage: React.FC<FollowupsPageProps> = ({ quotes, setQuotes, userId, profile }) => {
  const [sending, setSending] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [toast, setToast] = useState("");

  const showT = (m: string) => { setToast(m); setTimeout(() => setToast(""), 4000); };

  useEffect(() => {
    if (!userId) return;
    getDocs(query(collection(db, "followups"), where("userId", "==", userId), orderBy("sentAt", "desc")))
      .then(snap => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => { });
  }, [userId]);

  const allPending = quotes.filter(q => q.status === "pending");
  const needsAction = allPending.filter(q => (q.daysOld || 0) >= 2);
  const scheduled = allPending.filter(q => (q.daysOld || 0) < 2);

  async function send(q: any) {
    if (!q.email) { showT("❌ No email for this customer. Edit the quote to add one."); return; }
    setSending(q.id);
    try {
      const n = (q.followUpsSent || 0) + 1;
      
      // Call our new backend API
      const res = await fetch("/api/send-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: q.email,
          customer: q.customer,
          job: q.job,
          amount: q.amount,
          company: profile?.company || "My HVAC Company"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      // Update quote via backend
      const updateRes = await fetch(`/api/quotes/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          followUpsSent: n,
          lastFollowUp: new Date().toISOString()
        })
      });

      if (!updateRes.ok) console.warn("Failed to update quote follow-up count on backend");

      // Log followup in history (we can keep this in firestore for now or move to backend)
      await addDoc(collection(db, "followups"), {
        userId,
        quoteId: q.id,
        customer: q.customer,
        job: q.job,
        amount: q.amount,
        type: "Email",
        status: "sent",
        sentAt: serverTimestamp()
      });

      setQuotes(p => p.map(x => x.id === q.id ? { ...x, followUpsSent: n } : x));
      setHistory(p => [{ id: Date.now().toString(), customer: q.customer, job: q.job, amount: q.amount, type: "Email", status: "sent", sentAt: { toDate: () => new Date() } }, ...p]);
      showT(`✅ Email sent to ${q.customer}!`);
    } catch (e: any) { 
      console.error("Followup Error:", e);
      showT(`❌ ${e.message || "Failed. Please try again."}`); 
    }
    finally { setSending(null); }
  }

  return (
    <div style={{ padding: 28 }} className="fi">
      {toast && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: "var(--s1)", border: `1px solid ${toast.startsWith("✅") ? "var(--green)" : "var(--red)"}`, borderRadius: 12, padding: "12px 18px", fontSize: 13, color: toast.startsWith("✅") ? "var(--green)" : "var(--red)", boxShadow: "0 4px 20px rgba(0,0,0,.5)", maxWidth: 360 }}>{toast}</div>}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-1px", marginBottom: 4 }}>Follow-ups</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Track and send email nudges for your pending quotes</p>
      </div>

      {allPending.length > 0 ? (
        <div style={{ marginBottom: 32 }}>
          {needsAction.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🔥 Needs Follow-up ({needsAction.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {needsAction.map(q => (
                  <div key={q.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, border: `1px solid ${(q.daysOld || 0) > 7 ? "rgba(255,69,69,.2)" : "rgba(255,178,30,.15)"}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{q.customer} — {q.job}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                        ${(q.amount || 0).toLocaleString()} · {q.daysOld || 0}d old · {q.followUpsSent || 0} sent
                        {q.email ? <span style={{ color: "var(--green)", marginLeft: 7 }}>✓ email on file</span> : <span style={{ color: "var(--red)", marginLeft: 7 }}>✗ no email</span>}
                      </div>
                    </div>
                    <span className={`badge ${(q.daysOld || 0) > 7 ? "badge-lost" : "badge-pending"}`}>{q.daysOld || 0}d</span>
                    <button className="btn btn-primary btn-sm" onClick={() => send(q)} disabled={sending === q.id || !q.email}>
                      {sending === q.id ? <span className="spin" /> : "📧 Send Email"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scheduled.length > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📅 Scheduled Follow-ups ({scheduled.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {scheduled.map(q => (
                  <div key={q.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, opacity: 0.8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{q.customer} — {q.job}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                        ${(q.amount || 0).toLocaleString()} · Created today · Follow-up in {2 - (q.daysOld || 0)}d
                      </div>
                    </div>
                    <span className="badge badge-pending">Scheduled</span>
                    <button className="btn btn-ghost btn-sm" disabled style={{ fontSize: 11 }}>Too soon to nudge</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>All caught up!</h3>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>No pending quotes need follow-up right now.</p>
        </div>
      )}

      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Follow-up History</h3>
      <div className="card" style={{ overflow: "hidden" }}>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 0", color: "var(--text3)", fontSize: 13 }}>No follow-ups sent yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--s2)" }}>
                {["Customer", "Job", "Amount", "Type", "Date", "Status"].map(h => <th key={h} style={{ padding: "8px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {history.map((f, i) => (
                <tr key={f.id || i} className="trow">
                  <td style={{ padding: "12px 18px", fontWeight: 600, fontSize: 13 }}>{f.customer}</td>
                  <td style={{ padding: "12px 18px", fontSize: 13, color: "var(--text2)" }}>{f.job}</td>
                  <td style={{ padding: "12px 18px", fontWeight: 800, fontFamily: "Outfit", fontSize: 13 }}>${(f.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12 }}>📧 {f.type}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text2)" }}>{f.sentAt?.toDate?.()?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) || "Today"}</td>
                  <td style={{ padding: "12px 18px" }}><span className="badge badge-won">✓ Sent</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
