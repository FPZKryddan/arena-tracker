/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode, type SetStateAction } from "react";
import type { Toast } from "../types";

type ToastsProviderProps = {
    children: ReactNode
}


type ToastsContextValue = {
    toasts: Toast[],
    setToasts: React.Dispatch<SetStateAction<Toast[]>>
};

export const ToastsContext = createContext<ToastsContextValue | undefined>(undefined);

const ToastsProvider = ({ children }: ToastsProviderProps) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    return (
        <ToastsContext.Provider value={{toasts, setToasts}}>
            {children}
        </ToastsContext.Provider>
    );
};

export default ToastsProvider;