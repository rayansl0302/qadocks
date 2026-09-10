import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : toast.type === 'info'
                  ? 'border-line bg-surface text-ink'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.');
  }
  return context;
}
