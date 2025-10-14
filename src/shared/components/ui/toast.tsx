import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from './toast-context';
import type { ToastType } from './toast-context';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
              animate-in slide-in-from-right duration-300
              ${toast.type === 'success' ? 'bg-green-50 border border-green-200' : ''}
              ${toast.type === 'error' ? 'bg-red-50 border border-red-200' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 border border-blue-200' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            
            <p className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-900' : 
              toast.type === 'error' ? 'text-red-900' : 
              'text-blue-900'
            }`}>
              {toast.message}
            </p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className={`ml-2 p-1 rounded hover:bg-white/50 transition-colors ${
                toast.type === 'success' ? 'text-green-600' : 
                toast.type === 'error' ? 'text-red-600' : 
                'text-blue-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
