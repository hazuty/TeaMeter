// C:\projects\teamwork-meter\src\TeamworkMeter.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===== Firebase =====
import { db } from "./firebase";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

// ====== Game config ======
const GOAL = 1000;
const STEP = 100;
const MILESTONES = Array.from({ length: GOAL / STEP + 1 }, (_, i) => i * STEP);

// ====== Images configuration ======
const DRAGONS_BASE = "dragons-team-hazut";
const DRAGON_EXT = "png";
const USE_STAGE_NAMING = false;

function imageForStage(stage) {
  const s = Math.max(0, Math.min(10, stage));
  if (USE_STAGE_NAMING) return `${DRAGONS_BASE}/stage-${s}.${DRAGON_EXT}`;
  return `${DRAGONS_BASE}/Dragons_${s * 100}.${DRAGON_EXT}`;
}
function imageForPoints(points) {
  const stage = Math.min(10, Math.floor(points / 100));
  return imageForStage(stage);
}

// ====== LocalStorage hook ======
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue];
}

// ====== Preload images ======
function usePreloadStages() {
  useEffect(() => {
    const imgs = [];
    for (let s = 0; s <= 10; s++) { const img = new Image(); img.src = imageForStage(s); imgs.push(img); }
    return () => imgs.splice(0, imgs.length);
  }, []);
}

function DragonPair({ points }) {
  usePreloadStages();
  const stage = useMemo(() => Math.min(10, Math.floor(points / 100)), [points]);
  const imgPath = useMemo(() => imageForPoints(points), [points]);
  return (
    <div className="flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.img
          key={stage}
          src={imgPath}
          alt={`Arbel & Geva – stage ${stage}`}
          className="max-h-80 sm:max-h-[28rem] w-auto object-contain select-none drop-shadow-[0_0_25px_rgba(0,0,0,0.6)]"
          draggable={false}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </AnimatePresence>
    </div>
  );
}

function MilestoneCelebration({ milestone, onDone }) {
  const EMOJIS = ["🐉", "🔥", "✨", "💥", "⭐", "🎊"];
  const items = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.25, emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  })), []);
  useEffect(() => { const t = setTimeout(() => onDone?.(), 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black" />
      <motion.div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-black border-4 border-amber-500 rounded-3xl shadow-2xl px-8 py-6 text-center text-amber-300" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
        <div className="text-lg tracking-widest mb-1">אבן דרך</div>
        <div className="text-4xl font-extrabold drop-shadow-[0_0_8px_#facc15]">{milestone} נק׳!</div>
        <div className="text-base mt-1">הדרקונים חזקים יותר! 🐲</div>
      </motion.div>
      {items.map(({ id, x, delay, emoji }) => (
        <motion.div key={id} className="absolute text-2xl select-none" initial={{ x: `${x}%`, y: "40%", opacity: 0 }} animate={{ y: ["40%", "0%", "-40%"], opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay, ease: "easeOut" }}>{emoji}</motion.div>
      ))}
    </div>
  );
}

function ConfirmDialog({ open, title, description, confirmText = "כן", cancelText = "בטל", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
        <motion.div className="relative bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-red-700 rounded-2xl shadow-xl p-6 w-[min(90vw,420px)] text-amber-200" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
          <div className="text-lg font-bold mb-1 text-red-400">{title}</div>
          <div className="text-sm mb-4">{description}</div>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-gray-700 text-gray-200">{cancelText}</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-600 text-white shadow">{confirmText}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SoundControls({ unlockAudio, safePlay, soundEnabled, addSoundRef }) {
  return (
    <div className="flex justify-center gap-3 mt-4 mb-0">
      <button onClick={unlockAudio} className={`px-3 py-1 rounded-xl border ${soundEnabled ? 'bg-green-700 text-white border-green-500' : 'bg-gray-700 text-amber-200 border-amber-500'}`}>{soundEnabled ? 'צלילים פעילים ✅' : 'הפעל צלילים 🔊'}</button>
      <button onClick={() => { unlockAudio(); safePlay(addSoundRef); }} className="px-3 py-1 rounded-xl border bg-gray-700 text-amber-200 border-amber-500">בדיקת צליל ▶️</button>
    </div>
  );
}

export default function TeamworkMeter() {
  // ===== Auth =====
  const [uid, setUid] = useState(null);
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (user) setUid(user.uid);
      else {
        try { const cred = await signInAnonymously(auth); setUid(cred.user.uid); }
        catch (e) { console.warn("Anonymous sign-in failed:", e); }
      }
    });
  }, []);

  // ===== Team ID from URL (?t=...) or LocalStorage =====
  const [teamId] = useState(() => {
    const KEY = "tm_team_id";
    try {
      const urlT = new URLSearchParams(window.location.search).get("t");
      if (urlT) { const clean = String(urlT).trim().slice(0, 40); localStorage.setItem(KEY, clean); return clean; }
      const saved = localStorage.getItem(KEY); if (saved) return saved;
    } catch {}
    const gen = "family-" + Math.random().toString(36).slice(2, 8);
    try { localStorage.setItem("tm_team_id", gen); } catch {}
    return gen;
  });

  // משקף את teamId ל-URL
  useEffect(() => {
    const p = new URLSearchParams(window.location.search); p.set("t", teamId);
    const newUrl = `${window.location.pathname}?${p.toString()}`; window.history.replaceState({}, "", newUrl);
  }, [teamId]);

  // ===== Local state =====
  const [points, setPoints] = useLocalStorage("tm_points", 0);
  const [log, setLog] = useLocalStorage("tm_log", []);
  const [manualDelta, setManualDelta] = useState(0);
  const [manualAdd, setManualAdd] = useState(0);
  const [rewardNote, setRewardNote] = useState("");
  const [celebrating, setCelebrating] = useState(null);

  // controls
  const [leftDown, setLeftDown] = useState(false);
  const [rightDown, setRightDown] = useState(false);
  const [coOpTriggered, setCoOpTriggered] = useState(false);
  const [selectedBoost, setSelectedBoost] = useState(10);
  const [confirm, setConfirm] = useState(null);
  const [manualAddReady, setManualAddReady] = useState(false);

  const holdTimer = useRef(null);

  // ===== Sounds =====
  const addSoundRef = useRef(null);
  const milestoneSoundRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  useEffect(() => {
    const a1 = new Audio("sounds/add-point.mp3"); a1.preload = "auto"; a1.volume = 0.7; addSoundRef.current = a1;
    const a2 = new Audio("sounds/milestone.mp3"); a2.preload = "auto"; a2.volume = 0.9; milestoneSoundRef.current = a2;
  }, []);
  const unlockAudio = () => setSoundEnabled(true);
  const safePlay = async (ref) => { const a = ref?.current; if (!a) return; try { a.currentTime = 0; await a.play(); } catch {} };

  // ===== Progress helpers =====
  const progressPct = Math.min(100, Math.round((points / GOAL) * 100));
  const nextMilestone = Math.min(GOAL, Math.ceil(points / STEP) * STEP);
  const toNext = Math.max(0, nextMilestone - points);
  const localPct = STEP === 0 ? 0 : Math.round(((points % STEP) / STEP) * 100);

  // ===== Cloud realtime =====
  const [cloudReady, setCloudReady] = useState(false);          // נשחרר autosave רק אחרי סנאפשוט מהשרת
  const applyingRemote = useRef(false);
  const firstServerSync = useRef(false);                        // חדש: זיהוי סנאפשוט מהשרת (לא מה-cache)

  useEffect(() => {
    if (!teamId) return;
    const ref = doc(db, "teams", teamId);

    // מזהים סנאפשוט מהשרת (ולא רק מה-cache) לפני שמאפשרים שמירה
    const unsub = onSnapshot(
      ref,
      { includeMetadataChanges: true },
      (snap) => {
        // אם עדיין לא קיבלנו סנאפשוט מהשרת – וזו רק תוצאת cache – מתעלמים
        if (!firstServerSync.current && snap.metadata.fromCache) {
          return;
        }

        // מכאן זה או מהשרת, או שכבר היה סנכרון ראשון
        firstServerSync.current = true;

        applyingRemote.current = true;

        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.points === "number") setPoints(data.points);
          if (Array.isArray(data.log)) setLog(data.log);
          if (typeof data.rewardNote === "string") setRewardNote(data.rewardNote);
        }

        // מתירים autosave רק אחרי שנגעו בשרת
        if (!cloudReady) setCloudReady(true);

        setTimeout(() => { applyingRemote.current = false; }, 50);
      },
      (err) => console.warn("Snapshot error:", err)
    );

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // Auto-save (דחוי) – לא בזמן יישום עדכון מרחוק ולא לפני טעינה ראשונה מהשרת
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!uid || !teamId || !cloudReady || applyingRemote.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const ref = doc(db, "teams", teamId);
        await setDoc(ref, {
          points,
          log,
          rewardNote,
          updatedAt: serverTimestamp(),
          members: arrayUnion(uid),
        }, { merge: true });
      } catch (e) {
        console.warn("Auto-save failed:", e);
      }
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [uid, teamId, points, log, rewardNote, cloudReady]);

  // ===== Game logic =====
  const changePoints = async (delta) => {
    if (!Number.isFinite(delta) || delta === 0) return;

    const prev = points;
    const next = Math.max(0, Math.min(GOAL, prev + delta));
    const applied = next - prev;
    if (applied === 0) return;

    if (applied > 0) safePlay(addSoundRef);

    const crossed = [];
    if (STEP > 0) {
      const fromIdx = Math.floor(prev / STEP) + 1;
      const toIdx   = Math.floor(next  / STEP);
      for (let i = fromIdx; i <= toIdx; i++) crossed.push(i * STEP);
    }
    setPoints(next);
    setLog((p) => [{ delta: applied, newTotal: next, ts: Date.now() }, ...p].slice(0, 100));
    if (crossed.length > 0) { safePlay(milestoneSoundRef); setCelebrating(crossed[0]); }

    // כתיבה אטומית לשרת – מונעת "הכתיבה האחרונה מנצחת"
    if (uid && teamId && cloudReady) {
      try {
        const ref = doc(db, "teams", teamId);
        await updateDoc(ref, {
          points: increment(applied),
          updatedAt: serverTimestamp(),
          members: arrayUnion(uid),
        });
      } catch {
        // אם המסמך עוד לא קיים – ניצור אותו
        try {
          const ref = doc(db, "teams", teamId);
          await setDoc(ref, {
            points: next,
            log,
            rewardNote,
            updatedAt: serverTimestamp(),
            members: arrayUnion(uid),
          }, { merge: true });
        } catch (e) {
          console.warn("Immediate update failed:", e);
        }
      }
    }
  };

  const doReset = () => { setPoints(0); setLog([]); setManualDelta(0); setManualAdd(0); setRewardNote(""); setCelebrating(null); };

  // שתי הכפות
  useEffect(() => {
    if (leftDown && rightDown) {
      if (!coOpTriggered) { changePoints(selectedBoost); setCoOpTriggered(true); }
      clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(() => setManualAddReady(true), 2000);
    } else {
      clearTimeout(holdTimer.current);
      setManualAddReady(false);
      setCoOpTriggered(false);
    }
    return () => clearTimeout(holdTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftDown, rightDown, selectedBoost, coOpTriggered]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-amber-200 font-serif p-4 sm:p-8">
      <h1 className="text-3xl font-extrabולד mb-1 text-center tracking-widest drop-shadow-[0_0_10px_#facc15]">כוח הצוות – מד שיתוף פעולה</h1>

      <div className="text-center text-sm text-amber-400 mb-5">
        מזהה קבוצה: <span className="font-mono">{teamId}</span>
        <button onClick={() => navigator.clipboard.writeText(`${location.origin}${location.pathname}?t=${teamId}`)} className="ml-2 px-2 py-1 rounded-xl bg-gray-700 text-amber-200 border border-amber-500">העתק קישור</button>
      </div>

      <div className="text-center mb-3 text-amber-300">הושגו <span dir="ltr">{points}</span> נק׳ מתוך <span dir="ltr">{GOAL}</span></div>

      <DragonPair points={points} />
      <AnimatePresence>{celebrating !== null && (<MilestoneCelebration key={celebrating} milestone={celebrating} onDone={() => setCelebrating(null)} />)}</AnimatePresence>

      {/* Secondary progress bar */}
      <div className="bg-gray-800/70 rounded-2xl border border-amber-500 p-4 mb-4 shadow-inner">
        <div className="flex items-center justify-between mb-1 text-sm">
          <div>עד היעד הבא</div>
          <div><span dir="ltr">{points % STEP} / {STEP}</span> נק׳ ({localPct}%)</div>
        </div>
        <div className="h-4 w-full rounded-lg bg-gray-700 overflow-hidden shadow-inner">
          <motion.div className="h-full rounded-lg bg-gradient-to-r from-amber-400 to-red-500" initial={false} animate={{ width: `${localPct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
        </div>
      </div>

      {/* Main progress bar */}
      <div className="bg_GRAY-800/70 rounded-2xl border border-amber-500 p-5 mb-4">
        <div className="flex items-center justify_between mb-2">
          <div>התקדמות כוללת</div>
          <div className="font-semibold"><span dir="ltr">{points} / {GOAL}</span> נק׳ ({progressPct}%)</div>
        </div>
        <div className="space-y-2">
          <div className="relative h-8 w-full rounded-xl bg-gray-700 overflow-hidden shadow-inner">
            <motion.div className="h-full rounded-xl" style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444,#7c3aed)" }} initial={false} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.7, ease: "easeOut" }} />
            {MILESTONES.map((m) => (
              <div key={m} className="absolute top-0 h-full" style={{ left: `${(m/GOAL)*100}%` }}>
                <div className="w-px h-full bg-amber-300/60" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-11 text-[10px] sm:text-xs text-amber-400">
            {MILESTONES.map((m) => (<div key={m} className="text-center whitespace-nowrap" dir="ltr">{m}</div>))}
          </div>
        </div>
        <div className="mt-3 text-sm text-amber-200">יעד הבא: <span className="font-semibold" dir="ltr">{nextMilestone}</span> (נשארו <span className="font-semibold" dir="ltr">{toNext}</span> נק׳)</div>
      </div>

      {/* Boost selector + manual add */}
      <div className="bg-gray-800/70 rounded-2xl border border-amber-500 p-4 mb-3">
        <div className="text-sm mb-2">בחרו בוסט (נוסף רק כששתי כפות נלחצות יחד):</div>
        <div className="flex justify-center gap-2">
          {[10,20,30].map(v => (
            <button key={v} onClick={() => setSelectedBoost(v)} className={`px-3 py-2 rounded-xl text-sm shadow border transition ${selectedBoost===v? 'bg-amber-600 text-white border-amber-400' : 'bg-gray-700 text-amber-200 border-gray-600 hover:bg-gray-600'}`}>+{v}</button>
          ))}
        </div>
        <div className="mt-3 flex justify-center items-center gap-2 text-sm">
          <label>הוסף ידנית:</label>
          <input type="number" value={manualAdd} onChange={(e) => setManualAdd(Number(e.target.value || 0))} className="w-24 rounded-xl border border-amber-500/60 bg-gray-900 text-amber-100 px-2 py-1 text-right" />
          <button onClick={() => { if (manualAdd > 0 && manualAddReady) { unlockAudio(); changePoints(manualAdd); } }} disabled={manualAdd <= 0 || !manualAddReady} className="px-3 py-1 rounded-xl bg-green-700 text-white border border-green-500 shadow hover:bg-green-600 disabled:opacity-50">הוסף</button>
        </div>
        {!manualAddReady && <div className="text-xs text-red-400 mt-1">כדי להוסיף ידנית יש להחזיק את שתי הכפות יחד למשך 2 שניות</div>}
      </div>

      <div className="bg-gray-800/70 rounded-2xl border border-amber-500 p-3 mb-3">
        <label className="text-sm mr-2">תגמול בהגעה ליעד:</label>
        <input type="text" value={rewardNote} onChange={(e)=>setRewardNote(e.target.value)} placeholder="לדוגמה – חטיף, זמן משחק..." className="w-60 rounded-xl border border-amber-500/60 bg-gray-900 text-amber-100 px-3 py-2 text-right" />
      </div>

      {/* Cooperation buttons */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex justify-center gap-10 select-none">
          <motion.button onPointerDown={() => { unlockAudio(); setLeftDown(true); }} onPointerUp={() => setLeftDown(false)} onPointerLeave={() => setLeftDown(false)} animate={leftDown ? { scale: [1, 1.12, 1.08] } : { scale: 1 }} transition={{ duration: 0.25 }} className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-4 border-amber-600 bg-gray-900">
            <img src={`${DRAGONS_BASE}/foot_arbel.${DRAGON_EXT}`} alt="foot arbel" className="w-full h-full object-contain" />
          </motion.button>
          <motion.button onPointerDown={() => { unlockAudio(); setRightDown(true); }} onPointerUp={() => setRightDown(false)} onPointerLeave={() => setRightDown(false)} animate={rightDown ? { scale: [1, 1.12, 1.08] } : { scale: 1 }} transition={{ duration: 0.25 }} className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-4 border-red-600 bg-gray-900">
            <img src={`${DRAGONS_BASE}/foot_geva.${DRAGON_EXT}`} alt="foot geva" className="w-full h-full object-contain" />
          </motion.button>
        </div>
        <div className="text-xs text-amber-300 mt-2">כדי להתקדם: לחצו על שתי הכפות יחד. בוסט נבחר: <span className="font-semibold" dir="ltr">+{selectedBoost}</span>{manualAddReady ? ' — ניתן כעת להוסיף ידנית' : ''}</div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/70 rounded-2xl border border-amber-500 p-5 mb-6">
        <div className="flex flex_wrap gap-2 mb-3">
          <button onClick={() => setConfirm({ type: 'reset' })} className="rounded-xl px-4 py-2 bg-gray-700 text-amber-200 border border-amber-500 hover:bg-gray-600">איפוס</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm">שינוי ידני (הפחתה בלבד):</label>
          <input type="number" value={manualDelta} onChange={(e) => setManualDelta(Number(e.target.value || 0))} className="w-28 rounded-xl border border-amber-500/60 bg-gray-900 text-amber-100 px-3 py-2 text-right" />
          <button onClick={() => manualDelta > 0 && setConfirm({ type: 'decrease', amount: Math.abs(manualDelta) })} className="rounded-xl px-3 py-2 bg-red-700 text-white border border-red-500 shadow hover:bg-red-600 disabled:opacity-50" disabled={manualDelta <= 0}>הפחת</button>
          <button onClick={() => setManualDelta(0)} className="rounded-xl px-3 py-2 bg-gray-700 text-amber-200 border border-amber-500 hover:bg-gray-600">נקה</button>
        </div>
      </div>

      {/* Change log */}
      <div className="bg-gray-800/70 rounded-2xl border border-amber-500 p-5">
        <div className="mb-2 text-amber-300">יומן שינויים</div>
        <ul className="space-y-1 max-h-56 overflow-auto pr-1">
          {log.map((entry, i) => (
            <li key={i} className="text-sm">{entry.delta > 0 ? '+' : ''}{entry.delta} נק׳ → סה״כ <span dir="ltr">{entry.newTotal}</span></li>
          ))}
        </ul>
      </div>

      {/* 🔊 Sound controls */}
      <SoundControls unlockAudio={unlockAudio} safePlay={safePlay} soundEnabled={soundEnabled} addSoundRef={addSoundRef} />

      {/* Confirm dialogs */}
      <ConfirmDialog open={!!confirm && confirm.type === 'reset'} title="לאפס את כל הנקודות?" description="הפעולה תאפס את ההתקדמות והיומן כולו. האם להמשיך?" confirmText="אפס" onConfirm={() => { doReset(); setConfirm(null); }} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={!!confirm && confirm.type === 'decrease'} title="להפחית נקודות?" description={confirm?.amount ? `יופחתו ${confirm.amount} נק׳ מהסך הנוכחי.` : ''} confirmText="הפחת" onConfirm={() => { if (confirm?.amount) changePoints(-Math.abs(confirm.amount)); setConfirm(null); }} onCancel={() => setConfirm(null)} />
    </div>
  );
}
