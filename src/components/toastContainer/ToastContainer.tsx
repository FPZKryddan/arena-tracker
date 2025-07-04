import { AnimatePresence, easeOut, motion } from "framer-motion";
import type { Toast } from "../../types"

interface ToastContainerProps {
    toasts: Toast[];
}

const ToastContainer = ({ toasts }: ToastContainerProps) => {

    return (
        <div className="flex flex-col w-1/2 fixed top-4 left-1/2 -translate-x-1/2 gap-2 pointer-events-none:">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div 
                    key={toast.id}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.15, ease: easeOut }}
                    className={`w-full rounded-md py-2 shadow-2xl text-center select-none pointer-events-none text-white ${toast.type === 'SUCCESS' ? 'bg-green-700' : 'bg-red-500'}`}>
                        {toast.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
};

export default ToastContainer;