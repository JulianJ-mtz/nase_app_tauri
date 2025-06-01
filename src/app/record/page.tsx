"use client";

import { useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTemporadaStore } from "@/lib/storeTemporada";
import { useProduccionStore } from "@/lib/storeProduccion";
import { ProductionContent } from "./ProductionContent";

export default function Record() {
    const [isTemporadaDialogOpen, setIsTemporadaDialogOpen] = useState(false);

    const { temporadas } = useTemporadaStore();
    const { fetchProducciones } = useProduccionStore();

    // Función para manejar el éxito en producción
    const handleProductionSuccess = useCallback(() => {
        fetchProducciones(); // Recargar datos de producción
    }, [fetchProducciones]);

    // Get active temporadas
    const activeTemporadas = temporadas.filter(
        (t) => !t.fecha_final || new Date(t.fecha_final) >= new Date()
    );

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-3xl font-bold">Gestión de Producción</h1>
                <p className="text-sm text-muted-foreground">
                    Administra temporadas, jornaleros y registra producción
                    siguiendo el flujo de trabajo.
                </p>
            </div>

            {/* Warning if no active temporadas */}
            {activeTemporadas.length === 0 && (
                <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No hay temporadas activas. Crea una temporada antes de
                        registrar producción.
                    </AlertDescription>
                </Alert>
            )}

            <ProductionContent
                onNewTemporada={() => setIsTemporadaDialogOpen(true)}
                onSuccess={handleProductionSuccess}
            />
        </div>
    );
}
