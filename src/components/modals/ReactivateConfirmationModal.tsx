"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ReactivateConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    itemName?: string;
    onConfirm: () => void;
    loading?: boolean;
}

export function ReactivateConfirmationModal({
    open,
    onOpenChange,
    title = "Confirmar Reactivación",
    description,
    itemName,
    onConfirm,
    loading = false,
}: ReactivateConfirmationModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-green-500" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description ? (
                            description
                        ) : (
                            <>
                                ¿Estás seguro de que deseas reactivar{" "}
                                {itemName ? (
                                    <span className="font-semibold">{itemName}</span>
                                ) : (
                                    "este elemento"
                                )}?
                                <br />
                                <br />
                                {itemName ? "El/La" : "El elemento"} volverá a estar disponible en el sistema.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {loading ? "Reactivando..." : "Reactivar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 