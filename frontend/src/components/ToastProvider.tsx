import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastTone = 'default' | 'success' | 'warning';

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = {
  toast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const api = useMemo(
    () => ({
      toast: (toast: ToastInput) => {
        const id = window.crypto.randomUUID();
        setToasts((current) => [...current, { id, tone: 'default', ...toast }]);

        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, 3600);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[92vw] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              className="glass pointer-events-auto rounded-2xl p-4 shadow-glow"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 rounded-full p-2',
                    toast.tone === 'success' && 'bg-emerald-500/15 text-emerald-300',
                    toast.tone === 'warning' && 'bg-amber-500/15 text-amber-300',
                    toast.tone === 'default' && 'bg-cyan-500/15 text-cyan-300',
                  )}
                >
                  {toast.tone === 'success' ? <CheckCircle2 size={16} /> : toast.tone === 'warning' ? <CircleAlert size={16} /> : <Info size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-sm text-slate-300">{toast.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss toast"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}