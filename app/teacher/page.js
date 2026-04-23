"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const MODALITY_COLORS = { transpersonal:"#7c6fcd", cbt:"#4a90a4", humanistic:"#5a9e6f", psychodynamic:"#c4875a", existential:"#a05a7c", somatic:"#7a9e5a" };

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSessions, setStudentSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (prof?.role !== "teacher") { router.push("/dashboard"); return; }
    setProfile(prof);
    const { data: grps } = await supabase.from("groups").select("*").eq("teacher_id", user.id).order("created_at", { ascending: false });
    setGroups(grps || []);
    setLoading(false);
  }

  async function createGroup() {
    if (!newGroupName.trim()) return;
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("groups").insert({ name: newGroupName, code: generateCode(), teacher_id: user.id }).select().single();
    if (!error) { setGroups(p => [data, ...p]); setNewGroupName(""); }
    setCreating(false);
  }

  async function selectGroup(group) {
    setSelectedGroup(group); setSelectedStudent(null); setSelectedSession(null);
    const { data } = await supabase.from("group_members").select("profiles(*)").eq("group_id", group.id);
    setStudents(data?.map(m => m.profiles) || []);
  }

  async function selectStudent(student) {
    setSelectedStudent(student); setSelectedSession(null);
    const { data } = await supabase.from("sessions").select("*").eq("student_id", student.id).order("created_at", { ascending: false });
    setStudentSessions(data || []);
  }

  async function signOut() { await supabase.auth.signOut(); router.push("/auth"); }

  function formatDate(d) { return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
  function formatTime(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0f1117", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", gap:8 }}>{[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#4a90a4", animation:`pulse 1s ${i*.2}s infinite` }}/>)}</div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f1117; font-family: 'Inter', sans-serif; }
    input { font-family: 'Inter', sans-serif; }
    @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
    .card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 12px; padding: 16px 20px; }
    .row { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06); border-radius: 10px; padding: 12px 16px; cursor: pointer; transition: all .2s; }
    .row:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.1); }
    .row.active { background: rgba(74,144,164,.1); border-color: rgba(74,144,164,.4); }
    .btn-p { background: linear-gradient(135deg,#4a90a4,#357a8a); color: white; border: none; padding: 10px 20px; border-radius: 9px; font-family: 'Inter',sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: all .2s; }
    .btn-p:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(74,144,164,.3); }
    .btn-p:disabled { background: #2a2d3a; color: #555; cursor: not-allowed; transform: none; }
    .btn-g { background: transparent; color: #8892a4; border: 1px solid rgba(255,255,255,.1); padding: 9px 16px; border-radius: 8px; font-family: 'Inter',sans-serif; font-size: 12px; cursor: pointer; transition: all .2s; }
    .btn-g:hover { background: rgba(255,255,255,.05); color: #cdd5e0; }
    .inp { background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,255,255,.1); border-radius: 9px; padding: 10px 14px; color: #e2e8f0; font-size: 13px; outline: none; transition: border-color .2s; }
    .inp:focus { border-color: rgba(74,144,164,.6); }
    .inp::placeholder { color: #4a5568; }
    .tag { display: inline-flex; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .col-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: #2d3748; text-transform: uppercase; margin-bottom: 12px; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 4px; }
    .fb strong { color: #7dd3fc; }
    .fb h2 { font-size: 16px; color: #e2e8f0; margin: 16px 0 6px; font-family: 'Playfair Display', serif; }
    .fb { line-height: 1.8; font-size: 13px; color: #94a3b8; }
  `;

  return (
    <div style={{ minHeight:"100vh", background:"#0f1117", color:"#e2e8f0", fontFamily:"'Inter',sans-serif" }}>
      <style>{css}</style>

      {/* Nav */}
      <nav style={{ background:"rgba(15,17,23,.9)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#4a90a4,#7c6fcd)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"white" }}>P</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:600 }}>PsychoSim</span>
          <span className="tag" style={{ background:"rgba(124,111,205,.15)", color:"#a78bfa", border:"1px solid rgba(124,111,205,.3)", marginLeft:4 }}>Professor</span>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#4a5568" }}>{profile?.name}</span>
          <button className="btn-g" onClick={signOut}>Sign out</button>
        </div>
      </nav>

      {/* 3-column layout */}
      <div style={{ display:"grid", gridTemplateColumns:"220px 220px 1fr", height:"calc(100vh - 58px)" }}>

        {/* Col 1: Groups */}
        <div style={{ borderRight:"1px solid rgba(255,255,255,.06)", padding:"20px 16px", overflowY:"auto", display:"flex", flexDirection:"column", gap:12 }}>
          <div className="col-label">My Groups</div>
          <div style={{ display:"flex", gap:6 }}>
            <input className="inp" placeholder="Group name" value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} style={{ flex:1 }} onKeyDown={e=>{ if(e.key==="Enter") createGroup(); }}/>
            <button className="btn-p" onClick={createGroup} disabled={creating||!newGroupName.trim()} style={{ padding:"10px 12px", flexShrink:0 }}>+</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {groups.length === 0 && <p style={{ fontSize:12, color:"#4a5568" }}>No groups yet. Create one above.</p>}
            {groups.map(g => (
              <div key={g.id} className={`row ${selectedGroup?.id===g.id?"active":""}`} onClick={() => selectGroup(g)}>
                <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", marginBottom:4 }}>{g.name}</div>
                <div style={{ fontSize:11, color:"#4a5568" }}>Code: <span style={{ color:"#4a90a4", fontWeight:700, letterSpacing:1.5 }}>{g.code}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Students */}
        <div style={{ borderRight:"1px solid rgba(255,255,255,.06)", padding:"20px 16px", overflowY:"auto" }}>
          <div className="col-label">{selectedGroup ? `${selectedGroup.name} — Students` : "Students"}</div>
          {!selectedGroup && <p style={{ fontSize:12, color:"#4a5568" }}>Select a group to see students</p>}
          {selectedGroup && students.length === 0 && (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <p style={{ fontSize:12, color:"#4a5568", marginBottom:8 }}>No students yet</p>
              <p style={{ fontSize:11, color:"#2d3748" }}>Share code <span style={{ color:"#4a90a4", fontWeight:700 }}>{selectedGroup.code}</span></p>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {students.map(s => (
              <div key={s?.id} className={`row ${selectedStudent?.id===s?.id?"active":""}`} onClick={() => selectStudent(s)}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:`hsl(${s?.name?.charCodeAt(0)*40||180},35%,35%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"white", flexShrink:0 }}>
                    {s?.name?.charAt(0)||"?"}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{s?.name}</div>
                    <div style={{ fontSize:11, color:"#4a5568" }}>{s?.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Sessions / Feedback */}
        <div style={{ padding:"20px 24px", overflowY:"auto" }}>
          {!selectedStudent && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"#4a5568", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:16 }}>👩‍🏫</div>
              <p style={{ fontSize:15 }}>Select a student to view their sessions</p>
            </div>
          )}
          {selectedStudent && !selectedSession && (
            <>
              <div style={{ marginBottom:20 }}>
                <div className="col-label">{selectedStudent.name}'s Sessions</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
                  {[
                    { label:"Total Sessions", value:studentSessions.length },
                    { label:"Avg Duration", value: studentSessions.length ? formatTime(Math.round(studentSessions.reduce((a,s)=>a+s.duration_seconds,0)/studentSessions.length)) : "—" },
                    { label:"Modalities", value: [...new Set(studentSessions.map(s=>s.modality))].length },
                  ].map(stat => (
                    <div key={stat.label} className="card">
                      <div style={{ fontSize:22, fontWeight:700, color:"#e2e8f0", marginBottom:2 }}>{stat.value}</div>
                      <div style={{ fontSize:11, color:"#4a5568" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {studentSessions.length === 0 && <p style={{ fontSize:13, color:"#4a5568" }}>No sessions completed yet</p>}
                {studentSessions.map(s => (
                  <div key={s.id} className="row" onClick={() => setSelectedSession(s)}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <span className="tag" style={{ background:MODALITY_COLORS[s.modality]+"22", color:MODALITY_COLORS[s.modality], border:`1px solid ${MODALITY_COLORS[s.modality]}44` }}>{s.modality}</span>
                        <span className="tag" style={{ background:"rgba(255,255,255,.05)", color:"#64748b", border:"1px solid rgba(255,255,255,.08)" }}>{s.difficulty}</span>
                      </div>
                      <span style={{ fontSize:11, color:"#4a5568" }}>{formatDate(s.created_at)}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#94a3b8" }}>
                      {s.patient_name} · {s.exchange_count} exchanges · {formatTime(s.duration_seconds)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {selectedSession && (
            <>
              <button className="btn-g" style={{ marginBottom:20 }} onClick={() => setSelectedSession(null)}>← Back to sessions</button>
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <span className="tag" style={{ background:MODALITY_COLORS[selectedSession.modality]+"22", color:MODALITY_COLORS[selectedSession.modality], border:`1px solid ${MODALITY_COLORS[selectedSession.modality]}44` }}>{selectedSession.modality}</span>
                  <span className="tag" style={{ background:"rgba(255,255,255,.05)", color:"#64748b", border:"1px solid rgba(255,255,255,.08)" }}>{selectedSession.difficulty}</span>
                  <span className="tag" style={{ background:"rgba(255,255,255,.05)", color:"#64748b", border:"1px solid rgba(255,255,255,.08)" }}>{formatTime(selectedSession.duration_seconds)}</span>
                </div>
                <div style={{ fontSize:13, color:"#64748b", marginBottom:4 }}>Patient: {selectedSession.patient_name} · {selectedSession.presenting}</div>
                <div style={{ fontSize:11, color:"#4a5568" }}>{formatDate(selectedSession.created_at)}</div>
              </div>

              <div className="card" style={{ marginBottom:16 }}>
                <div className="col-label" style={{ marginBottom:14 }}>AI Supervisor Feedback</div>
                {selectedSession.feedback ? (
                  <div className="fb" dangerouslySetInnerHTML={{ __html: selectedSession.feedback
                    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
                    .replace(/^## (.+)$/gm,"<h2>$1</h2>")
                    .replace(/\n/g,"<br/>")
                  }}/>
                ) : <p style={{ fontSize:13, color:"#4a5568" }}>No feedback recorded for this session</p>}
              </div>

              <div className="card">
                <div className="col-label" style={{ marginBottom:12 }}>Patient Hidden Profile</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { label:"Hidden Condition", value:selectedSession.hidden_condition },
                    { label:"Defense Mechanism", value:selectedSession.defense_mechanism },
                  ].map(item => (
                    <div key={item.label} style={{ background:"rgba(255,255,255,.03)", borderRadius:8, padding:"10px 12px" }}>
                      <div style={{ fontSize:11, color:"#4a5568", marginBottom:4 }}>{item.label}</div>
                      <div style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>{item.value||"—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
