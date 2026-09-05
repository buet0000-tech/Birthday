import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, Lock, ShieldCheck, Image as ImageIcon, Mic, Square, Upload, Trash2, ArrowUp, ArrowDown,
  Plus, Music, Settings2, HelpCircle, ScrollText, FileText, RotateCcw, Check, Play, Save, Undo2, CircleAlert,
} from "lucide-react";
import { useBook } from "../lib/book-store";
import { putMedia, newKey, shrinkImage, useMediaUrl } from "../lib/media";
import { musicCtl } from "../lib/musicctl";
import { EXTRA_LABEL, SCENE_LABEL, type Act, type BookPage, type ExtraKind, type SceneKey } from "../data/pages";
import { sfx } from "../lib/audio";
import { cn } from "../utils/cn";

type Tab = "page" | "quiz" | "wish" | "global";

const field = "glass w-full rounded-xl bg-transparent px-3 py-2.5 text-sm font-light text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none";
const btn = "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all active:scale-95";
const btnGhost = `${btn} glass text-cream/75 hover:border-gold-400/45 hover:text-gold-300`;
const btnGold = `${btn} bg-gradient-to-r from-gold-400 to-gold-500 text-velvet-900 hover:scale-[1.02]`;
const btnDanger = `${btn} border border-blush-500/40 bg-blush-500/10 text-blush-300 hover:bg-blush-500/20`;
const label = "mb-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-gold-400/70";

/* ═══════════ PIN gate ═══════════ */
function PinGate({ onOk, onClose }: { onOk: () => void; onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const { unlockEdit } = useBook();

  const press = (k: string) => {
    if (k === "del") { setPin((p) => p.slice(0, -1)); sfx.tick(); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    sfx.tick();
    if (next.length === 4) {
      if (unlockEdit(next)) { sfx.unlock(); onOk(); }
      else { sfx.wrong(); setErr(true); setTimeout(() => { setPin(""); setErr(false); }, 600); }
    }
  };

  return (
    <div className="flex flex-col items-center px-6 py-8">
      <div className="glass ring-glow breathe mb-5 flex h-16 w-16 items-center justify-center rounded-full">
        <ShieldCheck size={26} className="text-gold-400" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-2xl font-semibold italic text-cream">Edit Mode</h3>
      <p className="mt-1.5 max-w-[26ch] text-center text-xs font-light text-cream/55">
        Security code dao — tarpor page-er chobi, voice, lekha, position shob bodlate parba.
      </p>

      <div className={cn("mt-6 flex gap-3.5", err && "shake")}>
        {[0, 1, 2, 3].map((i) => (
          <span key={`${i}-${pin.length}`} className={cn("h-3 w-3 rounded-full border transition-colors",
            err ? "border-blush-500 bg-blush-500/80" : i < pin.length ? "dot-fill border-gold-300 bg-gold-300" : "border-gold-400/40")} />
        ))}
      </div>
      <p className={cn("mt-2.5 h-4 text-[11px]", err ? "text-blush-500" : "text-cream/35")}>
        {err ? "Bhul code." : "4-digit security code"}
      </p>

      <div className="mt-3 grid w-full max-w-[240px] grid-cols-3 gap-2.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k, i) =>
          k === "" ? <span key={i} /> : (
            <button key={i} onClick={() => press(k)} className="glass sheen flex h-12 items-center justify-center rounded-xl text-base font-light text-cream active:scale-90">
              {k === "del" ? "⌫" : k}
            </button>
          )
        )}
      </div>
      <button onClick={onClose} className="mt-5 text-[11px] uppercase tracking-[0.2em] text-cream/40 hover:text-cream/70">bondho koro</button>
    </div>
  );
}

/* ═══════════ image row ═══════════ */
function ImageRow({ page }: { page: BookPage }) {
  const { updatePage } = useBook();
  const url = useMediaUrl(page.imgKey);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const blob = await shrinkImage(file);
      const key = newKey("img");
      await putMedia(key, blob);
      updatePage(page.id, { imgKey: key });
      sfx.correct();
    } finally { setBusy(false); }
  };

  const preview = url ?? page.img;

  return (
    <div>
      <span className={label}>Chobi</span>
      <div className="flex items-center gap-3">
        <div className="glass h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          {preview
            ? <img src={preview} alt="preview" className="h-full w-full object-cover" />
            : <span className="flex h-full w-full items-center justify-center text-cream/30"><ImageIcon size={20} /></span>}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <button onClick={() => inputRef.current?.click()} className={btnGhost} disabled={busy}>
            <Upload size={13} /> {busy ? "uploading…" : "chobi upload"}
          </button>
          {(page.imgKey || page.img) && (
            <button onClick={() => { updatePage(page.id, { imgKey: undefined, img: undefined }); sfx.tick(); }} className={btnDanger}>
              <Trash2 size={13} /> chobi shorao
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
    </div>
  );
}

/* ═══════════ voice row ═══════════ */
function VoiceRow({ page }: { page: BookPage }) {
  const { updatePage } = useBook();
  const url = useMediaUrl(page.voiceKey);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); recRef.current?.stream.getTracks().forEach((t) => t.stop()); }, []);

  const save = async (blob: Blob) => {
    const key = newKey("voice");
    await putMedia(key, blob);
    updatePage(page.id, { voiceKey: key });
    sfx.correct();
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      rec.onstop = () => {
        void save(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setSecs(0);
      timer.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } catch { alert("Mic permission dorkar. Na hole audio file upload koro."); }
  };

  const stopRec = () => {
    recRef.current?.stop();
    setRecording(false);
    if (timer.current) clearInterval(timer.current);
  };

  return (
    <div>
      <span className={label}>Voice note</span>
      <div className="flex flex-col gap-2">
        {url && (
          <div className="glass flex items-center gap-2 rounded-xl px-3 py-2">
            <Play size={13} className="shrink-0 text-gold-300" />
            <audio src={url} controls className="h-8 w-full" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={recording ? stopRec : () => void startRec()} className={recording ? btnDanger : btnGhost}>
            {recording ? <><Square size={12} /> stop ({secs}s)</> : <><Mic size={13} /> record koro</>}
          </button>
          <button onClick={() => inputRef.current?.click()} className={btnGhost}>
            <Upload size={13} /> audio upload
          </button>
        </div>
        <input
          value={page.voiceLabel ?? ""}
          onChange={(e) => updatePage(page.id, { voiceLabel: e.target.value })}
          placeholder="Voice-er label (optional)"
          className={field}
        />
        {page.voiceKey && (
          <button onClick={() => { updatePage(page.id, { voiceKey: undefined }); sfx.tick(); }} className={btnDanger}>
            <Trash2 size={13} /> voice shorao
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="audio/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void save(f); }} />
    </div>
  );
}

/* ═══════════ main panel ═══════════ */
export function EditPanel({
  pageIndex, onClose, onGoto,
}: { pageIndex: number; onClose: () => void; onGoto: (i: number) => void }) {
  const {
    draft, isDirty, saveDraft, discardDraft, editUnlocked, lockEdit,
    updatePage, movePage, deletePage, addPage,
    updateQuiz, addQuiz, deleteQuiz, updateWish, updateSettings, resetAll,
  } = useBook();

  const [tab, setTab] = useState<Tab>("page");
  const [newAct, setNewAct] = useState<Act>("cartoons");
  const [newExtra, setNewExtra] = useState<ExtraKind>("awards");
  const [editIdx, setEditIdx] = useState(pageIndex);
  const [saved, setSaved] = useState(false);
  const musicInput = useRef<HTMLInputElement>(null);

  const total = draft.pages.length;
  const safeIdx = Math.min(Math.max(0, editIdx), total - 1);
  const page = draft.pages[safeIdx];

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  /* browser close/refresh e warning */
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const dirtyBits = useMemo(() => {
    if (!isDirty) return "";
    return "save korle tobei website-e boshbe";
  }, [isDirty]);

  const doSave = () => {
    saveDraft();
    onGoto(safeIdx);
    sfx.correct();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const tryClose = () => {
    if (isDirty && !confirm("Save koro nai — poriborton gulo hariye jabe. Beriye jabe?")) return;
    if (isDirty) discardDraft();
    onClose();
  };

  const uploadMusic = async (file?: File) => {
    if (!file) return;
    const key = newKey("music");
    await putMedia(key, file);
    musicCtl.reset();
    updateSettings({ musicKey: key, musicMode: "file", musicLabel: file.name });
    sfx.correct();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-label="edit panel">
      <div className="fade-in absolute inset-0 bg-velvet-950/85 backdrop-blur-md" onClick={tryClose} />

      <div className="pop-in glass-deep relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] sm:rounded-[2rem]">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

        {!editUnlocked ? (
          <PinGate onOk={() => sfx.pop()} onClose={onClose} />
        ) : (
          <>
            {/* header */}
            <div className="flex items-center gap-2 px-4 pb-2 pt-4">
              <Settings2 size={16} className="text-gold-300" />
              <p className="flex-1 font-display text-base font-semibold italic text-cream">
                Edit — page {safeIdx + 1}/{total}
              </p>
              <button onClick={() => { if (isDirty && !confirm("Save koro nai. Lock kore dile poriborton hariye jabe. Thik ache?")) return; discardDraft(); lockEdit(); onClose(); }}
                className="glass flex h-8 items-center gap-1.5 rounded-full px-3 text-[10px] uppercase tracking-widest text-cream/70">
                <Lock size={11} /> lock
              </button>
              <button onClick={tryClose} className="glass flex h-8 w-8 items-center justify-center rounded-full text-cream/70" aria-label="close">
                <X size={15} />
              </button>
            </div>

            {/* tabs */}
            <div className="flex gap-1 px-4 pb-3">
              {([["page", "Ei Page", FileText], ["quiz", "Quiz", HelpCircle], ["wish", "Wish", ScrollText], ["global", "Global", Music]] as const).map(([k, txt, Icon]) => (
                <button key={k} onClick={() => setTab(k as Tab)}
                  className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[11px] font-medium transition-all",
                    tab === k ? "bg-gradient-to-r from-gold-400 to-gold-500 text-velvet-900" : "glass text-cream/60")}>
                  <Icon size={12} /> {txt}
                </button>
              ))}
            </div>

            {/* page picker (draft onujayi) */}
            {tab === "page" && (
              <div className="mb-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
                {draft.pages.map((p, i) => (
                  <button key={p.id} onClick={() => setEditIdx(i)}
                    className={cn("h-7 w-7 shrink-0 rounded-lg text-[10px] font-medium transition-all",
                      i === safeIdx ? "bg-blush-400 text-velvet-900" : "glass text-cream/50")}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {/* ─────────── PAGE TAB ─────────── */}
              {tab === "page" && page && (
                <div className="flex flex-col gap-5">
                  <div>
                    <span className={label}>Title</span>
                    <input value={page.title} onChange={(e) => updatePage(page.id, { title: e.target.value })} className={field} />
                  </div>

                  {page.act !== "wish" && (
                    <div>
                      <span className={label}>{page.act === "extras" ? "Lekha (bridge page-e prottek line notun line-e)" : "Caption"}</span>
                      <textarea value={page.caption ?? ""} onChange={(e) => updatePage(page.id, { caption: e.target.value })}
                        rows={4} className={cn(field, "resize-none font-hand text-lg leading-snug")} placeholder="Ekhane lekho…" />
                    </div>
                  )}

                  {page.act === "memories" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className={label}>Date stamp</span>
                        <input value={page.date ?? ""} onChange={(e) => updatePage(page.id, { date: e.target.value })} className={field} />
                      </div>
                      <div>
                        <span className={label}>Jayga</span>
                        <input value={page.place ?? ""} onChange={(e) => updatePage(page.id, { place: e.target.value })} className={field} />
                      </div>
                    </div>
                  )}

                  {page.act === "memories" && !page.img && !page.imgKey && (
                    <div>
                      <span className={label}>Chobi na thakle kon scene</span>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(SCENE_LABEL) as SceneKey[]).map((s) => (
                          <button key={s} onClick={() => updatePage(page.id, { scene: s })}
                            className={cn("rounded-full px-3 py-1.5 text-[11px] transition-all", page.scene === s ? "bg-gold-400 text-velvet-900" : "glass text-cream/60")}>
                            {SCENE_LABEL[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {page.act === "extras" && (
                    <div>
                      <span className={label}>Extra type</span>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(EXTRA_LABEL) as ExtraKind[]).map((k) => (
                          <button key={k} onClick={() => updatePage(page.id, { extra: k })}
                            className={cn("rounded-full px-3 py-1.5 text-[11px] transition-all", page.extra === k ? "bg-gold-400 text-velvet-900" : "glass text-cream/60")}>
                            {EXTRA_LABEL[k]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {page.act !== "wish" && <ImageRow page={page} />}
                  <VoiceRow page={page} />

                  {/* position */}
                  <div>
                    <span className={label}>Position (ekhon {safeIdx + 1} nombor)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { movePage(page.id, safeIdx - 1); setEditIdx(Math.max(0, safeIdx - 1)); sfx.flip(); }}
                        disabled={safeIdx === 0} className={cn(btnGhost, "disabled:opacity-30")}>
                        <ArrowUp size={13} /> age nao
                      </button>
                      <button onClick={() => { movePage(page.id, safeIdx + 1); setEditIdx(Math.min(total - 1, safeIdx + 1)); sfx.flip(); }}
                        disabled={safeIdx === total - 1} className={cn(btnGhost, "disabled:opacity-30")}>
                        <ArrowDown size={13} /> pore nao
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input key={safeIdx} type="number" min={1} max={total} defaultValue={safeIdx + 1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const v = parseInt((e.target as HTMLInputElement).value, 10);
                            if (!isNaN(v)) { const t = Math.max(0, Math.min(total - 1, v - 1)); movePage(page.id, t); setEditIdx(t); sfx.flip(); }
                          }
                        }}
                        className={cn(field, "w-24")} />
                      <span className="text-[11px] text-cream/45">nombor likhe Enter chapo</span>
                    </div>
                  </div>

                  {/* add page */}
                  <div className="rounded-2xl border border-dashed border-gold-400/25 p-3">
                    <span className={label}>Notun page (ei page-er porei boshbe)</span>
                    <div className="flex flex-wrap gap-2">
                      {(["cartoons", "memories", "extras"] as Act[]).map((a) => (
                        <button key={a} onClick={() => setNewAct(a)}
                          className={cn("rounded-full px-3 py-1.5 text-[11px]", newAct === a ? "bg-blush-400 text-velvet-900" : "glass text-cream/60")}>
                          {a}
                        </button>
                      ))}
                    </div>
                    {newAct === "extras" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(Object.keys(EXTRA_LABEL) as ExtraKind[]).map((k) => (
                          <button key={k} onClick={() => setNewExtra(k)}
                            className={cn("rounded-full px-2.5 py-1 text-[10px]", newExtra === k ? "bg-gold-400 text-velvet-900" : "glass text-cream/55")}>
                            {EXTRA_LABEL[k]}
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={() => { addPage(newAct, safeIdx, { extra: newExtra }); setEditIdx(safeIdx + 1); sfx.pop(); }} className={cn(btnGold, "mt-3 w-full")}>
                      <Plus size={14} /> page add koro
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (total <= 1) return;
                      if (confirm(`Page ${safeIdx + 1} bad debo?`)) { deletePage(page.id); setEditIdx(Math.max(0, safeIdx - 1)); sfx.wrong(); }
                    }}
                    className={cn(btnDanger, "w-full")}>
                    <Trash2 size={14} /> ei page ta bad dao
                  </button>
                </div>
              )}

              {/* ─────────── QUIZ TAB ─────────── */}
              {tab === "quiz" && (
                <div className="flex flex-col gap-4">
                  <label className="glass flex items-center justify-between rounded-xl px-3 py-2.5">
                    <span className="text-xs font-light text-cream/75">Shesh page-er age quiz cholbe?</span>
                    <input type="checkbox" checked={draft.settings.quizEnabled}
                      onChange={(e) => updateSettings({ quizEnabled: e.target.checked })} className="h-4 w-4 accent-[#E6C594]" />
                  </label>

                  {draft.quiz.map((q, qi) => (
                    <div key={q.id} className="glass rounded-2xl p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className={cn(label, "mb-0")}>Prosno {qi + 1}</span>
                        <button onClick={() => { deleteQuiz(q.id); sfx.tick(); }} className="text-blush-400 hover:text-blush-300" aria-label="delete question">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <textarea value={q.q} onChange={(e) => updateQuiz(q.id, { q: e.target.value })} rows={2} className={cn(field, "resize-none")} />
                      <div className="mt-2 flex flex-col gap-1.5">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button onClick={() => { updateQuiz(q.id, { answer: oi }); sfx.tick(); }}
                              className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px]",
                                q.answer === oi ? "border-gold-300 bg-gold-400/20 text-gold-300" : "border-cream/20 text-cream/40")}
                              title="ei ta thik uttor">
                              {q.answer === oi ? <Check size={12} /> : ["A", "B", "C", "D", "E"][oi]}
                            </button>
                            <input value={opt}
                              onChange={(e) => updateQuiz(q.id, { options: q.options.map((o, j) => (j === oi ? e.target.value : o)) })}
                              className={cn(field, "py-1.5 text-xs")} />
                            {q.options.length > 2 && (
                              <button onClick={() => updateQuiz(q.id, { options: q.options.filter((_, j) => j !== oi), answer: Math.min(q.answer, q.options.length - 2) })}
                                className="text-cream/30 hover:text-blush-400"><X size={13} /></button>
                            )}
                          </div>
                        ))}
                        {q.options.length < 5 && (
                          <button onClick={() => updateQuiz(q.id, { options: [...q.options, "Notun option"] })} className={cn(btnGhost, "mt-1 py-1.5")}>
                            <Plus size={12} /> option add
                          </button>
                        )}
                      </div>
                      <input value={q.hint ?? ""} onChange={(e) => updateQuiz(q.id, { hint: e.target.value })} placeholder="Clue (optional)" className={cn(field, "mt-2 py-1.5 text-xs")} />
                    </div>
                  ))}

                  <button onClick={() => { addQuiz(); sfx.pop(); }} className={btnGold}><Plus size={14} /> notun prosno</button>
                </div>
              )}

              {/* ─────────── WISH TAB ─────────── */}
              {tab === "wish" && (
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] font-light leading-relaxed text-cream/50">
                    Shesh page-er chithi. Prottekta line alada paragraph — shesh line ta signature style-e.
                  </p>
                  {draft.wish.map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-3 w-4 shrink-0 text-[10px] text-gold-400/60">{i + 1}</span>
                      <textarea value={line} rows={3}
                        onChange={(e) => updateWish(draft.wish.map((l, j) => (j === i ? e.target.value : l)))}
                        className={cn(field, "resize-none font-hand text-lg leading-snug")} />
                      <button onClick={() => updateWish(draft.wish.filter((_, j) => j !== i))} className="mt-3 text-cream/30 hover:text-blush-400"><Trash2 size={13} /></button>
                    </div>
                  ))}
                  <button onClick={() => updateWish([...draft.wish, "Notun line…"])} className={btnGhost}><Plus size={13} /> line add</button>
                </div>
              )}

              {/* ─────────── GLOBAL TAB ─────────── */}
              {tab === "global" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <span className={label}>Background music</span>
                    <div className="flex gap-2">
                      {(["synth", "file", "off"] as const).map((m) => (
                        <button key={m} onClick={() => { updateSettings({ musicMode: m }); sfx.tick(); }}
                          className={cn("flex-1 rounded-xl px-2 py-2.5 text-[11px] font-medium transition-all",
                            draft.settings.musicMode === m ? "bg-gradient-to-r from-gold-400 to-gold-500 text-velvet-900" : "glass text-cream/60")}>
                          {m === "synth" ? "default sur" : m === "file" ? "amar gaan" : "off"}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => musicInput.current?.click()} className={cn(btnGhost, "mt-2 w-full")}>
                      <Upload size={13} /> gaan upload koro (mp3)
                    </button>
                    {draft.settings.musicLabel && (
                      <p className="mt-1.5 truncate text-[10px] text-gold-400/60">akhon: {draft.settings.musicLabel}</p>
                    )}
                    <input ref={musicInput} type="file" accept="audio/*" className="hidden" onChange={(e) => void uploadMusic(e.target.files?.[0])} />
                  </div>

                  <div className="rounded-2xl border border-dashed border-blush-500/30 p-3">
                    <span className={label}>Shob reset</span>
                    <p className="mb-2 text-[11px] font-light leading-relaxed text-cream/50">
                      Shob lekha, position ar quiz default-e fire jabe. Ei ta shonge shongei apply hoy.
                    </p>
                    <button onClick={() => { if (confirm("Shob default-e fire jabe. Sure?")) { resetAll(); onGoto(0); onClose(); } }} className={cn(btnDanger, "w-full")}>
                      <RotateCcw size={13} /> reset koro
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ═══════ STICKY SAVE BAR ═══════ */}
            <div className="border-t border-white/10 bg-velvet-950/60 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <span className={cn("flex min-w-0 flex-1 items-center gap-2 text-[11px] font-light",
                  saved ? "text-gold-300" : isDirty ? "text-blush-300" : "text-cream/45")}>
                  {saved ? <Check size={13} className="shrink-0" /> : isDirty ? <CircleAlert size={13} className="shrink-0 animate-pulse" /> : <Check size={13} className="shrink-0" />}
                  <span className="truncate">
                    {saved ? "Save hoye gelo — website-e boshe gelo!" : isDirty ? dirtyBits : "Shob save ache"}
                  </span>
                </span>

                {isDirty && (
                  <button onClick={() => { discardDraft(); sfx.tick(); }} className={cn(btnGhost, "shrink-0 px-3 py-2")}>
                    <Undo2 size={13} /> undo
                  </button>
                )}

                <button onClick={doSave} disabled={!isDirty}
                  className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold transition-all active:scale-95",
                    isDirty
                      ? "wish-glow bg-gradient-to-r from-gold-400 to-gold-500 text-velvet-900 hover:scale-[1.03]"
                      : "glass text-cream/35")}>
                  <Save size={14} /> SAVE
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
