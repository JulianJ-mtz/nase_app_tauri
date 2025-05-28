"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CuadrillaForm } from "@/components/cuadrillaForm";
import { createColumns } from "./columsTableCuadrilla";
import { DataTableCuadrilla } from "./dataTableCuadrilla";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { 
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CuadrillaJornaleros } from "@/components/CuadrillaJornaleros";
import { Spinner } from "@/components/ui/spinner";

export default function CuadrillasPage() {
    const { cuadrillas, fetchCuadrillas, loading, deleteCuadrilla } = useCuadrillaStore();
    const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<number | null>(null);
    const [showJornalerosDialog, setShowJornalerosDialog] = useState(false);

    useEffect(() => {
        fetchCuadrillas();
    }, [fetchCuadrillas]);

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

            <Card>
                <CardContent className="p-4">
                    {loading ? (
                        <div className="flex justify-center p-10">
                            <Spinner />
                        </div>
                    ) : (
                        <DataTableCuadrilla columns={columns} data={cuadrillas} />
                    )}
                </CardContent>
            </Card>

            <Dialog 
                open={showJornalerosDialog} 
                onOpenChange={setShowJornalerosDialog}
            >
                <DialogContent className="max-w-4xl">
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
