import { useCallback } from "react";
import useContextIfDefined from "./useContextIfDefined";
import { ToastsContext } from "../contexts/ToastsContext";
import type { ToastVariant } from "../types";

function useToast() {
  const { toasts, upsertToast, dismissToast } = useContextIfDefined(ToastsContext);

  const createToast = useCallback(
    (message: string, type: ToastVariant) => upsertToast({ message, type }),
    [upsertToast]
  );

  return {
    toasts,
    createToast,
    upsertToast,
    dismissToast,
  };
}

export default useToast;
