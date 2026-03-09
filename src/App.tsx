import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { Landing } from './components/Landing';
import { AuthPage } from './components/Auth';
import { Shell } from './components/Shell';
import { Dashboard } from './components/Dashboard';
import { QuotesPage } from './components/Quotes';
import { FollowupsPage } from './components/Followups';
import { SettingsPage } from './components/Settings';

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    console.log("App: Initializing auth listener...");
    
    const timeout = setTimeout(() => {
      if (appLoading) {
        console.warn("App: Auth listener timeout reached. Forcing loading to false.");
        setAppLoading(false);
      }
    }, 8000);

    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      console.log("App: Auth state changed:", firebaseUser ? "User logged in" : "No user");
      
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          console.log("App: Fetching user profile from API for", firebaseUser.uid);
          const pRes = await fetch(`/api/profile?userId=${firebaseUser.uid}`);
          if (pRes.ok) {
            const pData = await pRes.json();
            setProfile(pData);
          } else {
            setProfile({ name: firebaseUser.displayName || firebaseUser.email, company: "My HVAC Company" });
          }
          
          console.log("App: Fetching quotes from API...");
          const res = await fetch(`/api/quotes?userId=${firebaseUser.uid}`);
          if (!res.ok) throw new Error("Failed to fetch quotes from API");
          const quotesData = await res.json();
          
          setQuotes(quotesData.map((data: any) => {
            const days = data.createdAt ? Math.floor((Date.now() - (data.createdAt.seconds * 1000)) / 86400000) : 0;
            return { ...data, daysOld: days };
          }));
          console.log("App: Data loaded successfully from API");
        } catch (e: any) {
          console.error("App: Error loading user data:", e);
          if (e.message?.includes("offline")) {
            console.warn("App: Firestore is offline. This might be a temporary network issue.");
          }
        }
        setPage("dashboard");
      } else {
        setUser(null);
        setProfile(null);
        setQuotes([]);
        setPage("landing");
      }
      
      setAppLoading(false);
      clearTimeout(timeout);
    });
    
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowRefresh(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (appLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border2)", borderTopColor: "var(--orange)", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>Loading Vendofyx...</div>
        {showRefresh && (
          <button className="btn btn-ghost btn-sm fi" onClick={() => window.location.reload()}>
            Taking too long? Click to refresh
          </button>
        )}
      </div>
    </div>
  );

  async function logout() { await signOut(auth); }

  if (page === "landing") return <Landing onLogin={() => setPage("login")} onSignup={() => setPage("signup")} />;
  if (page === "login") return <AuthPage mode="login" onAuth={u => { setUser(u); setPage("dashboard"); }} onSwitch={() => setPage("signup")} />;
  if (page === "signup") return <AuthPage mode="signup" onAuth={u => { setUser(u); setPage("dashboard"); }} onSwitch={() => setPage("login")} />;
  if (!user) return null;

  return (
    <Shell user={user} profile={profile} page={page} setPage={setPage} onLogout={logout}>
      {page === "dashboard" && <Dashboard quotes={quotes} setPage={setPage} />}
      {page === "quotes" && <QuotesPage quotes={quotes} setQuotes={setQuotes} userId={user.uid} />}
      {page === "followups" && <FollowupsPage quotes={quotes} setQuotes={setQuotes} userId={user.uid} profile={profile} />}
      {page === "settings" && <SettingsPage profile={profile} userId={user.uid} />}
    </Shell>
  );
}
