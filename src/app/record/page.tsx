"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import Link from "next/link";
import { FileSpreadsheet, UserRound } from "lucide-react";

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
                <div className="flex flex-col gap-1 mb-6">
                    <h1 className="text-3xl font-bold">
                        Gestión de Producción
                    </h1>
                    <p className="text-sm text-gray-500">
                        Administra jornaleros y registra su producción.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserRound className="h-5 w-5" />
                                Jornaleros
                            </CardTitle>
                            <CardDescription>
                                Gestiona los jornaleros del sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p>Añade, edita o elimina jornaleros.</p>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Button onClick={() => setIsDialogOpen(true)} className="w-full">
                                Gestionar Jornaleros
                            </Button>
                        </div>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                Producción
                            </CardTitle>
                            <CardDescription>
                                Registra la producción de los jornaleros
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p>Registra la producción diaria de cada jornalero, incluyendo variedad, tipo de uva, empaque y cliente.</p>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Button asChild className="w-full">
                                <Link href="/record/produccion">Registrar Producción</Link>
                            </Button>
                        </div>
                    </Card>
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
