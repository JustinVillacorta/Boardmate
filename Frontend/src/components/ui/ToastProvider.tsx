import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TYPE_STYLES: Record<ToastType, { icon: React.ReactNode; color: string; accent: string }> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5" aria-hidden="true" />,
    color: 'bg-green-600 text-white',
    accent: 'bg-green-500/70'
  },
  error: {
    icon: <XCircle className="w-5 h-5" aria-hidden="true" />,
    color: 'bg-red-600 text-white',
    accent: 'bg-red-500/70'
  },
  info: {
    icon: <Info className="w-5 h-5" aria-hidden="true" />,
    color: 'bg-blue-600 text-white',
    accent: 'bg-blue-500/70'
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<number, number>>({});

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = Date.now() + Math.random();
    const type: ToastType = options.type ?? 'info';
    const duration = options.duration ?? 3500;

    setToasts(prev => [...prev, { id, message, type, duration }]);

    timers.current[id] = window.setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const contextValue = useMemo<ToastContextValue>(() => ({
    showToast,
    success: (message: string, opts) => showToast(message, { ...opts, type: 'success' }),
    error: (message: string, opts) => showToast(message, { ...opts, type: 'error' }),
    info: (message: string, opts) => showToast(message, { ...opts, type: 'info' })
  }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const styles = TYPE_STYLES[type];
          return (
            <div
              key={id}
              role="status"
              aria-live="assertive"
              className={`pointer-events-auto rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 ${styles.color} transition-transform duration-200 ease-out`}
            >
              <span className={`mt-0.5 rounded-full p-1 ${styles.accent}`}>{styles.icon}</span>
              <div className="flex-1 text-sm font-medium leading-snug">{message}</div>
              <button
                type="button"
                onClick={() => removeToast(id)}
                className="p-1 rounded-md transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
