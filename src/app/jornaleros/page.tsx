"use client";

import { useState, useEffect } from "react";
import { JornaleroForm } from "@/components/forms/JornaleroForm";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { DataTable } from "@/components/ui/data-table";
import { createColumns, createInactiveColumns } from "./columsTableJornalero";
import { Button } from "@/components/ui/button";
import { CuadrillaJornaleros } from "@/components/CuadrillaJornaleros";
import { Jornalero } from "@/api/jornalero_api";
import { Edit, Trash, UserPlus, AlertTriangle } from "lucide-react";
import { 
    DeleteConfirmationModal, 
    FormModal, 
    ReactivateConfirmationModal, 
    CuadrillaViewModal 
} from "@/components/modals";
import { PageLayout, FormSection, DataSection } from "@/components/layout";
import { useCrudOperations } from "@/hooks/useCrudOperations";

export default function JornalerosPage() {
    const { 
        fetchJornaleros, 
        jornaleros, 
        deleteJornalero, 
        fetchJornalerosInactivos, 
        jornalerosInactivos, 
        reactivateJornalero 
    } = useJornaleroStore();
    
    const { fetchCuadrillas, cuadrillas } = useCuadrillaStore();
    const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<number | null>(null);
    const [showCuadrillaDialog, setShowCuadrillaDialog] = useState(false);

    const crud = useCrudOperations<Jornalero>({
        fetchData: async () => {
            await fetchJornaleros();
            await fetchJornalerosInactivos();
            await fetchCuadrillas();
        },
        deleteFunction: deleteJornalero,
        reactivateFunction: reactivateJornalero,
        entityName: "Jornalero",
    });

    useEffect(() => {
        crud.handleFormSuccess();
    }, []);

    const handleViewCuadrilla = (cuadrillaId: number) => {
        setSelectedCuadrillaId(cuadrillaId);
        setShowCuadrillaDialog(true);
    };

    const columns = createColumns({
        handleEdit: (id: number) => {
            const jornalero = jornaleros.find((j) => j.id === id);
            if (jornalero) crud.handleEdit(jornalero);
        },
        handleDelete: (id: number) => {
            const jornalero = jornaleros.find((j) => j.id === id);
            if (jornalero) crud.handleDelete(jornalero);
        },
        handleViewCuadrilla,
    });

    const inactiveColumns = createInactiveColumns({
        handleReactivate: (id: number) => {
            const jornalero = jornalerosInactivos.find((j) => j.id === id);
            if (jornalero) crud.handleReactivate(jornalero);
        },
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
        const key = jornalero.cuadrilla_id ? `${jornalero.cuadrilla_id}` : "sin_cuadrilla";
        if (!jornalerosByCuadrilla[key]) {
            jornalerosByCuadrilla[key] = [];
        }
        jornalerosByCuadrilla[key].push(jornalero);
    });

    // Calculate production stats - removed individual production calculation
    const jornalerosActivos = jornaleros.filter((j) => j.estado === "Activo").length;
    const jornalerosAsignados = jornaleros.filter((j) => j.cuadrilla_id !== null).length;
    const jornalerosInactivosCount = jornalerosInactivos.length;

    const tabs = [
        {
            value: "todos",
            label: "Activos",
            content: (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <FormSection 
                        title="Agregar Nuevo Jornalero"
                        description="Registra un nuevo jornalero en el sistema"
                        className="lg:col-span-1"
                    >
                        <JornaleroForm onSuccess={crud.handleFormSuccess} />
                    </FormSection>

                    <DataSection 
                        title="Lista de Jornaleros Activos" 
                        description={`${jornalerosActivos} jornaleros activos registrados`}
                        className="lg:col-span-2"
                    >
                        <DataTable
                            columns={columns}
                            data={jornaleros}
                            searchKey="nombre"
                            searchPlaceholder="Buscar por nombre..."
                            emptyMessage="No hay jornaleros activos registrados"
                        />
                    </DataSection>
                </div>
            ),
        },
        {
            value: "inactivos",
            label: "Inactivos",
            content: (
                <DataSection 
                    title="Jornaleros Inactivos" 
                    description={`${jornalerosInactivosCount} jornaleros inactivos`}
                >
                    <DataTable
                        columns={inactiveColumns}
                        data={jornalerosInactivos}
                        searchKey="nombre"
                        searchPlaceholder="Buscar por nombre..."
                        emptyMessage="No hay jornaleros inactivos"
                    />
                </DataSection>
            ),
        },
        {
            value: "cuadrillas",
            label: "Por Cuadrilla",
            content: (
                <div className="space-y-6">
                    {Object.entries(jornalerosByCuadrilla).map(([cuadrillaId, jornaleros]) => {
                        const cuadrillaName = cuadrillaId === "sin_cuadrilla" 
                            ? "Sin Cuadrilla Asignada"
                            : cuadrillas.find(c => c.id === parseInt(cuadrillaId))?.lote || `Cuadrilla ${cuadrillaId}`;

                        const cuadrilla = cuadrillas.find(c => c.id === parseInt(cuadrillaId));
                        const liderName = cuadrilla ? getLiderName(cuadrilla.lider_cuadrilla_id) : "N/A";

                        return (
                            <DataSection
                                key={cuadrillaId}
                                title={cuadrillaName}
                                description={`${jornaleros.length} jornaleros | Líder: ${liderName}`}
                                actions={
                                    cuadrillaId !== "sin_cuadrilla" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewCuadrilla(parseInt(cuadrillaId))}
                                        >
                                            Administrar Cuadrilla
                                        </Button>
                                    )
                                }
                            >
                                <DataTable
                                    columns={columns}
                                    data={jornaleros}
                                    showSearch={false}
                                    emptyMessage="No hay jornaleros en esta cuadrilla"
                                />
                            </DataSection>
                        );
                    })}
                </div>
            ),
        },
        {
            value: "stats",
            label: "Estadísticas",
            content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DataSection title="Jornaleros Activos" description="Trabajadores disponibles">
                        <div className="text-3xl font-bold text-blue-600">
                            {jornalerosActivos}
                        </div>
                    </DataSection>

                    <DataSection title="Jornaleros Asignados" description="Con cuadrilla asignada">
                        <div className="text-3xl font-bold text-purple-600">
                            {jornalerosAsignados}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                            {jornalerosActivos > 0 
                                ? `${((jornalerosAsignados / jornalerosActivos) * 100).toFixed(1)}% del total`
                                : "0% del total"
                            }
                        </div>
                    </DataSection>

                    <DataSection 
                        title="Jornaleros Inactivos" 
                        description="Jornaleros que no trabajan actualmente"
                        className="md:col-span-3"
                    >
                        <div className="text-3xl font-bold text-red-600">
                            {jornalerosInactivosCount}
                        </div>
                    </DataSection>
                </div>
            ),
        },
    ];

    return (
        <>
            <PageLayout
                title="Gestión de Jornaleros"
                description="Administre jornaleros y asígnelos a cuadrillas"
                tabs={tabs}
                defaultTab="todos"
            >
                {/* This children prop is required but content is handled by tabs */}
                <div />
            </PageLayout>

            {/* Modals */}
            <DeleteConfirmationModal
                open={crud.showDeleteDialog}
                onOpenChange={crud.setShowDeleteDialog}
                title="Confirmar Eliminación"
                itemName={crud.entityToDelete?.nombre}
                description="¿Estás seguro de que deseas desactivar al jornalero?"
                onConfirm={crud.confirmDelete}
                loading={crud.isDeleting}
            />

            <FormModal
                open={crud.showEditDialog}
                onOpenChange={crud.setShowEditDialog}
                title="Editar Jornalero"
                description="Actualice la información del jornalero"
                maxWidth="max-w-xl"
            >
                {crud.selectedEntity && (
                    <JornaleroForm
                        jornaleroId={crud.selectedEntity.id}
                        onSuccess={crud.handleFormSuccess}
                    />
                )}
            </FormModal>

            <CuadrillaViewModal
                open={showCuadrillaDialog}
                onOpenChange={setShowCuadrillaDialog}
                cuadrillaId={selectedCuadrillaId ?? undefined}
                onClose={() => setShowCuadrillaDialog(false)}
            />

            <ReactivateConfirmationModal
                open={crud.showReactivateDialog}
                onOpenChange={crud.setShowReactivateDialog}
                title="Confirmar Reactivación"
                itemName={crud.entityToReactivate?.nombre}
                description="¿Estás seguro de que deseas reactivar al jornalero?"
                onConfirm={crud.confirmReactivate}
                loading={crud.isReactivating}
            />
        </>
    );
}