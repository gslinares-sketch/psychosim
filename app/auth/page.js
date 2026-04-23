"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit() {
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name, role } }
        });
        if (error) throw error;
        setSuccess("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f1117; font-family: 'Inter', sans-serif; }
    input { font-family: 'Inter', sans-serif; }
    .inp { background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,255,255,.1); border-radius: 10px; padding: 13px 16px; color: #e2e8f0; font-size: 14px; outline: none; width: 100%; transition: border-color .2s; }
    .inp:focus { border-color: rgba(74,144,164,.6); }
    .inp::placeholder { color: #4a5568; }
    .btn { background: linear-gradient(135deg,#4a90a4,#357a8a); color: white; border: none; padding: 14px; border-radius: 10px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; width: 100%; transition: all .2s; }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,144,164,.35); }
    .btn:disabled { background: #2a2d3a; color: #555; cursor: not-allowed; transform: none; }
    .role-btn { padding: 10px 20px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,.1); background: transparent; color: #64748b; font-family: 'Inter', sans-serif; font-size: 13px; cursor: pointer; transition: all .2s; }
    .role-btn.active { border-color: rgba(74,144,164,.6); color: #4a90a4; background: rgba(74,144,164,.1); }
  `;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#4a90a4,#7c6fcd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white", margin: "0 auto 16px" }}>P</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#e2e8f0", marginBottom: 6 }}>PsychoSim</h1>
          <p style={{ fontSize: 14, color: "#4a5568" }}>Clinical Training Simulator</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "32px 28px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 4 }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: mode===m ? "rgba(74,144,164,.2)" : "transparent", color: mode===m ? "#4a90a4" : "#4a5568", fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .2s", textTransform: "capitalize" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <>
                <input className="inp" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}/>
                <div>
                  <p style={{ fontSize: 12, color: "#4a5568", marginBottom: 8, fontWeight: 500 }}>I am a...</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{id:"student",label:"Student",icon:"🎓"},{id:"teacher",label:"Professor / Teacher",icon:"👩‍🏫"}].map(r => (
                      <button key={r.id} className={`role-btn ${role===r.id?"active":""}`} onClick={() => setRole(r.id)} style={{ flex: 1 }}>
                        {r.icon} {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <input className="inp" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}/>
            <input className="inp" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}/>

            {error && <div style={{ fontSize: 13, color: "#f87171", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "10px 14px" }}>⚠ {error}</div>}
            {success && <div style={{ fontSize: 13, color: "#4ade80", background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.2)", borderRadius: 8, padding: "10px 14px" }}>✓ {success}</div>}

            <button className="btn" onClick={handleSubmit} disabled={loading || !email || !password}>
              {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#2d3748", marginTop: 20 }}>Educational use only · Not a substitute for supervised clinical training</p>
      </div>
    </div>
  );
}
