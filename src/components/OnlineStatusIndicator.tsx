"use client";

import { useOnlineStatus } from "@/context/OnlineStatusContext";
import { useEffect, useState } from "react";

export function OnlineStatusIndicator() {
    const isOnline = useOnlineStatus();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Evitar hydration mismatch mostrando un estado neutral hasta que el componente se monte
    if (!hasMounted) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm">Conectando...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-3 h-3 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-red-500"
                }`}
            />
            <span className="text-sm">
                {isOnline ? "En línea" : "Sin conexión"}
            </span>
        </div>
    );
}
