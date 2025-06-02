import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
    onClick: () => void;
    disabled?: boolean;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    children?: React.ReactNode;
}

export const ExportButton = ({ 
    onClick, 
    disabled = false, 
    variant = "outline", 
    size = "sm",
    className = "",
    children = "Exportar CSV"
}: ExportButtonProps) => {
    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            variant={variant}
            size={size}
            className={`gap-2 ${className}`}
        >
            <Download size={16} />
            {children}
        </Button>
    );
}; 