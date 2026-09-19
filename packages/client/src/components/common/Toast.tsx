import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

type Listener = (toasts: ToastMessage[]) => void;
let toastsState: ToastMessage[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener([...toastsState]));
}

export const toast = {
  success(message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState = [...toastsState, { id, type: "success", message }];
    notify();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  error(message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState = [...toastsState, { id, type: "error", message }];
    notify();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  info(message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState = [...toastsState, { id, type: "info", message }];
    notify();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  dismiss(id: string) {
    toastsState = toastsState.filter((t) => t.id !== id);
    notify();
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>(toastsState);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border backdrop-blur-md shadow-xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
                : isError
                ? "bg-rose-950/90 border-rose-500/30 text-rose-200"
                : "bg-slate-900/90 border-slate-700 text-slate-200"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <p className="text-xs font-medium leading-relaxed flex-1">{t.message}</p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
