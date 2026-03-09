import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsPageProps {
  profile: any;
  userId: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ profile, userId }) => {
  const [company, setCompany] = useState(profile?.company || "");
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  async function save() {
    setError("");
    try { 
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, company })
      });
      if (!res.ok) throw new Error("Failed to save profile via API");
      
      setSaved(true); 
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) { 
      console.error("Settings: Save failed", e);
      setError("Failed to save. Check your connection.");
      setTimeout(() => setError(""), 3500);
    }
  }

  const S = ({ n, t, children }: { n: string, t: string, children: React.ReactNode }) => (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 34, height: 34, background: "var(--obg)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{n}</div>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding: 28, maxWidth: 640 }} className="fi">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-1px", marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Your app is live on vendofyx.com ✅</p>
      </div>
      <S n="✅" t="Firebase — Connected">
        <div style={{ background: "var(--gbg)", border: "1px solid rgba(15,212,122,.2)", borderRadius: 10, padding: "13px 16px", fontSize: 13, color: "var(--green)", marginBottom: 12 }}>
          ✅ Firebase Auth and Firestore are live. Project: vendofyx-hvac
        </div>
      </S>
      <S n="🏢" t="Company Profile">
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", display: "block", marginBottom: 6 }}>Company Name (used in emails)</label>
          <input className="inp" placeholder="Smith HVAC Services" value={company} onChange={e => setCompany(e.target.value)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-primary btn-sm" onClick={save}>{saved ? "✅ Saved!" : "Save"}</button>
          {error && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
        </div>
      </S>
      <S n="📧" t="Resend — Connect to send real emails">
        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, marginBottom: 12 }}>
          Sign up free at <strong style={{ color: "var(--orange)" }}>resend.com</strong> → add vendofyx.com domain → get your API key. Free for 3,000 emails/month. Then come back here and I'll add it to your app.
        </p>
      </S>
      <S n="💳" t="Dodo Payments — Add when ready to charge">
        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
          Create account at <strong style={{ color: "var(--orange)" }}>dodopayments.com</strong> → create $79/month and $799/year products → come back here and I'll connect it.
        </p>
      </S>
    </div>
  );
};
