import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const NoticeContext = createContext(null);
const DISMISS_MS = 4000;

// Short-lived success/error messages, shown bottom-right and announced to screen readers
export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null); // { id, type, text }
  const timer = useRef(null);

  const show = useCallback((type, text) => {
    clearTimeout(timer.current);
    setNotice({ id: Date.now(), type, text });
    timer.current = setTimeout(() => setNotice(null), DISMISS_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const api = {
    success: (text) => show("success", text),
    error: (text) => show("error", text),
  };

  return (
    <NoticeContext.Provider value={api}>
      {children}
      <div className="notice-area" role="status" aria-live="polite">
        {notice && (
          <p className={`notice ${notice.type}`} key={notice.id}>
            <span>{notice.text}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button>
          </p>
        )}
      </div>
    </NoticeContext.Provider>
  );
}

export const useNotice = () => useContext(NoticeContext);
