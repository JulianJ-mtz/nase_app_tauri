import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCreatedAt = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    try {
        // Rust sends DateTimeUtc as "YYYY-MM-DD HH:MM:SS.SSS UTC"
        // We need to clean it up for JavaScript Date parsing
        const cleanDateString = dateString.replace(" UTC", "Z");
        const date = new Date(cleanDateString);
        
        if (isNaN(date.getTime())) {
            // If still invalid, try parsing as ISO string
            const isoDate = new Date(dateString);
            if (isNaN(isoDate.getTime())) {
                return "Fecha inválida";
            }
            return isoDate.toLocaleDateString("es-ES");
        }
        
        return date.toLocaleDateString("es-ES");
    } catch (error) {
        console.error("Error parsing date:", dateString, error);
        return "Error en fecha";
    }
};