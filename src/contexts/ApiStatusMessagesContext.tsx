/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode, type SetStateAction } from "react";
import type { StatusMessage } from "../types";

type ApiStatusMessagesProviderProps = {
    children: ReactNode
}


type ApiStatusMessagesContextValue = {
    statusMessages: StatusMessage[],
    setStatusMessages: React.Dispatch<SetStateAction<StatusMessage[]>>
};

export const ApiStatusMessagesContext = createContext<ApiStatusMessagesContextValue | undefined>(undefined);

const ApiStatusMessagesProvider = ({ children }: ApiStatusMessagesProviderProps) => {
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

    return (
        <ApiStatusMessagesContext.Provider value={{statusMessages, setStatusMessages}}>
            {children}
        </ApiStatusMessagesContext.Provider>
    );
};

export default ApiStatusMessagesProvider;