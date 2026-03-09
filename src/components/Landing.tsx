import React, { useState } from 'react';

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLogin, onSignup }) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 62, borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 100, background: "rgba(7,9,14,.95)", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, background: "var(--orange)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, letterSpacing: "-.5px" }}>Vendo<span style={{ color: "var(--orange)" }}>fyx</span></span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={onLogin}>Log in</button>
          <button className="btn btn-primary btn-sm" onClick={onSignup}>Get Started Free</button>
        </div>
      </nav>

      <div style={{ position: "relative", overflow: "hidden", textAlign: "center", padding: "80px 20px 64px" }}>
        <div className="hero-grid" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle,rgba(255,85,32,.13) 0%,transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--obg)", border: "1px solid rgba(255,85,32,.3)", borderRadius: 99, padding: "5px 14px", marginBottom: 28 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)" }}>🔥 Only 11 of 25 Founding Spots Remaining</span>
          </div>
          <h1 className="fu fu1" style={{ fontSize: "clamp(30px, 5vw, 58px)", fontWeight: 900, lineHeight: 1.07, letterSpacing: "-2.5px", marginBottom: 20 }}>
            Stop Losing <span style={{ color: "var(--orange)" }}>$5,000+</span> Every Month<br />to Unfollowed Quotes.
          </h1>
          <p className="fu fu2" style={{ fontSize: 17, color: "var(--text2)", lineHeight: 1.65, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
            The <strong style={{ color: "var(--text)" }}>AI-driven follow-up engine</strong> for HVAC teams. Turn <em>"pending"</em> bids into <strong style={{ color: "var(--green)" }}>"scheduled"</strong> jobs — automatically.
          </p>
          <div className="fu fu3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" style={{ padding: "13px 28px", fontSize: 15 }} onClick={onSignup}>⚡ Claim Your VIP Alpha Spot</button>
            <button className="btn btn-ghost" style={{ padding: "13px 22px", fontSize: 14 }} onClick={onLogin}>Sign in to dashboard</button>
          </div>
          <p className="fu fu4" style={{ color: "var(--text3)", fontSize: 12, marginTop: 14 }}>No credit card required · Founding Member Access · Lock in early-bird rates</p>
        </div>
      </div>

      <div style={{ background: "var(--s1)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "28px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, textAlign: "center" }}>
          {[
            { val: "$6,200+", label: "Avg revenue recovered / month" },
            { val: "94%", label: "Quote follow-up delivery rate" },
            { val: "4.5 hrs", label: "Time saved per tech, per week" }
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "Outfit", fontSize: 38, fontWeight: 900, color: "var(--orange)", letterSpacing: "-2px" }}>{s.val}</div>
              <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "72px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: "var(--orange)", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 900, letterSpacing: "-1.5px" }}>3 steps to never lose a quote again</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
          {[
            { e: "📄", n: "01", t: "Paste your quote", d: "Type or paste any quote. AI instantly extracts customer details, job type, and amount." },
            { e: "🤖", n: "02", t: "AI schedules follow-ups", d: "Vendofyx writes personalized emails and sends them at the perfect time automatically." },
            { e: "✅", n: "03", t: "Pending turns to won", d: "Track every quote in real-time. Get notified the moment a customer responds." }
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 26, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 14, right: 18, fontFamily: "Outfit", fontSize: 44, fontWeight: 900, color: "var(--border2)", letterSpacing: "-3px", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 30, marginBottom: 16 }}>{s.e}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 9 }}>{s.t}</h3>
              <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.65 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--s1)", borderTop: "1px solid var(--border)", padding: "72px 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div style={{ color: "var(--orange)", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>PRICING</div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 26 }}>Lock in founding member rates</h2>
          <div style={{ display: "inline-flex", background: "var(--s2)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, gap: 4, marginBottom: 32 }}>
            {["monthly", "yearly"].map(b => (
              <button key={b} onClick={() => setBilling(b as any)} style={{ padding: "7px 18px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 600, background: billing === b ? "var(--orange)" : "transparent", color: billing === b ? "white" : "var(--text2)", transition: "all .2s", cursor: "pointer" }}>
                {b === "monthly" ? "Monthly" : "Yearly"}{b === "yearly" && <span style={{ fontSize: 11, marginLeft: 4 }}>Save 33%</span>}
              </button>
            ))}
          </div>
          <div className="card" style={{ borderColor: "var(--orange)", borderRadius: 18, padding: 36, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,var(--orange),var(--orange2))" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--obg)", borderRadius: 99, padding: "4px 12px", marginBottom: 18 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)" }}>⭐ VIP Alpha — Legacy Rate</span>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontFamily: "Outfit", fontSize: 56, fontWeight: 900, letterSpacing: "-3px" }}>{billing === "yearly" ? "$799" : "$79"}</span>
              <span style={{ color: "var(--text2)", fontSize: 16, marginLeft: 4 }}>/ {billing === "yearly" ? "year" : "month"}</span>
            </div>
            <p style={{ color: "var(--text3)", fontSize: 12, marginBottom: 26 }}>{billing === "yearly" ? "$999 after launch · Price locked forever" : "Switch to yearly & save $149"}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left", marginBottom: 28 }}>
              {["Unlimited AI Quote Parsing", "Automated Email Follow-ups", "Follow-up Dashboard", "Win Rate Analytics", "1-on-1 Onboarding", "Lifetime Price Lock"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--gbg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, color: "var(--green)" }}>✓</div>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>{f}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: "100%", padding: "14px", fontSize: 15, justifyContent: "center" }} onClick={onSignup}>
              Get Started Now — {billing === "yearly" ? "$799/yr" : "$79/mo"}
            </button>
            <div style={{ marginTop: 18, padding: "12px 14px", background: "var(--s2)", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: "var(--text2)" }}>Founding spots remaining</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)" }}>11 of 25</span>
              </div>
              <div style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "56%", background: "linear-gradient(90deg,var(--orange),var(--orange2))", borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 15 }}>Vendo<span style={{ color: "var(--orange)" }}>fyx</span></span>
        <div style={{ display: "flex", gap: 18, fontSize: 12, color: "var(--text3)", flexWrap: "wrap" }}>
          {["Terms", "Privacy", "Refund Policy", "support@vendofyx.com"].map(l => <span key={l}>{l}</span>)}
        </div>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>🔒 Dodo Payments · © 2026 Vendofyx</span>
      </footer>
    </div>
  );
};
