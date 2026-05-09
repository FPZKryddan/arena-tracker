import { useContext, type Context } from "react";

function useContextIfDefined<T>(contextObj: Context<T | undefined>): T {
    const context = useContext(contextObj);
    if (!context) {
        throw new Error('Context must be defined!');
    }

    return context;
};

export default useContextIfDefined;