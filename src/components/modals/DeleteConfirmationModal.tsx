"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    itemName?: string;
    onConfirm: () => void;
    loading?: boolean;
    warning?: string;
    error?: string;
}

export function DeleteConfirmationModal({
    open,
    onOpenChange,
    title = "Confirmar Eliminación",
    description,
    itemName,
    onConfirm,
    loading = false,
    warning,
    error,
}: DeleteConfirmationModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        {description ? (
                            description
                        ) : (
                            <>
                                ¿Estás seguro de que deseas eliminar{" "}
                                {itemName ? (
                                    <span className="font-semibold">{itemName}</span>
                                ) : (
                                    "este elemento"
                                )}?
                            </>
                        )}
                        <br />
                        <span className="text-sm text-gray-600">
                            Esta acción no se puede deshacer.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {warning && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded text-sm">
                        <strong>Advertencia:</strong> {warning}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {loading ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 