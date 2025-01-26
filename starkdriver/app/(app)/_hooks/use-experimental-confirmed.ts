import { useState, useEffect } from 'react';

const EXPERIMENTAL_CONFIRMED_EVENT = 'experimentalConfirmedChange';

export const useExperimentalConfirmed = () => {
    const [confirmed, setConfirmed] = useState(() => {
        // Check local storage on initial render
        if (typeof window !== 'undefined') {
            return localStorage.getItem('experimentalConfirmed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'experimentalConfirmed') {
                setConfirmed(e.newValue === 'true');
            }
        };

        const handleCustomEvent = (e: CustomEvent) => {
            setConfirmed(e.detail);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorageChange);
            window.addEventListener(EXPERIMENTAL_CONFIRMED_EVENT, handleCustomEvent as EventListener);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('storage', handleStorageChange);
                window.removeEventListener(EXPERIMENTAL_CONFIRMED_EVENT, handleCustomEvent as EventListener);
            }
        };
    }, []);

    useEffect(() => {
        // Update local storage when confirmed changes
        if (typeof window !== 'undefined') {
            localStorage.setItem('experimentalConfirmed', confirmed.toString());
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent(EXPERIMENTAL_CONFIRMED_EVENT, { detail: confirmed }));
        }
    }, [confirmed]);

    const confirm = () => {
        setConfirmed(true);
    };

    return { confirmed, setConfirmed, confirm };
}