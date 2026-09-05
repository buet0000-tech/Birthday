import { useEffect, useState } from "react";
import { Ambient } from "./components/Ambient";
import { VaultLock } from "./components/VaultLock";
import { PageBook } from "./components/PageBook";
import { BookProvider } from "./lib/book-store";
import { musicCtl } from "./lib/musicctl";

type View = "lock" | "book";
const LS_LOCK = "c25p4-lock";

export default function App() {
  const [view, setView] = useState<View>(() => {
    try { return localStorage.getItem(LS_LOCK) === "open" ? "book" : "lock"; } catch { return "lock"; }
  });

  useEffect(() => {
    document.body.style.overflow = view === "lock" ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [view]);

  useEffect(() => () => musicCtl.stop(), []);

  const unlock = () => {
    try { localStorage.setItem(LS_LOCK, "open"); } catch { /* ignore */ }
    setView("book");
    window.scrollTo(0, 0);
  };

  return (
    <BookProvider>
      <div className="grain relative min-h-screen bg-velvet-900 text-cream antialiased">
        <Ambient />
        {view === "lock" && <VaultLock onUnlock={unlock} />}
        {view === "book" && <PageBook />}
      </div>
    </BookProvider>
  );
}
