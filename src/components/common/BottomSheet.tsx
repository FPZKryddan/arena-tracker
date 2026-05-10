import { type ReactNode } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { AnimatePresence, easeOut, motion } from "framer-motion";

type BottomSheetProps = {
  isOpen: boolean;
  closeCallback: () => void;
  children: ReactNode;
};

const BottomSheet = ({ isOpen, children, closeCallback }: BottomSheetProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: easeOut }}
            className="absolute left-0 top-0 z-50 h-full w-full bg-overlay"
            onClick={closeCallback}
          ></motion.div>
          <motion.div
            initial={{ y: 1000 }}
            animate={{ y: 0 }}
            exit={{ y: 1000 }}
            transition={{ duration: 0.15, ease: easeOut }}
            className="fixed bottom-0 left-1/2 z-100 flex max-h-5/6 min-h-1/6 w-full max-w-[600px] -translate-x-1/2 flex-col overflow-y-auto rounded-t-lg border border-border bg-surface text-fg p-[8px]"
          >
            <button
              className="absolute right-[12px] top-[12px] z-20 rounded-md p-1 text-fg-muted hover:bg-surface-hover hover:text-fg"
              onClick={closeCallback}
            >
              <HiMiniXMark className="text-2xl" />
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
