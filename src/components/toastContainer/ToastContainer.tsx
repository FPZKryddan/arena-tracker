import { AnimatePresence, easeOut, motion } from "framer-motion";
import type { Toast } from "../../types";

interface ToastContainerProps {
  toasts: Toast[];
}

const ToastContainer = ({ toasts }: ToastContainerProps) => {
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-100 flex w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.15, ease: easeOut }}
            layout
            className={`pointer-events-none w-full select-none rounded-md border px-4 py-2 text-center text-sm ${
              toast.type === "SUCCESS"
                ? "border-success bg-success text-success-fg"
                : toast.type === "WARNING"
                  ? "border-warning bg-warning text-warning-fg"
                  : "border-danger bg-danger text-danger-fg"
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
