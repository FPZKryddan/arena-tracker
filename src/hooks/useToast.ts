import { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid'
import type { Toast } from '../types';

function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const CreateToast = useCallback((message: string, type: 'SUCCESS' | 'ERROR') => {
        const id = uuid();
        const newToast = { id, message, type };
        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000)
    }, []);

    return {
        CreateToast,
        toasts
    }
}

export default useToast;