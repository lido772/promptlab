import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

export default function ToastContainer() {
  const { toasts } = useContext(ToastContext);

  return (
    <div className="fixed top-5 right-5 z-[10000] max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`card p-4 mb-2.5 flex items-center gap-3 shadow-card-hover toast-enter pointer-events-auto ${
            toast.type === 'success'
              ? 'border-l-2 border-emerald-500'
              : toast.type === 'error'
              ? 'border-l-2 border-red-500'
              : toast.type === 'warning'
              ? 'border-l-2 border-yellow-500'
              : 'border-l-2 border-accent'
          }`}
          style={{
            animation: toast.isRemoving ? 'fadeOut 0.3s ease forwards' : undefined,
          }}
        >
          <span className="text-lg flex-shrink-0">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="text-foreground text-sm break-words">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
