"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { JornaleroForm } from "@/components/JornaleroForm";

import { useJornaleroStore } from "@/lib/storeJornalero";
import { DataTableJornalero } from "./dataTableJonalero";
import { createColumns } from "./columsTableJornalero";
import { Button } from "@/components/ui/button";

export default function Record() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editJornaleroId, setEditJornaleroId] = useState<number | undefined>(
        undefined
    );

    const { jornaleros, loading, error, fetchJornaleros, deleteJornalero } =
        useJornaleroStore();

    const handleEdit = (id: number) => {
        setEditJornaleroId(id);
        setIsDialogOpen(true);
    };

    const handleEditSuccess = () => {
        setIsDialogOpen(false);
        setEditJornaleroId(undefined);
        fetchJornaleros();
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteJornalero(id);
        } catch (error) {
            console.error("Error deleting jornalero:", error);
        }
    };

    const columns = createColumns({ handleEdit, handleDelete });

    useEffect(() => {
        fetchJornaleros();
    }, [fetchJornaleros]);

    return (
        <>
            <div className="container mx-auto py-10">
                <div className="flex flex-col gap-1 mb-10">
                    <h1 className="text-4xl font-bold">
                        Directorio de Jornaleros
                    </h1>
                    <p className="text-sm text-gray-500">
                        Aquí puedes ver la lista de jornaleros registrados en la
                        base de datos.
                    </p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Jornaleros Registrados</CardTitle>
                    </CardHeader>

                    <div className="flex justify-end px-6">
                        <Button onClick={() => setIsDialogOpen(true)}>
                            Agregar Jornalero
                        </Button>
                    </div>
                    <CardContent>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error.toString()}
                            </div>
                        )}

                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : jornaleros.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                No hay jornaleros registrados, prueba agregando
                                uno.
                            </div>
                        ) : (
                            <DataTableJornalero
                                columns={columns}
                                data={jornaleros}
                            />
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editJornaleroId ? "Editar" : "Añadir"}{" "}
                                Jornalero
                            </DialogTitle>
                            <DialogDescription>
                                Introduce los datos del jornalero
                            </DialogDescription>
                        </DialogHeader>
                        <JornaleroForm
                            jornaleroId={editJornaleroId}
                            onSuccess={handleEditSuccess}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
