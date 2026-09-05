import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_PAGES, DEFAULT_QUIZ, DEFAULT_WISH_LETTER, type BookPage, type QuizQ, type Act, type ExtraKind, type SceneKey } from "../data/pages";
import { delMedia, newKey } from "./media";
import { musicCtl, type MusicMode } from "./musicctl";

export const EDIT_CODE = "2525";

export interface BookSettings { musicMode: MusicMode; musicKey?: string; musicLabel?: string; quizEnabled: boolean; }
export interface BookState { pages: BookPage[]; quiz: QuizQ[]; wish: string[]; settings: BookSettings; }
const DEFAULT_STATE: BookState = { pages: DEFAULT_PAGES, quiz: DEFAULT_QUIZ, wish: DEFAULT_WISH_LETTER, settings: { musicMode: "synth", quizEnabled: true } };
const clone = (s: BookState): BookState => JSON.parse(JSON.stringify(s)) as BookState;
function normalize(input: unknown): BookState {
  const p = (input && typeof input === "object" ? input : {}) as Partial<BookState>;
  const d = clone(DEFAULT_STATE);
  return { pages: Array.isArray(p.pages) && p.pages.length ? p.pages : d.pages, quiz: Array.isArray(p.quiz) ? p.quiz : d.quiz, wish: Array.isArray(p.wish) && p.wish.length ? p.wish : d.wish, settings: { ...d.settings, ...(p.settings ?? {}) } };
}

interface BookCtx {
  state: BookState; draft: BookState; isDirty: boolean; editUnlocked: boolean;
  saveDraft: () => void; discardDraft: () => void; unlockEdit: (code: string) => boolean; lockEdit: () => void;
  updatePage: (id: string, patch: Partial<BookPage>) => void; movePage: (id: string, toIndex: number) => void; deletePage: (id: string) => void;
  addPage: (act: Act, afterIndex: number, opts?: { extra?: ExtraKind; scene?: SceneKey }) => string;
  updateQuiz: (id: string, patch: Partial<QuizQ>) => void; addQuiz: () => void; deleteQuiz: (id: string) => void;
  updateWish: (lines: string[]) => void; updateSettings: (patch: Partial<BookSettings>) => void; resetAll: () => void;
}
const Ctx = createContext<BookCtx | null>(null);

async function getRemote(): Promise<BookState | null> {
  const r = await fetch("/api/book", { cache: "no-store" });
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error(body?.error || `Database load failed (${r.status})`);
  return body?.state ? normalize(body.state) : null;
}
async function saveRemote(state: BookState): Promise<void> {
  const r = await fetch("/api/book", { method: "PUT", headers: { "content-type": "application/json" }, cache: "no-store", body: JSON.stringify({ state }) });
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error(body?.error || `Database save failed (${r.status})`);
}

export function BookProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookState>(() => clone(DEFAULT_STATE));
  const [draft, setDraft] = useState<BookState>(() => clone(DEFAULT_STATE));
  const [editUnlocked, setEditUnlocked] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const pendingDeletes = useRef<string[]>([]);
  const isDirty = useMemo(() => JSON.stringify(state) !== JSON.stringify(draft), [state, draft]);

  useEffect(() => {
    let alive = true;
    getRemote().then(remote => {
      if (!alive) return;
      const next = remote ?? clone(DEFAULT_STATE);
      setState(next); setDraft(clone(next)); setDbReady(true);
    }).catch(err => {
      console.error("Neon load failed:", err);
      if (alive) alert("Neon database load failed. Edit mode is temporarily unavailable.");
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => { musicCtl.configure(state.settings.musicMode, state.settings.musicKey); }, [state.settings.musicMode, state.settings.musicKey]);

  const saveDraft = useCallback(() => {
    if (!dbReady || !isDirty) return;
    const next = clone(draft);
    void (async () => {
      try {
        await saveRemote(next);
        setState(next); setDraft(clone(next));
        const deletes = [...new Set(pendingDeletes.current)]; pendingDeletes.current = [];
        await Promise.allSettled(deletes.map(delMedia));
        alert("Neon database-e successfully save hoyeche.");
      } catch (err) {
        console.error("Neon save failed:", err);
        alert(`Save hoyni: ${err instanceof Error ? err.message : "Database error"}`);
      }
    })();
  }, [dbReady, draft, isDirty]);

  const discardDraft = useCallback(() => { setDraft(clone(state)); pendingDeletes.current = []; }, [state]);
  const unlockEdit = useCallback((code: string) => { const ok = dbReady && code.trim() === EDIT_CODE; if (ok) { setDraft(clone(state)); setEditUnlocked(true); } return ok; }, [dbReady, state]);
  const lockEdit = useCallback(() => setEditUnlocked(false), []);

  const updatePage = useCallback((id: string, patch: Partial<BookPage>) => setDraft(d => {
    const old = d.pages.find(p => p.id === id);
    if (old?.imgKey && patch.imgKey !== undefined && patch.imgKey !== old.imgKey) pendingDeletes.current.push(old.imgKey);
    if (old?.voiceKey && patch.voiceKey !== undefined && patch.voiceKey !== old.voiceKey) pendingDeletes.current.push(old.voiceKey);
    return { ...d, pages: d.pages.map(p => p.id === id ? { ...p, ...patch } : p) };
  }), []);
  const movePage = useCallback((id: string, toIndex: number) => setDraft(d => { const from=d.pages.findIndex(p=>p.id===id); if(from<0)return d; const pages=[...d.pages]; const [item]=pages.splice(from,1); pages.splice(Math.max(0,Math.min(pages.length,toIndex)),0,item); return {...d,pages}; }), []);
  const deletePage = useCallback((id: string) => setDraft(d => { if(d.pages.length<=1)return d; const p=d.pages.find(x=>x.id===id); if(p?.imgKey)pendingDeletes.current.push(p.imgKey); if(p?.voiceKey)pendingDeletes.current.push(p.voiceKey); return {...d,pages:d.pages.filter(x=>x.id!==id)}; }), []);
  const addPage = useCallback((act: Act, afterIndex: number, opts?: {extra?:ExtraKind;scene?:SceneKey}) => { const id=newKey("pg"); const page:BookPage=act==="extras"?{id,act,title:"Notun Page",extra:opts?.extra??"awards"}:act==="memories"?{id,act,title:"Notun Memory",caption:"Ekhane tomar lekha boshao…",date:"Taarikh",place:"Jayga",scene:opts?.scene??"noodles"}:act==="wish"?{id,act,title:"Wish"}:{id,act:"cartoons",title:"Notun Cartoon",caption:"Ekhane caption likho…"}; setDraft(d=>{const pages=[...d.pages];pages.splice(Math.min(pages.length,afterIndex+1),0,page);return {...d,pages};}); return id; }, []);
  const updateQuiz = useCallback((id:string,patch:Partial<QuizQ>)=>setDraft(d=>({...d,quiz:d.quiz.map(q=>q.id===id?{...q,...patch}:q)})),[]);
  const addQuiz = useCallback(()=>setDraft(d=>({...d,quiz:[...d.quiz,{id:newKey("q"),q:"Notun prosno?",options:["Option 1","Option 2","Option 3","Option 4"],answer:0,hint:""}]})),[]);
  const deleteQuiz = useCallback((id:string)=>setDraft(d=>({...d,quiz:d.quiz.filter(q=>q.id!==id)})),[]);
  const updateWish = useCallback((lines:string[])=>setDraft(d=>({...d,wish:lines})),[]);
  const updateSettings = useCallback((patch:Partial<BookSettings>)=>setDraft(d=>({...d,settings:{...d.settings,...patch}})),[]);
  const resetAll = useCallback(()=>{ const next=clone(DEFAULT_STATE); void saveRemote(next).then(()=>{setState(next);setDraft(clone(next));pendingDeletes.current=[];alert("Default content Neon-e save hoyeche.");}).catch(err=>alert(`Reset save hoyni: ${err instanceof Error?err.message:"Database error"}`)); },[]);

  const value=useMemo<BookCtx>(()=>({state,draft,isDirty,editUnlocked,saveDraft,discardDraft,unlockEdit,lockEdit,updatePage,movePage,deletePage,addPage,updateQuiz,addQuiz,deleteQuiz,updateWish,updateSettings,resetAll}),[state,draft,isDirty,editUnlocked,saveDraft,discardDraft,unlockEdit,lockEdit,updatePage,movePage,deletePage,addPage,updateQuiz,addQuiz,deleteQuiz,updateWish,updateSettings,resetAll]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useBook(){const ctx=useContext(Ctx);if(!ctx)throw new Error("useBook must be used inside BookProvider");return ctx;}
