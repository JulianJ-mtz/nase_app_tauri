"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CuadrillaForm } from "@/components/forms/CuadrillaForm";
import { createColumns } from "./columsTableCuadrilla";
import { DataTableCuadrilla } from "./dataTableCuadrilla";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { 
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CuadrillaJornaleros } from "@/components/CuadrillaJornaleros";
import { Spinner } from "@/components/ui/spinner";

export default function CuadrillasPage() {
    const { cuadrillas, fetchCuadrillas, loading, deleteCuadrilla, error } = useCuadrillaStore();
    const { jornaleros, fetchJornaleros } = useJornaleroStore();
    const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<number | null>(null);
    const [showJornalerosDialog, setShowJornalerosDialog] = useState(false);

    useEffect(() => {
        fetchCuadrillas();
        fetchJornaleros();
    }, [fetchCuadrillas, fetchJornaleros]);

    // Debug: Log cuadrillas data
    useEffect(() => {
        console.log("Cuadrillas data:", cuadrillas);
        console.log("Jornaleros data:", jornaleros);
        console.log("Loading:", loading);
        console.log("Error:", error);
    }, [cuadrillas, jornaleros, loading, error]);

    const handleViewJornaleros = (cuadrillaId: number) => {
        setSelectedCuadrillaId(cuadrillaId);
        setShowJornalerosDialog(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("¿Estás seguro de eliminar esta cuadrilla?")) {
            deleteCuadrilla(id);
        }
    };

    const columns = createColumns({
        handleEdit: () => {},
        handleDelete,
        handleViewJornaleros,
        jornaleros,
    });

    return (
        <div className="container mx-auto py-10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Cuadrillas</h1>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cuadrilla
                </Button>
            </div>

            <div>
                <CuadrillaForm />
            </div>

            {/* Debug info */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error: {error}
                </div>
            )}

            <Card>
                <CardContent className="p-4">
                    {loading ? (
                        <div className="flex justify-center p-10">
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            {/* Debug: Show cuadrillas count */}
                            <div className="mb-4 text-sm text-gray-600">
                                Total cuadrillas: {cuadrillas.length} | Total jornaleros: {jornaleros.length}
                            </div>
                            <DataTableCuadrilla columns={columns} data={cuadrillas} />
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog 
                open={showJornalerosDialog} 
                onOpenChange={setShowJornalerosDialog}
            >
                <DialogContent className="max-w-7xl">
                    <DialogTitle>
                        Jornaleros de Cuadrilla
                    </DialogTitle>
                    {selectedCuadrillaId && (
                        <CuadrillaJornaleros 
                            cuadrillaId={selectedCuadrillaId} 
                            onClose={() => setShowJornalerosDialog(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
