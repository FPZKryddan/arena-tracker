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
            className="absolute z-50 top-0 left-0 w-full h-full backdrop-blur-lg bg-overlay"
            onClick={closeCallback}
          ></motion.div>
          <motion.div
            initial={{ y: 1000, scaleX: 0.9 }}
            animate={{ y: 0, scaleX: 1 }}
            exit={{ y: 1000 }}
            transition={{ duration: 0.15, ease: easeOut }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-surface-elevated text-fg rounded-t-2xl w-full max-w-[600px] z-100 p-[8px] flex flex-col max-h-5/6 min-h-1/6 overflow-y-auto"
          >
            <button
              className="absolute top-[12px] right-[12px] text-fg"
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
