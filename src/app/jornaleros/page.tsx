"use client";

import { useState } from "react";
import { JornaleroForm } from "@/components/forms/JornaleroForm";
import { Separator } from "@/components/ui/separator";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useEffect } from "react";
import { DataTableJornalero } from "./dataTableJonalero";
import { createColumns, createInactiveColumns } from "./columsTableJornalero";
import { Button } from "@/components/ui/button";
import { CuadrillaJornaleros } from "@/components/CuadrillaJornaleros";
import { Jornalero } from "@/api/jornalero_api";
import { toast } from "sonner";
import { Edit, Trash, UserPlus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    DeleteConfirmationModal, 
    FormModal, 
    ReactivateConfirmationModal, 
    CuadrillaViewModal 
} from "@/components/modals";

export default function JornalerosPage() {
    const { fetchJornaleros, jornaleros, deleteJornalero, fetchJornalerosInactivos, jornalerosInactivos, reactivateJornalero } =
        useJornaleroStore();
    const { fetchCuadrillas, cuadrillas } = useCuadrillaStore();

    const [selectedJornalero, setSelectedJornalero] =
        useState<Jornalero | null>(null);
    const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<
        number | null
    >(null);
    const [showCuadrillaDialog, setShowCuadrillaDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showReactivateDialog, setShowReactivateDialog] = useState(false);
    const [jornaleroToDelete, setJornaleroToDelete] = useState<Jornalero | null>(null);
    const [jornaleroToReactivate, setJornaleroToReactivate] = useState<Jornalero | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);

    useEffect(() => {
        fetchJornaleros();
        fetchCuadrillas();
        fetchJornalerosInactivos();
    }, [fetchJornaleros, fetchCuadrillas, fetchJornalerosInactivos]);

    const handleEdit = (id: number) => {
        const jornalero = jornaleros.find((j) => j.id === id);
        if (jornalero) {
            setSelectedJornalero(jornalero);
            setShowEditDialog(true);
        }
    };

    const handleDelete = (id: number) => {
        const jornalero = jornaleros.find((j) => j.id === id);
        if (jornalero) {
            setJornaleroToDelete(jornalero);
            setShowDeleteDialog(true);
        }
    };

    const handleReactivate = (id: number) => {
        const jornalero = jornalerosInactivos.find((j) => j.id === id);
        if (jornalero) {
            setJornaleroToReactivate(jornalero);
            setShowReactivateDialog(true);
        }
    };

    const confirmDelete = async () => {
        if (!jornaleroToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteJornalero(jornaleroToDelete.id);
            toast.success("Jornalero desactivado con éxito");
            setShowDeleteDialog(false);
            setJornaleroToDelete(null);
        } catch (error) {
            console.error("Error al desactivar jornalero:", error);
            const errorMessage = typeof error === 'string' ? error : 
                               (error as any)?.message || "Error al desactivar jornalero";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmReactivate = async () => {
        if (!jornaleroToReactivate) return;
        
        setIsReactivating(true);
        try {
            await reactivateJornalero(jornaleroToReactivate.id);
            toast.success("Jornalero reactivado con éxito");
            setShowReactivateDialog(false);
            setJornaleroToReactivate(null);
        } catch (error) {
            console.error("Error al reactivar jornalero:", error);
            const errorMessage = typeof error === 'string' ? error : 
                               (error as any)?.message || "Error al reactivar jornalero";
            toast.error(errorMessage);
        } finally {
            setIsReactivating(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setJornaleroToDelete(null);
    };

    const cancelReactivate = () => {
        setShowReactivateDialog(false);
        setJornaleroToReactivate(null);
    };

    const handleViewCuadrilla = (cuadrillaId: number) => {
        setSelectedCuadrillaId(cuadrillaId);
        setShowCuadrillaDialog(true);
    };

    const columns = createColumns({
        handleEdit,
        handleDelete,
        handleViewCuadrilla,
    });

    // Crear columnas para jornaleros inactivos (sin botón de editar/eliminar, con botón de reactivar)
    const inactiveColumns = createInactiveColumns({
        handleReactivate,
    });

    // Helper function to get leader name
    const getLiderName = (liderId: number | null) => {
        if (!liderId) return "Sin líder";
        const lider = jornaleros.find((j) => j.id === liderId);
        return lider ? lider.nombre : `ID: ${liderId}`;
    };

    // Group jornaleros by cuadrilla
    const jornalerosByCuadrilla: Record<string, Jornalero[]> = {};
    jornaleros.forEach((jornalero) => {
        const key = jornalero.cuadrilla_id
            ? `${jornalero.cuadrilla_id}`
            : "sin_cuadrilla";
        if (!jornalerosByCuadrilla[key]) {
            jornalerosByCuadrilla[key] = [];
        }
        jornalerosByCuadrilla[key].push(jornalero);
    });

    // Calculate production stats
    const produccionTotal = jornaleros.reduce(
        (total, j) => total + (Number(j.produccion_jornalero) || 0),
        0
    );
    const jornalerosActivos = jornaleros.filter(
        (j) => j.estado === "Activo"
    ).length;
    const jornalerosAsignados = jornaleros.filter(
        (j) => j.cuadrilla_id !== null
    ).length;

    return (
        <div className="container mx-auto py-10">
            <Tabs defaultValue="todos">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Gestión de Jornaleros
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Administre jornaleros y asígnelos a cuadrillas
                        </p>
                    </div>
                    <TabsList>
                        <TabsTrigger value="todos">Activos</TabsTrigger>
                        <TabsTrigger value="inactivos">Inactivos</TabsTrigger>
                        <TabsTrigger value="cuadrillas">
                            Por Cuadrilla
                        </TabsTrigger>
                        <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="todos" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        Agregar Nuevo Jornalero
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <JornaleroForm
                                        onSuccess={() => {
                                            fetchJornaleros();
                                            fetchJornalerosInactivos();
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lista de Jornaleros</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DataTableJornalero
                                        columns={columns}
                                        data={jornaleros}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="inactivos" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-muted-foreground" />
                                Jornaleros Inactivos
                            </CardTitle>
                            <CardDescription>
                                Jornaleros que han sido desactivados. Puedes reactivarlos desde aquí.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {jornalerosInactivos.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay jornaleros inactivos
                                </div>
                            ) : (
                                <DataTableJornalero
                                    columns={inactiveColumns}
                                    data={jornalerosInactivos}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cuadrillas" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {Object.entries(jornalerosByCuadrilla).map(
                            ([cuadrillaId, jornaleros]) => {
                                const cuadrillaName =
                                    cuadrillaId === "sin_cuadrilla"
                                        ? "Sin Cuadrilla Asignada"
                                        : `Cuadrilla ${cuadrillaId}`;

                                const cuadrillaInfo =
                                    cuadrillaId !== "sin_cuadrilla"
                                        ? cuadrillas.find(
                                              (c) =>
                                                  c.id === parseInt(cuadrillaId)
                                          )
                                        : null;

                                return (
                                    <Card key={cuadrillaId}>
                                        <CardHeader>
                                            <CardTitle className="flex justify-between">
                                                <span>{cuadrillaName}</span>
                                                {cuadrillaInfo && (
                                                    <span className="text-sm font-normal text-muted-foreground">
                                                        Líder:{" "}
                                                        {getLiderName(
                                                            cuadrillaInfo.lider_cuadrilla_id
                                                        )}{" "}
                                                        | Lote:{" "}
                                                        {cuadrillaInfo.lote}
                                                    </span>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <DataTableJornalero
                                                columns={columns}
                                                data={jornaleros}
                                            />
                                            {cuadrillaId !==
                                                "sin_cuadrilla" && (
                                                <div className="mt-4 text-right">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleViewCuadrilla(
                                                                parseInt(
                                                                    cuadrillaId
                                                                )
                                                            )
                                                        }
                                                    >
                                                        Administrar Cuadrilla
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            }
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Jornaleros
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {jornaleros.length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {jornalerosActivos} activos
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Asignados a Cuadrillas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {jornalerosAsignados}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {Math.round(
                                        (jornalerosAsignados /
                                            jornaleros.length) *
                                            100
                                    )}
                                    % del total
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Producción Total
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {produccionTotal.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {(
                                        produccionTotal /
                                        (jornalerosActivos || 1)
                                    ).toFixed(2)}{" "}
                                    promedio por jornalero
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Producción por Cuadrilla</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">
                                            Cuadrilla
                                        </th>
                                        <th className="text-left py-2">
                                            Integrantes
                                        </th>
                                        <th className="text-left py-2">
                                            Producción Total
                                        </th>
                                        <th className="text-left py-2">
                                            Promedio por Jornalero
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cuadrillas.map((cuadrilla) => {
                                        const jornalerosEnCuadrilla =
                                            jornaleros.filter(
                                                (j) =>
                                                    j.cuadrilla_id ===
                                                    cuadrilla.id
                                            );
                                        const produccionCuadrilla =
                                            jornalerosEnCuadrilla.reduce(
                                                (total, j) =>
                                                    total +
                                                    (Number(
                                                        j.produccion_jornalero
                                                    ) || 0),
                                                0
                                            );
                                        const promedio =
                                            jornalerosEnCuadrilla.length
                                                ? (
                                                      produccionCuadrilla /
                                                      jornalerosEnCuadrilla.length
                                                  ).toFixed(2)
                                                : "N/A";

                                        return (
                                            <tr
                                                key={cuadrilla.id}
                                                className="border-b"
                                            >
                                                <td className="py-2">
                                                    {getLiderName(
                                                        cuadrilla.lider_cuadrilla_id
                                                    )}{" "}
                                                    - Lote: {cuadrilla.lote}
                                                </td>
                                                <td className="py-2">
                                                    {
                                                        jornalerosEnCuadrilla.length
                                                    }
                                                </td>
                                                <td className="py-2">
                                                    {produccionCuadrilla.toFixed(
                                                        2
                                                    )}
                                                </td>
                                                <td className="py-2">
                                                    {promedio}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal for deleting jornalero */}
            <DeleteConfirmationModal
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Confirmar Eliminación"
                itemName={jornaleroToDelete?.nombre}
                description="¿Estás seguro de que deseas desactivar al jornalero?"
                onConfirm={confirmDelete}
                loading={isDeleting}
            />

            {/* Modal for editing jornalero */}
            <FormModal
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                title="Editar Jornalero"
                description="Actualice la información del jornalero"
                maxWidth="max-w-xl"
            >
                {selectedJornalero && (
                    <JornaleroForm
                        jornaleroId={selectedJornalero.id}
                        onSuccess={() => {
                            fetchJornaleros();
                            fetchJornalerosInactivos();
                            fetchCuadrillas();
                            setShowEditDialog(false);
                        }}
                    />
                )}
            </FormModal>

            {/* Modal for viewing cuadrilla */}
            <CuadrillaViewModal
                open={showCuadrillaDialog}
                onOpenChange={setShowCuadrillaDialog}
                cuadrillaId={selectedCuadrillaId ?? undefined}
                onClose={() => setShowCuadrillaDialog(false)}
            />

            {/* Modal for reactivating jornalero */}
            <ReactivateConfirmationModal
                open={showReactivateDialog}
                onOpenChange={setShowReactivateDialog}
                title="Confirmar Reactivación"
                itemName={jornaleroToReactivate?.nombre}
                description="¿Estás seguro de que deseas reactivar al jornalero? El jornalero volverá a estar disponible para asignaciones."
                onConfirm={confirmReactivate}
                loading={isReactivating}
            />
        </div>
    );
}