"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

type OnlineStatusContextType = {
    isOnline: boolean;
};

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(
    undefined
);

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof window !== "undefined" ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <OnlineStatusContext.Provider value={{ isOnline }}>
            {children}
        </OnlineStatusContext.Provider>
    );
}

export function useOnlineStatus() {
    const context = useContext(OnlineStatusContext);

    if (context === undefined) {
        throw new Error(
            "useOnlineStatus debe ser usado dentro de un OnlineStatusProvider"
        );
    }

    return context.isOnline;
}
