/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuid } from "uuid";
import type { Toast, ToastVariant } from "../types";

type ToastsProviderProps = {
  children: ReactNode;
};

export interface UpsertToastOptions {
  id?: string;
  message: string;
  type: ToastVariant;
  durationMs?: number;
}

type ToastsContextValue = {
  toasts: Toast[];
  upsertToast: (opts: UpsertToastOptions) => string;
  dismissToast: (id: string) => void;
};

export const ToastsContext = createContext<ToastsContextValue | undefined>(
  undefined
);

const DEFAULT_DURATION_MS = 3000;

const ToastsProvider = ({ children }: ToastsProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const upsertToast = useCallback(
    ({
      id,
      message,
      type,
      durationMs = DEFAULT_DURATION_MS,
    }: UpsertToastOptions): string => {
      const toastId = id ?? uuid();

      const existingTimer = timersRef.current.get(toastId);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
        timersRef.current.delete(toastId);
      }

      setToasts((prev) => {
        const idx = prev.findIndex((t) => t.id === toastId);
        const next: Toast = { id: toastId, message, type };
        if (idx === -1) return [...prev, next];
        const copy = prev.slice();
        copy[idx] = next;
        return copy;
      });

      if (Number.isFinite(durationMs)) {
        const timer = window.setTimeout(() => {
          timersRef.current.delete(toastId);
          setToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, durationMs);
        timersRef.current.set(toastId, timer);
      }

      return toastId;
    },
    []
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer);
      timers.clear();
    };
  }, []);

  return (
    <ToastsContext.Provider value={{ toasts, upsertToast, dismissToast }}>
      {children}
    </ToastsContext.Provider>
  );
};

export default ToastsProvider;
