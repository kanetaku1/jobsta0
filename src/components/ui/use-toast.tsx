'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface Toast extends ToastProps {
  id: string;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
  dismiss: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    // 3秒後に自動で削除
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastContainer({ toasts, onDismiss }: { 
  toasts: Toast[]; 
  onDismiss: (id: string) => void; 
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm w-full bg-white rounded-lg shadow-lg border p-4
            ${toast.variant === 'destructive' 
              ? 'border-red-200 bg-red-50' 
              : 'border-gray-200'
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-medium ${
                toast.variant === 'destructive' ? 'text-red-800' : 'text-gray-900'
              }`}>
                {toast.title}
              </h4>
              {toast.description && (
                <p className={`mt-1 text-sm ${
                  toast.variant === 'destructive' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
