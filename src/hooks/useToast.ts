import { useCallback } from 'react';
import { v4 as uuid } from 'uuid'
import useContextIfDefined from './useContextIfDefined';
import { ToastsContext } from '../contexts/ToastsContext';

function useToast() {
    const {toasts, setToasts} = useContextIfDefined(ToastsContext);
    const createToast = useCallback((message: string, type: 'SUCCESS' | 'ERROR') => {
        const id = uuid();
        const newToast = { id, message, type };
        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000)
    }, [ setToasts ]);

    return {
        createToast,
        toasts
    }
}

export default useToast;