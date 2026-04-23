"use client";
import { useState, useEffect, useRef } from "react";
import { CASES, getCase, buildPatientPrompt } from "./cases";

const MODALITIES = [
  { id: "transpersonal", label: "Transpersonal", labelEs: "Transpersonal", icon: "✦", color: "#7c6fcd", desc: "Spiritual growth & peak experiences", descEs: "Crecimiento espiritual y experiencias cumbre" },
  { id: "cbt", label: "CBT", labelEs: "TCC", icon: "◈", color: "#4a90a4", desc: "Cognitive behavioral patterns", descEs: "Patrones cognitivo-conductuales" },
  { id: "humanistic", label: "Humanistic", labelEs: "Humanista", icon: "◎", color: "#5a9e6f", desc: "Person-centered empathy", descEs: "Empatía centrada en la persona" },
  { id: "psychodynamic", label: "Psychodynamic", labelEs: "Psicodinámica", icon: "◑", color: "#c4875a", desc: "Unconscious patterns & early life", descEs: "Patrones inconscientes y vida temprana" },
  { id: "existential", label: "Existential", labelEs: "Existencial", icon: "∞", color: "#a05a7c", desc: "Meaning, freedom & authenticity", descEs: "Significado, libertad y autenticidad" },
  { id: "somatic", label: "Somatic", labelEs: "Somática", icon: "⬡", color: "#7a9e5a", desc: "Body-mind connection", descEs: "Conexión cuerpo-mente" },
];

const DIFFICULTY = [
  { id: "beginner", label: "Beginner", labelEs: "Principiante", desc: "Cooperative patients, mild presentations", descEs: "Pacientes cooperativos, presentaciones leves" },
  { id: "intermediate", label: "Intermediate", labelEs: "Intermedio", desc: "Some resistance, moderate complexity", descEs: "Algo de resistencia, complejidad moderada" },
  { id: "advanced", label: "Advanced", labelEs: "Avanzado", desc: "Highly defended, complex trauma", descEs: "Muy defendidos, trauma complejo" },
];

const T = {
  en: {
    tagline: "Clinical Training Simulator", subtitle: "Practice therapy with AI patients",
    pickModality: "Choose modality", pickDifficulty: "Difficulty level",
    pickPatient: "Choose patient", randomPatient: "Random patient",
    startSession: "Start Session", endSession: "End Session",
    newSession: "New Session", you: "Therapist", patient: "Patient",
    placeholder: "Type your response...", send: "Send",
    active: "Session active", sessionLabel: "Session",
    feedbackTitle: "Clinical Feedback", loading: "Preparing patient...",
    ended: "Session complete", langToggle: "ES",
    disclaimer: "Educational use only · Not a substitute for supervised clinical training",
    speaking: "Speaking...", voiceOn: "Voice ON", voiceOff: "Voice OFF",
    holdMic: "Hold to speak", releaseMic: "Release to send",
    analyzing: "Analyzing session...", noMic: "Use keyboard to respond",
    sessionSummary: "Session Summary", exchanges: "exchanges",
    reveal: "Reveal patient profile", hide: "Hide profile",
  },
  es: {
    tagline: "Simulador de Entrenamiento Clínico", subtitle: "Practica terapia con pacientes IA",
    pickModality: "Elige modalidad", pickDifficulty: "Nivel de dificultad",
    pickPatient: "Elige paciente", randomPatient: "Paciente aleatorio",
    startSession: "Iniciar Sesión", endSession: "Terminar Sesión",
    newSession: "Nueva Sesión", you: "Terapeuta", patient: "Paciente",
    placeholder: "Escribe tu respuesta...", send: "Enviar",
    active: "Sesión activa", sessionLabel: "Sesión",
    feedbackTitle: "Retroalimentación Clínica", loading: "Preparando paciente...",
    ended: "Sesión completada", langToggle: "EN",
    disclaimer: "Solo uso educativo · No sustituye la supervisión clínica",
    speaking: "Hablando...", voiceOn: "Voz ON", voiceOff: "Voz OFF",
    holdMic: "Mantén para hablar", releaseMic: "Suelta para enviar",
    analyzing: "Analizando sesión...", noMic: "Usa el teclado para responder",
    sessionSummary: "Resumen de Sesión", exchanges: "intercambios",
    reveal: "Revelar perfil del paciente", hide: "Ocultar perfil",
  }
};

function PatientAvatar({ speaking, size = 100 }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="faceGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#f5e6d3"/>
            <stop offset="100%" stopColor="#dbb99a"/>
          </radialGradient>
        </defs>
        {/* Outer glow when speaking */}
        {speaking && <circle cx="50" cy="50" r="49" fill="none" stroke="#4a90a4" strokeWidth="2" opacity="0.4" style={{ animation: "speakPulse 1s ease-in-out infinite" }}/>}
        {/* Neck */}
        <rect x="38" y="74" width="24" height="20" rx="4" fill="#dbb99a"/>
        {/* Shoulders */}
        <ellipse cx="50" cy="96" rx="36" ry="12" fill="#2d4a6b"/>
        {/* Head */}
        <circle cx="50" cy="46" r="34" fill="url(#faceGrad)"/>
        {/* Hair */}
        <path d="M 16 46 Q 16 14 50 10 Q 84 14 84 46 Q 80 20 50 18 Q 20 20 16 46Z" fill="#3d2b1f"/>
        {/* Eyes */}
        <ellipse cx="37" cy="43" rx="5" ry="5.5" fill="white"/>
        <circle cx="37" cy="43" r="3" fill="#2c1810"/>
        <circle cx="38.5" cy="41.5" r="1" fill="white"/>
        <ellipse cx="63" cy="43" rx="5" ry="5.5" fill="white"/>
        <circle cx="63" cy="43" r="3" fill="#2c1810"/>
        <circle cx="64.5" cy="41.5" r="1" fill="white"/>
        {/* Eyebrows */}
        <path d="M 31 37 Q 37 34 43 37" stroke="#3d2b1f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 57 37 Q 63 34 69 37" stroke="#3d2b1f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Nose */}
        <path d="M 50 46 L 47 55 Q 50 57 53 55 L 50 46" stroke="#c4956a" strokeWidth="1" fill="none"/>
        {/* Mouth */}
        {speaking
          ? <ellipse cx="50" cy="63" rx="7" ry="5" fill="#8b4a3a" stroke="#c4956a" strokeWidth="0.5"/>
          : <path d="M 43 63 Q 50 67 57 63" stroke="#c4956a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        }
      </svg>
    </div>
  );
}

function StepIndicator({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === step ? 20 : 6, height: 6, borderRadius: 3,
          background: i <= step ? "#4a90a4" : "rgba(255,255,255,0.15)",
          transition: "all 0.3s ease"
        }}/>
      ))}
    </div>
  );
}

export default function PsychoSim() {
  const [lang, setLang] = useState("en");
  const [step, setStep] = useState(0); // 0=modality, 1=difficulty, 2=patient, 3=session, 4=feedback
  const [modality, setModality] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [currentCase, setCurrentCase] = useState(null);
  const [availableCases, setAvailableCases] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionCount, setSessionCount] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [hasMicAPI, setHasMicAPI] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const pendingTranscriptRef = useRef("");
  const currentAudioRef = useRef(null);
  const timerRef = useRef(null);
  const t = T[lang];
  const sel = MODALITIES.find(m => m.id === modality);
  const selDiff = DIFFICULTY.find(d => d.id === difficulty);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isThinking]);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasMicAPI(!!SR);
  }, []);
  useEffect(() => {
    if (modality && difficulty) {
      setAvailableCases(CASES[modality]?.[difficulty] || []);
      setCurrentCase(null);
    }
  }, [modality, difficulty]);
  useEffect(() => {
    if (step === 3) {
      timerRef.current = setInterval(() => setSessionTime(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  function formatTime(s) {
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }

  async function callChat(system, msgs) {
    const r = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages: msgs }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return d.text;
  }

  async function speakText(text) {
    if (!voiceEnabled) return;
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    
    // Call ElevenLabs directly from browser (avoids server CORS issues)
    const VOICE_EN = "21m00Tcm4TlvDq8ikWAM"; // Rachel
    const VOICE_ES = "pFZP5JQG7iQjIQuC4Bku"; // Valentina
    const voiceId = lang === "es" ? VOICE_ES : VOICE_EN;
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    
    try {
      setIsSpeaking(true);
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 }
        }),
      });
      if (!r.ok) throw new Error("ElevenLabs failed");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); setIsSpeaking(false); currentAudioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); };
      await audio.play();
    } catch {
      setIsSpeaking(false);
      // Fallback to browser TTS
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "es" ? "es-ES" : "en-US";
        u.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      }
    }
  }

  async function sendText(text) {
    if (!text.trim() || isThinking) return;
    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next); setInput(""); setIsThinking(true);
    try {
      const systemPrompt = buildPatientPrompt(currentCase, lang);
      const reply = await callChat(systemPrompt, next.map(m => ({ role: m.role, content: m.content })));
      setMessages(p => [...p, { role: "assistant", content: reply }]);
      setIsThinking(false);
      speakText(reply);
    } catch(e) {
      setErrorMsg(e.message);
      setMessages(p => [...p, { role: "assistant", content: "..." }]);
      setIsThinking(false);
    }
  }

  function startRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (currentAudioRef.current) { currentAudioRef.current.pause(); setIsSpeaking(false); }
    pendingTranscriptRef.current = "";
    const rec = new SR();
    rec.lang = lang === "es" ? "es-ES" : "en-US";
    rec.continuous = false; rec.interimResults = true;
    rec.onresult = e => {
      const txt = Array.from(e.results).map(r => r[0].transcript).join("");
      pendingTranscriptRef.current = txt;
      setInput(txt);
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start(); setIsRecording(true);
  }

  function stopRec() {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setTimeout(() => {
      const txt = pendingTranscriptRef.current;
      if (txt.trim()) { sendText(txt); setInput(""); pendingTranscriptRef.current = ""; }
    }, 350);
  }

  async function startSession() {
    const chosenCase = currentCase || getCase(modality, difficulty, lang);
    setCurrentCase(chosenCase);
    setStep(3); setErrorMsg(""); setSessionTime(0);
    const systemPrompt = buildPatientPrompt(chosenCase, lang);
    try {
      const reply = await callChat(systemPrompt, [{ role: "user", content: "Hello, I'm your therapist. Please introduce yourself." }]);
      setMessages([
        { role: "user", content: "Hello, I'm your therapist. Please introduce yourself.", hidden: true },
        { role: "assistant", content: reply }
      ]);
      // Don't auto-play - wait for user gesture to avoid browser blocking
    } catch(e) { setErrorMsg(e.message || "Connection error."); setStep(2); }
  }

  async function endSession() {
    if (currentAudioRef.current) { currentAudioRef.current.pause(); setIsSpeaking(false); }
    setStep(4); setIsFeedbackLoading(true);
    try {
      const r = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modality, difficulty, messages, lang }),
      });
      const d = await r.json();
      setFeedback(d.text || d.error);
    } catch { setFeedback("Could not generate feedback."); }
    setIsFeedbackLoading(false);
  }

  function reset() {
    if (currentAudioRef.current) { currentAudioRef.current.pause(); }
    window.speechSynthesis?.cancel();
    setStep(0); setMessages([]); setFeedback(""); setModality(null);
    setDifficulty(null); setCurrentCase(null);
    setSessionCount(s => s + 1); setIsSpeaking(false); setInput("");
    setShowProfile(false); setSessionTime(0);
  }

  const exchangeCount = messages.filter(m => !m.hidden && m.role === "user").length;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f1117; font-family: 'Inter', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 4px; }
    textarea { resize: none; font-family: 'Inter', sans-serif; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
    @keyframes speakPulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.8;transform:scale(1.04)} }
    @keyframes micRing { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 12px rgba(239,68,68,0)} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    .fade-up { animation: fadeUp 0.4s ease forwards; }
    .fade-in { animation: fadeIn 0.3s ease forwards; }

    .glass {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
    }
    .glass-hover {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .glass-hover:hover {
      background: rgba(255,255,255,0.07);
      border-color: rgba(255,255,255,0.15);
      transform: translateY(-1px);
    }

    .mod-card {
      background: rgba(255,255,255,0.03);
      border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 18px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .mod-card:hover { background: rgba(255,255,255,0.06); transform: translateY(-2px); }
    .mod-card.active { border-width: 2px; background: rgba(255,255,255,0.06); }

    .diff-card {
      background: rgba(255,255,255,0.03);
      border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 16px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .diff-card:hover { background: rgba(255,255,255,0.06); }
    .diff-card.active { background: rgba(74,144,164,0.12); border-color: rgba(74,144,164,0.5); }

    .patient-card {
      background: rgba(255,255,255,0.03);
      border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 14px 18px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .patient-card:hover { background: rgba(255,255,255,0.06); }
    .patient-card.active { background: rgba(74,144,164,0.12); border-color: rgba(74,144,164,0.5); }

    .btn-primary {
      background: linear-gradient(135deg, #4a90a4, #357a8a);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,144,164,0.35); }
    .btn-primary:disabled { background: #2a2d3a; color: #555; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-ghost {
      background: transparent;
      color: #8892a4;
      border: 1px solid rgba(255,255,255,0.12);
      padding: 10px 20px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.06); color: #cdd5e0; border-color: rgba(255,255,255,0.2); }

    .btn-danger {
      background: rgba(239,68,68,0.1);
      color: #f87171;
      border: 1px solid rgba(239,68,68,0.25);
      padding: 10px 20px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-danger:hover { background: rgba(239,68,68,0.18); }

    .msg-therapist {
      background: linear-gradient(135deg, rgba(74,144,164,0.2), rgba(74,144,164,0.12));
      border: 1px solid rgba(74,144,164,0.25);
      border-radius: 16px 4px 16px 16px;
      padding: 13px 16px;
      max-width: 78%;
      align-self: flex-end;
    }
    .msg-patient {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 4px 16px 16px 16px;
      padding: 13px 16px;
      max-width: 78%;
      align-self: flex-start;
    }

    .input-field {
      background: rgba(255,255,255,0.05);
      border: 1.5px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 12px 16px;
      color: #e2e8f0;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
    }
    .input-field:focus { border-color: rgba(74,144,164,0.6); }
    .input-field::placeholder { color: #4a5568; }

    .mic-btn {
      width: 52px; height: 52px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      border: 2px solid rgba(74,144,164,0.4);
      background: rgba(74,144,164,0.08);
      color: #4a90a4;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    .mic-btn:hover { background: rgba(74,144,164,0.15); border-color: rgba(74,144,164,0.7); }
    .mic-btn.recording { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.7); color: #ef4444; animation: micRing 1s ease-in-out infinite; }
    .mic-btn:disabled { opacity: 0.3; cursor: not-allowed; animation: none; }

    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: pulse 2s ease-in-out infinite; }

    .wave-bar { width: 3px; border-radius: 3px; background: #4a90a4; animation: speakPulse 0.6s ease-in-out infinite; }

    .tag {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 500; letter-spacing: 0.4px;
    }

    .fb-content strong { color: #7dd3fc; }
    .fb-content h2 { font-size: 17px; color: #e2e8f0; margin: 20px 0 8px; font-family: 'Playfair Display', serif; }
    .fb-content h3 { font-size: 14px; color: #94a3b8; margin: 14px 0 6px; text-transform: uppercase; letter-spacing: 1px; }
    .fb-content { line-height: 1.85; font-size: 14px; color: #94a3b8; }
  `;

  // ── SCREENS ──────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      <style>{css}</style>

      {/* TOP NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(15,17,23,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #4a90a4, #7c6fcd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white" }}>P</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#e2e8f0" }}>PsychoSim</span>
          <span style={{ fontSize: 11, color: "#4a5568", fontWeight: 500, letterSpacing: 0.5, marginLeft: 4 }}>v2</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {step === 3 && (
            <>
              <div className="tag" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                <div className="status-dot" style={{ width: 5, height: 5 }}/>
                {formatTime(sessionTime)}
              </div>
              <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => { setVoiceEnabled(v=>!v); if(currentAudioRef.current){currentAudioRef.current.pause();setIsSpeaking(false);} }}>
                {voiceEnabled ? t.voiceOn : t.voiceOff}
              </button>
            </>
          )}
          <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => setLang(l => l==="en"?"es":"en")}>
            {t.langToggle}
          </button>
        </div>
      </nav>

      <div style={{ paddingTop: 60, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ── STEP 0: MODALITY ─────────────────────────────────── */}
        {step === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", maxWidth: 760, margin: "0 auto", width: "100%" }}>
            <div className="fade-up" style={{ width: "100%" }}>
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "#4a90a4", textTransform: "uppercase", marginBottom: 10 }}>{t.tagline}</p>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 600, lineHeight: 1.2, color: "#e2e8f0", marginBottom: 8 }}>
                  {lang === "en" ? "What will you practice today?" : "¿Qué vas a practicar hoy?"}
                </h1>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>{t.subtitle}</p>
              </div>

              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: "#4a5568", textTransform: "uppercase", marginBottom: 14 }}>{t.pickModality}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 32 }}>
                {MODALITIES.map(m => (
                  <div key={m.id} className={`mod-card ${modality===m.id?"active":""}`}
                    style={{ borderColor: modality===m.id ? m.color+"88" : undefined }}
                    onClick={() => setModality(m.id)}>
                    <div style={{ fontSize: 22, marginBottom: 8, color: m.color }}>{m.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: modality===m.id ? "#e2e8f0" : "#94a3b8", marginBottom: 4 }}>{lang==="es"?m.labelEs:m.label}</div>
                    <div style={{ fontSize: 11, color: "#4a5568", lineHeight: 1.4 }}>{lang==="es"?m.descEs:m.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StepIndicator step={0} total={3} />
                <button className="btn-primary" disabled={!modality} onClick={() => setStep(1)}>
                  {lang==="en"?"Continue →":"Continuar →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: DIFFICULTY ───────────────────────────────── */}
        {step === 1 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
            <div className="fade-up" style={{ width: "100%" }}>
              <div style={{ marginBottom: 40 }}>
                <button className="btn-ghost" style={{ marginBottom: 20, fontSize: 12 }} onClick={() => setStep(0)}>← {lang==="en"?"Back":"Volver"}</button>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22, color: sel?.color }}>{sel?.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: sel?.color }}>{lang==="es"?sel?.labelEs:sel?.label}</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 600, color: "#e2e8f0" }}>{t.pickDifficulty}</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
                {DIFFICULTY.map((d, i) => {
                  const colors = ["#22c55e","#f59e0b","#ef4444"];
                  return (
                    <div key={d.id} className={`diff-card ${difficulty===d.id?"active":""}`} onClick={() => setDifficulty(d.id)}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ display: "flex", gap: 3 }}>
                            {Array.from({length:3}).map((_,j)=>(
                              <div key={j} style={{ width: 8, height: 8, borderRadius: 2, background: j<=i ? colors[i] : "#2a2d3a" }}/>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: difficulty===d.id?"#e2e8f0":"#94a3b8" }}>{lang==="es"?d.labelEs:d.label}</div>
                            <div style={{ fontSize: 12, color: "#4a5568", marginTop: 2 }}>{lang==="es"?d.descEs:d.desc}</div>
                          </div>
                        </div>
                        {difficulty===d.id && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#4a90a4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white" }}>✓</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StepIndicator step={1} total={3} />
                <button className="btn-primary" disabled={!difficulty} onClick={() => setStep(2)}>
                  {lang==="en"?"Continue →":"Continuar →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: PATIENT SELECTION ────────────────────────── */}
        {step === 2 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
            <div className="fade-up" style={{ width: "100%" }}>
              <div style={{ marginBottom: 32 }}>
                <button className="btn-ghost" style={{ marginBottom: 20, fontSize: 12 }} onClick={() => setStep(1)}>← {lang==="en"?"Back":"Volver"}</button>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{t.pickPatient}</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="tag" style={{ background: sel?.color+"22", color: sel?.color, border: `1px solid ${sel?.color}44` }}>{lang==="es"?sel?.labelEs:sel?.label}</span>
                  <span className="tag" style={{ background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>{lang==="es"?selDiff?.labelEs:selDiff?.label}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32, maxHeight: 380, overflowY: "auto" }}>
                {/* Random */}
                <div className={`patient-card ${!currentCase?"active":""}`} onClick={() => setCurrentCase(null)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4a90a4, #7c6fcd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎲</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: !currentCase?"#e2e8f0":"#94a3b8" }}>{t.randomPatient}</div>
                      <div style={{ fontSize: 12, color: "#4a5568" }}>{lang==="en"?"Assigned randomly each session":"Asignado aleatoriamente"}</div>
                    </div>
                  </div>
                </div>

                {availableCases.map((c, idx) => (
                  <div key={c.id} className={`patient-card ${currentCase?.id===c.id?"active":""}`} onClick={() => setCurrentCase(c)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${idx*55+180}, 35%, 35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: currentCase?.id===c.id?"#e2e8f0":"#94a3b8" }}>{c.name}</span>
                          <span style={{ fontSize: 11, color: "#4a5568", flexShrink: 0, marginLeft: 8 }}>{c.occupation}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#4a5568", marginTop: 3, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.presenting}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errorMsg && <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>⚠ {errorMsg}</div>}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StepIndicator step={2} total={3} />
                <button className="btn-primary" onClick={startSession}>
                  {t.startSession}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: SESSION ──────────────────────────────────── */}
        {step === 3 && (
          <div style={{ flex: 1, display: "flex", height: "calc(100vh - 60px)" }}>
            {/* Left sidebar — patient info */}
            <div style={{ width: 240, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20, flexShrink: 0 }}>
              {/* Avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <PatientAvatar speaking={isSpeaking} size={110}/>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{currentCase?.name || "Patient"}</div>
                  <div style={{ fontSize: 12, color: "#4a5568", marginTop: 2 }}>{currentCase?.occupation}</div>
                </div>
                {isSpeaking && (
                  <div style={{ display: "flex", gap: 3, alignItems: "center", padding: "5px 10px", background: "rgba(74,144,164,0.1)", border: "1px solid rgba(74,144,164,0.2)", borderRadius: 20 }}>
                    {[0,1,2,3,2,1,0].map((_,i)=><div key={i} className="wave-bar" style={{ height: 4+_*3, animationDelay:`${i*0.08}s` }}/>)}
                    <span style={{ fontSize: 10, color: "#4a90a4", marginLeft: 4 }}>{t.speaking}</span>
                  </div>
                )}
              </div>

              {/* Session stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "#2d3748", textTransform: "uppercase" }}>Session</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: lang==="en"?"Modality":"Modalidad", value: lang==="es"?sel?.labelEs:sel?.label, color: sel?.color },
                    { label: lang==="en"?"Difficulty":"Dificultad", value: lang==="es"?selDiff?.labelEs:selDiff?.label },
                    { label: lang==="en"?"Duration":"Duración", value: formatTime(sessionTime) },
                    { label: lang==="en"?"Exchanges":"Intercambios", value: exchangeCount },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#4a5568" }}>{item.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: item.color || "#94a3b8" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient complaint (visible) */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: "#4a5568", textTransform: "uppercase", marginBottom: 8 }}>
                  {lang==="en"?"Presenting":"Motivo de consulta"}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{currentCase?.presenting}</div>
              </div>

              {/* Reveal profile button */}
              <button className="btn-ghost" style={{ fontSize: 11, padding: "8px 12px", marginTop: "auto" }} onClick={() => setShowProfile(v=>!v)}>
                {showProfile ? t.hide : t.reveal}
              </button>
              {showProfile && currentCase && (
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                  <div style={{ color: "#f87171", fontWeight: 600, marginBottom: 6 }}>⚠ Hidden Profile</div>
                  <div><b>Condition:</b> {currentCase.hiddenCondition}</div>
                  <div style={{ marginTop: 4 }}><b>Defense:</b> {currentCase.defense}</div>
                </div>
              )}
            </div>

            {/* Main chat area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              {/* Chat header */}
              <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="status-dot"/>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>{t.active}</span>
                </div>
                <button className="btn-danger" onClick={endSession} style={{ fontSize: 12 }}>{t.endSession}</button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                {messages.filter(m=>!m.hidden).map((m, i) => (
                  <div key={i} className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: m.role==="user"?"flex-end":"flex-start" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: "#2d3748", textTransform: "uppercase", marginBottom: 5, padding: "0 4px" }}>
                      {m.role==="user" ? t.you : t.patient}
                    </span>
                    <div className={m.role==="user"?"msg-therapist":"msg-patient"}>
                      <p style={{ fontSize: 14, lineHeight: 1.75, color: m.role==="user"?"#bfdbfe":"#cbd5e1" }}>{m.content}</p>
                      {m.role==="assistant" && (
                        <button onClick={() => speakText(m.content)} style={{ marginTop: 6, background: "transparent", border: "none", color: "#4a90a4", fontSize: 11, cursor: "pointer", padding: 0, opacity: 0.7 }}>
                          🔊 {lang==="es"?"Escuchar":"Listen"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: "#2d3748", textTransform: "uppercase", marginBottom: 5, padding: "0 4px" }}>{t.patient}</span>
                    <div className="msg-patient" style={{ display: "flex", gap: 5, alignItems: "center", padding: "14px 18px" }}>
                      {[0,1,2].map(i=><div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#4a5568", animation: `pulse 1.2s ${i*0.2}s infinite` }}/>)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* Input area */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
                {errorMsg && <div style={{ marginBottom: 8, fontSize: 12, color: "#f87171" }}>⚠ {errorMsg}</div>}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  {hasMicAPI && (
                    <button className={`mic-btn ${isRecording?"recording":""}`}
                      onMouseDown={startRec} onMouseUp={stopRec}
                      onTouchStart={e=>{e.preventDefault();startRec();}} onTouchEnd={e=>{e.preventDefault();stopRec();}}
                      disabled={isThinking||isSpeaking} title={isRecording?t.releaseMic:t.holdMic}>
                      🎙
                    </button>
                  )}
                  <textarea className="input-field"
                    value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendText(input);}}}
                    placeholder={hasMicAPI?t.placeholder:t.noMic}
                    rows={2} style={{ flex: 1 }}
                  />
                  <button className="btn-primary" onClick={()=>sendText(input)} disabled={!input.trim()||isThinking} style={{ padding: "13px 20px", flexShrink: 0 }}>
                    {t.send}
                  </button>
                </div>
                {hasMicAPI && (
                  <p style={{ fontSize: 11, color: "#2d3748", textAlign: "center", marginTop: 8 }}>
                    {isRecording ? `🔴 ${t.releaseMic}` : `🎙 ${t.holdMic}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: FEEDBACK ─────────────────────────────────── */}
        {step === 4 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
            <div className="fade-up" style={{ width: "100%" }}>
              {/* Header */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <span className="tag" style={{ background: sel?.color+"22", color: sel?.color, border: `1px solid ${sel?.color}44` }}>{lang==="es"?sel?.labelEs:sel?.label}</span>
                  <span className="tag" style={{ background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>{formatTime(sessionTime)}</span>
                  <span className="tag" style={{ background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>{exchangeCount} {t.exchanges}</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{t.feedbackTitle}</h2>
                {currentCase && <p style={{ fontSize: 14, color: "#4a5568" }}>{t.patient}: {currentCase.name} · {currentCase.presenting}</p>}
              </div>

              {/* Feedback content */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "32px", marginBottom: 32 }}>
                {isFeedbackLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 0" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[0,1,2].map(i=><div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4a90a4", animation: `pulse 1s ${i*0.2}s infinite` }}/>)}
                    </div>
                    <span style={{ fontSize: 14, color: "#4a5568" }}>{t.analyzing}</span>
                  </div>
                ) : (
                  <div className="fb-content" dangerouslySetInnerHTML={{ __html: feedback
                    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
                    .replace(/^## (.+)$/gm,"<h2>$1</h2>")
                    .replace(/^### (.+)$/gm,"<h3>$1</h3>")
                    .replace(/^(\d+\.\s)/gm,"<br/>$1")
                    .replace(/\n/g,"<br/>")
                  }}/>
                )}
              </div>

              {/* Patient profile reveal */}
              {!isFeedbackLoading && currentCase && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px", marginBottom: 32 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: "#4a5568", textTransform: "uppercase", marginBottom: 12 }}>
                    {lang==="en"?"Patient Hidden Profile":"Perfil Oculto del Paciente"}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { label: lang==="en"?"Hidden Condition":"Condición Oculta", value: currentCase.hiddenCondition },
                      { label: lang==="en"?"Defense Mechanism":"Mecanismo de Defensa", value: currentCase.defense },
                    ].map(item => (
                      <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isFeedbackLoading && (
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn-primary" onClick={reset}>{t.newSession}</button>
                  <button className="btn-ghost" onClick={() => { setStep(2); setMessages([]); setFeedback(""); setSessionTime(0); }}>
                    {lang==="en"?"Same patient, new session":"Mismo paciente, nueva sesión"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Footer disclaimer */}
      {step !== 3 && (
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#2d3748" }}>{t.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
