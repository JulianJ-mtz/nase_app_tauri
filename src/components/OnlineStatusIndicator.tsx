"use client";

import { useOnlineStatus } from "@/context/OnlineStatusContext";

export function OnlineStatusIndicator() {
    const isOnline = useOnlineStatus();

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
