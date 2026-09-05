/* ————————————————————————————————————————————————
   BOOK STORE — draft + published model
   • Edit korle shob jay DRAFT-e
   • "Save" chaple draft → published (+ localStorage)
   • Save na korle website-e kono poriborton bosbe na
———————————————————————————————————————————————— */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DEFAULT_PAGES, DEFAULT_QUIZ, DEFAULT_WISH_LETTER,
  type BookPage, type QuizQ, type Act, type ExtraKind, type SceneKey,
} from "../data/pages";
import { delMedia, newKey } from "./media";
import { musicCtl, type MusicMode } from "./musicctl";

export const EDIT_CODE = "2525";
const LS_KEY = "c25book-v5";

export interface BookSettings {
  musicMode: MusicMode;
  musicKey?: string;
  musicLabel?: string;
  quizEnabled: boolean;
}

export interface BookState {
  pages: BookPage[];
  quiz: QuizQ[];
  wish: string[];
  settings: BookSettings;
}

const DEFAULT_STATE: BookState = {
  pages: DEFAULT_PAGES,
  quiz: DEFAULT_QUIZ,
  wish: DEFAULT_WISH_LETTER,
  settings: { musicMode: "synth", quizEnabled: true },
};

const clone = (s: BookState): BookState => JSON.parse(JSON.stringify(s)) as BookState;

function load(): BookState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw) as Partial<BookState>;
    return {
      pages: Array.isArray(parsed.pages) && parsed.pages.length ? parsed.pages : clone(DEFAULT_STATE).pages,
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz : clone(DEFAULT_STATE).quiz,
      wish: Array.isArray(parsed.wish) && parsed.wish.length ? parsed.wish : clone(DEFAULT_STATE).wish,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

interface BookCtx {
  /* published — website ei ta dekhay */
  state: BookState;
  /* draft — edit panel ei ta dekhay */
  draft: BookState;
  isDirty: boolean;
  saveDraft: () => void;
  discardDraft: () => void;
  /* edit session */
  editUnlocked: boolean;
  unlockEdit: (code: string) => boolean;
  lockEdit: () => void;
  /* page actions (draft-e cholbe) */
  updatePage: (id: string, patch: Partial<BookPage>) => void;
  movePage: (id: string, toIndex: number) => void;
  deletePage: (id: string) => void;
  addPage: (act: Act, afterIndex: number, opts?: { extra?: ExtraKind; scene?: SceneKey }) => string;
  /* quiz */
  updateQuiz: (id: string, patch: Partial<QuizQ>) => void;
  addQuiz: () => void;
  deleteQuiz: (id: string) => void;
  /* wish + settings */
  updateWish: (lines: string[]) => void;
  updateSettings: (patch: Partial<BookSettings>) => void;
  resetAll: () => void;
}

const Ctx = createContext<BookCtx | null>(null);

export function BookProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookState>(load);
  const [draft, setDraft] = useState<BookState>(() => clone(state));
  const [editUnlocked, setEditUnlocked] = useState(false);
  /* save korle je media gulo mucha hobe */
  const pendingDeletes = useRef<string[]>([]);

  const isDirty = useMemo(() => JSON.stringify(state) !== JSON.stringify(draft), [state, draft]);

  /* published state → localStorage */
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  /* published settings → music controller */
  useEffect(() => {
    musicCtl.configure(state.settings.musicMode, state.settings.musicKey);
  }, [state.settings.musicMode, state.settings.musicKey]);

  const saveDraft = useCallback(() => {
    setState(clone(draft));
    pendingDeletes.current.forEach((k) => void delMedia(k));
    pendingDeletes.current = [];
  }, [draft]);

  const discardDraft = useCallback(() => {
    setDraft(clone(state));
    pendingDeletes.current = [];
  }, [state]);

  const unlockEdit = useCallback((code: string) => {
    const ok = code.trim() === EDIT_CODE;
    if (ok) { setDraft(clone(state)); setEditUnlocked(true); }
    return ok;
  }, [state]);

  const lockEdit = useCallback(() => setEditUnlocked(false), []);

  /* ——— draft mutators ——— */
  const updatePage = useCallback((id: string, patch: Partial<BookPage>) => {
    setDraft((d) => {
      const prev = d.pages.find((p) => p.id === id);
      /* purono chobi/voice replace hole save-er somoy muchbo */
      if (prev) {
        if (patch.imgKey !== undefined && prev.imgKey && prev.imgKey !== patch.imgKey) pendingDeletes.current.push(prev.imgKey);
        if (patch.voiceKey !== undefined && prev.voiceKey && prev.voiceKey !== patch.voiceKey) pendingDeletes.current.push(prev.voiceKey);
      }
      return { ...d, pages: d.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
    });
  }, []);

  const movePage = useCallback((id: string, toIndex: number) => {
    setDraft((d) => {
      const from = d.pages.findIndex((p) => p.id === id);
      if (from === -1) return d;
      const target = Math.max(0, Math.min(d.pages.length - 1, toIndex));
      if (target === from) return d;
      const pages = [...d.pages];
      const [item] = pages.splice(from, 1);
      pages.splice(target, 0, item);
      return { ...d, pages };
    });
  }, []);

  const deletePage = useCallback((id: string) => {
    setDraft((d) => {
      if (d.pages.length <= 1) return d;
      const page = d.pages.find((p) => p.id === id);
      if (page?.imgKey) pendingDeletes.current.push(page.imgKey);
      if (page?.voiceKey) pendingDeletes.current.push(page.voiceKey);
      return { ...d, pages: d.pages.filter((p) => p.id !== id) };
    });
  }, []);

  const addPage = useCallback((act: Act, afterIndex: number, opts?: { extra?: ExtraKind; scene?: SceneKey }) => {
    const id = newKey("pg");
    const fresh: BookPage = act === "extras"
      ? { id, act, title: "Notun Page", extra: opts?.extra ?? "awards" }
      : act === "memories"
        ? { id, act, title: "Notun Memory", caption: "Ekhane tomar lekha boshao…", date: "Taarikh", place: "Jayga", scene: opts?.scene ?? "noodles" }
        : act === "wish"
          ? { id, act, title: "Wish" }
          : { id, act: "cartoons", title: "Notun Cartoon", caption: "Ekhane caption likho…" };
    setDraft((d) => {
      const pages = [...d.pages];
      pages.splice(Math.min(pages.length, afterIndex + 1), 0, fresh);
      return { ...d, pages };
    });
    return id;
  }, []);

  const updateQuiz = useCallback((id: string, patch: Partial<QuizQ>) => {
    setDraft((d) => ({ ...d, quiz: d.quiz.map((q) => (q.id === id ? { ...q, ...patch } : q)) }));
  }, []);

  const addQuiz = useCallback(() => {
    setDraft((d) => ({
      ...d,
      quiz: [...d.quiz, { id: newKey("q"), q: "Notun prosno?", options: ["Option 1", "Option 2", "Option 3", "Option 4"], answer: 0, hint: "" }],
    }));
  }, []);

  const deleteQuiz = useCallback((id: string) => {
    setDraft((d) => ({ ...d, quiz: d.quiz.filter((q) => q.id !== id) }));
  }, []);

  const updateWish = useCallback((lines: string[]) => setDraft((d) => ({ ...d, wish: lines })), []);

  const updateSettings = useCallback((patch: Partial<BookSettings>) => {
    setDraft((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const resetAll = useCallback(() => {
    const fresh = clone(DEFAULT_STATE);
    setState(fresh);
    setDraft(clone(fresh));
    pendingDeletes.current = [];
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }, []);

  const value = useMemo<BookCtx>(() => ({
    state, draft, isDirty, saveDraft, discardDraft,
    editUnlocked, unlockEdit, lockEdit,
    updatePage, movePage, deletePage, addPage,
    updateQuiz, addQuiz, deleteQuiz, updateWish, updateSettings, resetAll,
  }), [state, draft, isDirty, saveDraft, discardDraft, editUnlocked, unlockEdit, lockEdit,
    updatePage, movePage, deletePage, addPage, updateQuiz, addQuiz, deleteQuiz, updateWish, updateSettings, resetAll]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBook() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBook must be used inside BookProvider");
  return ctx;
}
