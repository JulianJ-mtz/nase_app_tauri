"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { CuadrillaJornaleros } from "@/components/CuadrillaJornaleros";

interface CuadrillaViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cuadrillaId?: number;
    onClose: () => void;
}

export function CuadrillaViewModal({
    open,
    onOpenChange,
    cuadrillaId,
    onClose,
}: CuadrillaViewModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogTitle>Cuadrilla</DialogTitle>
                {cuadrillaId && (
                    <CuadrillaJornaleros
                        cuadrillaId={cuadrillaId}
                        onClose={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
} 