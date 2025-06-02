"use client";

import { useCallback, useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTemporadaStore } from "@/lib/storeTemporada";
import { useProduccionStore } from "@/lib/storeProduccion";
import { ProductionContent } from "./ProductionContent";

export default function Record() {
    const [isTemporadaDialogOpen, setIsTemporadaDialogOpen] = useState(false);

    const { temporadas } = useTemporadaStore();
    const { fetchProducciones } = useProduccionStore();

    // Ref to store fetchProducciones function to avoid dependency issues
    const fetchProduccionesRef = useRef(fetchProducciones);
    fetchProduccionesRef.current = fetchProducciones;

    // Función para manejar el éxito en producción - Fixed to avoid infinite loop
    const handleProductionSuccess = useCallback(() => {
        fetchProduccionesRef.current(); // Use ref to avoid dependency issues
    }, []); // No dependencies needed

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
