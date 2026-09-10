"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { GameIdGenerator } from "@geopolitics/domain";

export type ToastType = "success" | "error" | "warning" | "info";

export interface StrategicToast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  toasts: StrategicToast[];
  showToast: (title: string, message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<StrategicToast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (title: string, message: string, type: ToastType = "info") => {
      const id = GameIdGenerator.generateId("toast");
      const newToast: StrategicToast = { id, type, title, message };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, 4500);

      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
