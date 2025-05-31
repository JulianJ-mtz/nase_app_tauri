"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Calendar, FileSpreadsheet, UserRound, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormModal } from "@/components/modals";
import { JornaleroForm, TemporadaForm } from "@/components/forms";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { useTemporadaStore } from "@/lib/storeTemporada";
import { DataTableJornalero } from "../jornaleros/dataTableJonalero";
import { createColumns } from "../jornaleros/columsTableJornalero";

export default function Record() {
    const [isJornaleroDialogOpen, setIsJornaleroDialogOpen] = useState(false);
    const [isTemporadaDialogOpen, setIsTemporadaDialogOpen] = useState(false);
    const [editJornaleroId, setEditJornaleroId] = useState<number | undefined>(undefined);

    const { jornaleros, loading: jornalerosLoading, error: jornalerosError, fetchJornaleros, deleteJornalero } = useJornaleroStore();
    const { temporadas, loading: temporadasLoading, fetchTemporadas } = useTemporadaStore();

    const handleEditJornalero = (id: number) => {
        setEditJornaleroId(id);
        setIsJornaleroDialogOpen(true);
    };

    const handleJornaleroSuccess = () => {
        setIsJornaleroDialogOpen(false);
        setEditJornaleroId(undefined);
        fetchJornaleros();
    };

    const handleTemporadaSuccess = () => {
        setIsTemporadaDialogOpen(false);
        fetchTemporadas();
    };

    const handleDeleteJornalero = async (id: number) => {
        try {
            await deleteJornalero(id);
        } catch (error) {
            console.error("Error deleting jornalero:", error);
        }
    };

    const columns = createColumns({ 
        handleEdit: handleEditJornalero, 
        handleDelete: handleDeleteJornalero 
    });

    useEffect(() => {
        fetchJornaleros();
        fetchTemporadas();
    }, [fetchJornaleros, fetchTemporadas]);

    // Get active temporadas
    const activeTemporadas = temporadas.filter(t => 
        !t.fecha_final || new Date(t.fecha_final) >= new Date()
    );

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-3xl font-bold">
                    Gestión de Producción
                </h1>
                <p className="text-sm text-muted-foreground">
                    Administra temporadas, jornaleros y registra producción siguiendo el flujo de trabajo.
                </p>
            </div>

            {/* Warning if no active temporadas */}
            {activeTemporadas.length === 0 && (
                <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No hay temporadas activas. Crea una temporada antes de registrar producción.
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="temporadas">Temporadas</TabsTrigger>
                    <TabsTrigger value="jornaleros">Jornaleros</TabsTrigger>
                    <TabsTrigger value="produccion">Producción</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Temporadas
                                </CardTitle>
                                <CardDescription>
                                    Gestiona las temporadas de trabajo
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="space-y-2">
                                    <p className="text-sm">Total: {temporadas.length}</p>
                                    <p className="text-sm">Activas: {activeTemporadas.length}</p>
                                </div>
                            </CardContent>
                            <div className="p-6 pt-0 mt-auto">
                                <Button onClick={() => setIsTemporadaDialogOpen(true)} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Temporada
                                </Button>
                            </div>
                        </Card>

                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserRound className="h-5 w-5" />
                                    Jornaleros
                                </CardTitle>
                                <CardDescription>
                                    Gestiona los trabajadores
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="space-y-2">
                                    <p className="text-sm">Total: {jornaleros.length}</p>
                                    <p className="text-sm">Activos: {jornaleros.filter(j => j.estado === 'Activo').length}</p>
                                </div>
                            </CardContent>
                            <div className="p-6 pt-0 mt-auto">
                                <Button onClick={() => setIsJornaleroDialogOpen(true)} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Jornalero
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
                                    Registra producción diaria
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm">Registra la producción diaria de cada jornalero, incluyendo variedad, tipo de uva, empaque y cliente.</p>
                            </CardContent>
                            <div className="p-6 pt-0 mt-auto">
                                <Button asChild className="w-full" disabled={activeTemporadas.length === 0}>
                                    <Link href="/record/produccion">
                                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                                        Registrar Producción
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="temporadas" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Nueva Temporada
                                    </CardTitle>
                                    <CardDescription>
                                        Crea una nueva temporada de trabajo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TemporadaForm onSuccess={handleTemporadaSuccess} />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Temporadas Registradas</CardTitle>
                                    <CardDescription>
                                        Lista de todas las temporadas ({temporadas.length} total)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {temporadasLoading ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-16 w-full" />
                                            <Skeleton className="h-16 w-full" />
                                        </div>
                                    ) : temporadas.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No hay temporadas registradas</p>
                                            <p className="text-sm">Crea la primera temporada para comenzar</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {temporadas.map((temporada) => (
                                                <Card key={temporada.id} className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-medium">Temporada {temporada.id}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {temporada.fecha_inicial} 
                                                                {temporada.fecha_final ? ` - ${temporada.fecha_final}` : ' - Activa'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {!temporada.fecha_final || new Date(temporada.fecha_final) >= new Date() ? (
                                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                                    Activa
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                                    Finalizada
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="jornaleros" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Jornaleros Registrados</CardTitle>
                                <CardDescription>
                                    Lista de todos los jornaleros ({jornaleros.length} total)
                                </CardDescription>
                            </div>
                            <Button onClick={() => setIsJornaleroDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Jornalero
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {jornalerosError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {jornalerosError.toString()}
                                </div>
                            )}

                            {jornalerosLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : jornaleros.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <UserRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay jornaleros registrados</p>
                                    <p className="text-sm">Agrega el primer jornalero para comenzar</p>
                                </div>
                            ) : (
                                <DataTableJornalero
                                    columns={columns}
                                    data={jornaleros}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="produccion" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                Registro de Producción
                            </CardTitle>
                            <CardDescription>
                                Registra la producción diaria de los jornaleros
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center py-8">
                            {activeTemporadas.length === 0 ? (
                                <div className="space-y-4">
                                    <AlertCircle className="h-16 w-16 mx-auto text-orange-500 opacity-50" />
                                    <div>
                                        <h3 className="text-lg font-medium">No hay temporadas activas</h3>
                                        <p className="text-muted-foreground">
                                            Para registrar producción, primero necesitas crear una temporada activa.
                                        </p>
                                    </div>
                                    <Button onClick={() => setIsTemporadaDialogOpen(true)}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Crear Temporada
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <FileSpreadsheet className="h-16 w-16 mx-auto text-primary opacity-50" />
                                    <div>
                                        <h3 className="text-lg font-medium">¿Listo para registrar producción?</h3>
                                        <p className="text-muted-foreground">
                                            Registra la producción diaria de cada jornalero con todos los detalles necesarios.
                                        </p>
                                    </div>
                                    <Button asChild size="lg">
                                        <Link href="/record/produccion">
                                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                                            Ir al Registro de Producción
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal for Jornalero */}
            <FormModal
                open={isJornaleroDialogOpen}
                onOpenChange={setIsJornaleroDialogOpen}
                title={editJornaleroId ? "Editar" : "Nuevo"} 
                description={editJornaleroId ? "Actualiza la información del jornalero" : "Introduce los datos del nuevo jornalero"}
            >
                <JornaleroForm
                    jornaleroId={editJornaleroId}
                    onSuccess={handleJornaleroSuccess}
                />
            </FormModal>

            {/* Modal for Temporada */}
            <FormModal
                open={isTemporadaDialogOpen}
                onOpenChange={setIsTemporadaDialogOpen}
                title="Nueva Temporada"
                description="Crea una nueva temporada de trabajo definiendo las fechas de inicio y fin"
            >
                <TemporadaForm onSuccess={handleTemporadaSuccess} />
            </FormModal>
        </div>
    );
}
