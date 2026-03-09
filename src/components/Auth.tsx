import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onAuth: (user: any) => void;
  onSwitch: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onAuth, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [co, setCo] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const isLogin = mode === "login";

  async function go() {
    if (!email || !pass) { setErr("Please fill in all fields."); return; }
    setLoading(true); setErr(""); setMsg("");
    try {
      let cred;
      if (isLogin) {
        cred = await signInWithEmailAndPassword(auth, email, pass);
      } else {
        cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name || email.split("@")[0] });
        await setDoc(doc(db, "users", cred.user.uid), {
          name: name || email.split("@")[0],
          company: co || "My HVAC Company",
          email,
          plan: "trial",
          createdAt: serverTimestamp()
        });
      }
      onAuth(cred.user);
    } catch (e: any) {
      if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") setErr("Incorrect email or password.");
      else if (e.code === "auth/email-already-in-use") setErr("Email already registered. Try logging in.");
      else if (e.code === "auth/weak-password") setErr("Password must be at least 6 characters.");
      else setErr("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  async function handleForgot() {
    if (!email) { setErr("Please enter your email first."); return; }
    setLoading(true); setErr(""); setMsg("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Password reset email sent! Check your inbox.");
    } catch (e: any) {
      setErr("Failed to send reset email. Check the email address.");
    } finally { setLoading(false); }
  }

  async function googleLogin() {
    setGLoading(true); setErr(""); setMsg("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, "users", cred.user.uid), {
        name: cred.user.displayName || "HVAC Pro",
        email: cred.user.email,
        company: "My HVAC Company",
        plan: "trial",
        createdAt: serverTimestamp()
      }, { merge: true });
      onAuth(cred.user);
    } catch (e: any) {
      console.error("Google Sign-in Error:", e);
      let errorMsg = "Google sign-in failed.";
      if (e.code === "auth/popup-blocked") {
        errorMsg = "Popup blocked! Please allow popups in your browser address bar.";
      } else if (e.code === "auth/unauthorized-domain") {
        errorMsg = "Domain not authorized. You MUST add this URL to your Firebase Console > Authentication > Settings > Authorized domains.";
      } else if (e.code === "auth/popup-closed-by-user") {
        errorMsg = "Sign-in window was closed before finishing.";
      } else if (e.code === "auth/operation-not-allowed") {
        errorMsg = "Google sign-in is not enabled in Firebase Console > Authentication > Sign-in method.";
      } else {
        errorMsg = `Error: ${e.message || "Please try again."}`;
      }
      setErr(errorMsg);
    } finally { setGLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, background: "var(--bg)" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 48, height: 48, background: "var(--orange)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24 }}>⚡</div>
        <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 20 }}>Vendo<span style={{ color: "var(--orange)" }}>fyx</span></div>
      </div>
      <div className="card fu" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 5, letterSpacing: "-.5px" }}>{isLogin ? "Welcome back" : "Create your account"}</h2>
        <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 24 }}>{isLogin ? "Sign in to your dashboard" : "Start recovering lost revenue today"}</p>
        <button className="google-btn" onClick={googleLogin} disabled={gLoading} style={{ marginBottom: 18 }}>
          {gLoading ? <span className="spin" /> : <>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Continue with Google
          </>}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text3)" }}>or use email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {!isLogin && <>
            <div><label style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", display: "block", marginBottom: 5 }}>Full Name</label><input className="inp" placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", display: "block", marginBottom: 5 }}>Company Name</label><input className="inp" placeholder="Smith HVAC Services" value={co} onChange={e => setCo(e.target.value)} /></div>
          </>}
          <div><label style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", display: "block", marginBottom: 5 }}>Email</label><input className="inp" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)" }}>Password</label>
              {isLogin && <span style={{ fontSize: 11, color: "var(--orange)", cursor: "pointer" }} onClick={handleForgot}>Forgot password?</span>}
            </div>
            <input className="inp" type="password" placeholder="Min. 6 characters" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />
          </div>
          {err && <div style={{ background: "var(--rbg)", border: "1px solid rgba(255,69,69,.2)", borderRadius: 8, padding: "9px 13px", fontSize: 13, color: "var(--red)" }}>{err}</div>}
          {msg && <div style={{ background: "rgba(15,212,122,.1)", border: "1px solid rgba(15,212,122,.2)", borderRadius: 8, padding: "9px 13px", fontSize: 13, color: "var(--green)" }}>{msg}</div>}
          <button className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14, justifyContent: "center", marginTop: 4 }} onClick={go} disabled={loading}>
            {loading ? <span className="spin" /> : isLogin ? "Sign In" : "Create Account — Free"}
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text2)", marginTop: 20 }}>
          {isLogin ? "No account? " : "Have an account? "}
          <span style={{ color: "var(--orange)", fontWeight: 600, cursor: "pointer" }} onClick={onSwitch}>{isLogin ? "Sign up free" : "Sign in"}</span>
        </p>
      </div>
    </div>
  );
};
