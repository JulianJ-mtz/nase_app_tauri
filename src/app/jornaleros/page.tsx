"use client";

import { useState } from "react";
import { JornaleroForm } from "@/components/JornaleroForm";
import { Separator } from "@/components/ui/separator";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useEffect } from "react";
import { DataTableJornalero } from "../record/dataTableJonalero";
import { createColumns } from "../record/columsTableJornalero";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CuadrillaJornaleros } from "@/components/CuadrillaJornaleros";
import { Jornalero } from "@/api/jornalero_api";
import { toast } from "sonner";
import { Edit, Trash, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JornalerosPage() {
    const { fetchJornaleros, jornaleros, deleteJornalero } =
        useJornaleroStore();
    const { fetchCuadrillas, cuadrillas } = useCuadrillaStore();

    const [selectedJornalero, setSelectedJornalero] =
        useState<Jornalero | null>(null);
    const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<
        number | null
    >(null);
    const [showCuadrillaDialog, setShowCuadrillaDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    useEffect(() => {
        fetchJornaleros();
        fetchCuadrillas();
    }, [fetchJornaleros, fetchCuadrillas]);

    const handleEdit = (id: number) => {
        const jornalero = jornaleros.find((j) => j.id === id);
        if (jornalero) {
            setSelectedJornalero(jornalero);
            setShowEditDialog(true);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm("¿Estás seguro de eliminar este jornalero?")) {
            deleteJornalero(id)
                .then(() => toast.success("Jornalero eliminado con éxito"))
                .catch((error) => toast.error("Error al eliminar jornalero"));
        }
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
                        <TabsTrigger value="todos">Todos</TabsTrigger>
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
                                        onSuccess={fetchJornaleros}
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
                                                        {
                                                            cuadrillaInfo.LiderCuadrilla
                                                        }{" "}
                                                        | Lote:{" "}
                                                        {cuadrillaInfo.Lote} |
                                                        {/* Variedad:{" "}
                                                        {cuadrillaInfo.Variedad} */}
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
                                                    {cuadrilla.LiderCuadrilla}
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

            {/* Dialog for editing jornalero */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Jornalero</DialogTitle>
                        <DialogDescription>
                            Actualice la información del jornalero
                        </DialogDescription>
                    </DialogHeader>
                    {selectedJornalero && (
                        <JornaleroForm
                            jornaleroId={selectedJornalero.id}
                            onSuccess={() => {
                                fetchJornaleros();
                                setShowEditDialog(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog for viewing cuadrilla */}
            <Dialog
                open={showCuadrillaDialog}
                onOpenChange={setShowCuadrillaDialog}
            >
                <DialogContent className="max-w-4xl">
                    <DialogTitle>Cuadrilla</DialogTitle>
                    {selectedCuadrillaId && (
                        <CuadrillaJornaleros
                            cuadrillaId={selectedCuadrillaId}
                            onClose={() => setShowCuadrillaDialog(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
